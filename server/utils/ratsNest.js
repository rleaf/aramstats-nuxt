import { SummonerModel } from "../models/summonerModel"
import { SummonerMatchesModel } from "../models/summonerMatchesModel"
import { PuuidModel } from "../models/puuidModel"
import { getPlayerChallenges } from "./twistedCalls"

export async function getSummonerStatus(gameName, tagLine, region) {
   let summoner = await findSummoner(gameName, tagLine, region)
   if (!summoner.puuid) throw { status_code: 404 }
   try {
      summoner = await SummonerModel.findById(summoner.puuid, {
         _id: 1, 
         parse: 1
      })
      
   } catch (e) { }
   return summoner || { parse: { status: config.status.UNPARSED}}
}

export async function findSummoner(gameName, tagLine, region) {
   const riotId = await getAccount(gameName, tagLine)
   const summoner = await getSummoner(riotId.puuid, region)
   
   return { ...riotId, ...summoner, region: region }
}

export async function deleteSummoner(puuid) {
   const summoner = await SummonerModel.findById(puuid)
   let bin = []

   for (const data of summoner.championData) {
      for (const match of data.matches) {
         bin.push({
            deleteOne: { filter: { _id: match } }
         })
      }
   }


   await SummonerMatchesModel.bulkWrite(bin)
   await SummonerModel.deleteOne({ _id: summoner._id })
}

export async function initialParse(summonerDoc, updateMatchlist) {
   let updatedChampions
   if (updateMatchlist) {
      updatedChampions = new Set()
   }
   const [matchlist, challenges] = await Promise.all([
      updateMatchlist || getAllSummonerMatches(summonerDoc._id, summonerDoc.region),
      challengeScribe(summonerDoc._id, summonerDoc.region)
   ])
   summonerDoc.challenges = challenges
   summonerDoc.parse.total = matchlist.length
   summonerDoc.parse.status = config.status.PARSING
   await summonerDoc.save()
   const VAL = 4
   for (let i = 0; i < matchlist.length; i += VAL) {
      const matches = await getBatchedMatchInfo(matchlist.slice(i, i + VAL), summonerDoc.region)
      const timelines = await getBatchedTimelineInfo(matchlist.slice(i, i + VAL), summonerDoc.region)
      const zip = matches.map((x, i) => [(x) ? x : undefined, (timelines[i]) ? timelines[i] : undefined])
      
      for (let j = 0; j < zip.length; j++) {
         // ARAM Remake window is 3 min. Make it +30s in case someone someone takes a long time to vote.
         if (!zip[j][0] || zip[j][0].info.gameDuration < 210) continue
         let patch
         let items

         if (i === 0) {
            if (j === 0) summonerDoc.lastMatchId = zip[j][0].metadata.matchId
            patch = zip[j][0].info.gameVersion.split('.').slice(0, 2).join('.')
            try {
               items = (await $fetch(`https://ddragon.leagueoflegends.com/cdn/${patch}.1/data/en_US/item.json`)).data
            } catch (e) { }
         } else if (patch !== zip[j][0].info.gameVersion.split('.').slice(0, 2).join('.')) {
            patch = zip[j][0].info.gameVersion.split('.').slice(0, 2).join('.')
            try {
               items = (await $fetch(`https://ddragon.leagueoflegends.com/cdn/${patch}.1/data/en_US/item.json`)).data
            } catch (e) { }
         }


         if ((i + j) % 25 === 0) {
            summonerDoc.parse.current = (i + j)
            await summonerDoc.save()
            console.log(`${summonerDoc.gameName}#${summonerDoc.tagLine} (${summonerDoc.region}) [${i + j}/${matchlist.length}]`)
         }

         const championId = await parseMatchlist(summonerDoc, zip[j][0], zip[j][1], items)
         if (updatedChampions) {
            updatedChampions.add(championId)
         }

      }
   }

   await summonerDoc.save()
   await computeChampionAverages(summonerDoc, updatedChampions)
}

const challengeIds = [
   101105, // No hiding
   101204, // Free Money
   101205, // Free Ticket to Base
   101206, // Pop Goes the Poro
   101306, // Can't Touch This
   101201, // Another Day, Another Bullseye
   101203, // Snow Day
   101000, // Aram Authority
   101100, // Aram Warrior
   101200, // Aram Finesse
   101300, // Aram Champion
   101103, // Aram Legend
   101106, // ARAM Eradication
   101301, // All Random All Champions
   101305, // Active Participant
   101302, // All Random All Flawless
   101104, // Bad Medicine
   101107, // Farm Champs Not Minions
   101303, // Rapid Demolition
   101101, // DPS Threat
   101102, // Double Decimation
   101304, // Lightning Round
   101108, // Solo Carry
   101307, // NA-RAM
   101202, // It was a... Near-Hit
]

export async function challengeScribe(puuid, region) {
   const challengesDto = await getPlayerChallenges(puuid, region)
   const challenges = challengesDto.challenges.filter(el => challengeIds.includes(el.challengeId))

   return challenges
}

async function parseMatchlist(summonerDocument, match, timeline, items) {
   let timelineData
   let playerIndex
   let playerTeam
   let player
   let championEmbed
   let participantPuuids = []

   if (!match) console.log(match, 'wut in tarnation')

   // https://leagueoflegends.fandom.com/wiki/Surrendering (ctrl+f "early") Don't use gameEndedInEarlySurrender. It is neq to a remake.
   player = match.info.participants.find(p => p.puuid === summonerDocument._id)
   playerIndex = player.participantId
   playerTeam = player.teamId
   if (timeline) timelineData = parseTimeline(timeline, playerIndex, playerTeam, items)

   const matchDocument = new SummonerMatchesModel({
      m: summonerDocument._id,
      mId: match.metadata.matchId,
      gc: match.info.gameCreation,
      gd: (match.info.gameEndTimestamp) ? (match.info.gameDuration / 60).toFixed(1) : (match.info.gameDuration / 60000).toFixed(1),
      gv: match.info.gameVersion,
      w: player.win,
      k: player.kills,
      d: player.deaths,
      tsd: player.totalTimeSpentDead,
      a: player.assists,
      kp: getKillParticipation(player, match.info.participants),
      ds: getDamageShare(player, match.info.participants),
      i: getMatchItems(player),
      s1: player.summoner1Id,
      s2: player.summoner2Id,
      pr: player.perks.styles[0].selections[0].perk,
      sr: player.perks.styles[1].style,
      t: {
         dtc: player.totalDamageDealtToChampions,
         dt: player.totalDamageTaken,
         sm: player.damageSelfMitigated,
         h: player.totalHeal,
         as: player.totalDamageShieldedOnTeammates,
         ah: player.totalHealsOnTeammates,
         g: player.goldEarned
      },
      mk: [
         player.tripleKills,
         player.quadraKills,
         player.pentaKills,
      ],
      tId: player.teamId,
   })

   championEmbed = summonerDocument.championData.find(c => c.championId === player.championId)
   if (!championEmbed) {
      summonerDocument.championData.push({ championId: player.championId })
      championEmbed = summonerDocument.championData.find(c => c.championId === player.championId)
   }

   championEmbed.wins += (player.win) ? 1 : 0
   championEmbed.games += 1
   championEmbed.tg += match.info.participants.find(p => p.teamId !== player.teamId).turretsLost
   championEmbed.tl += player.turretsLost
   championEmbed.ddtt += player.damageDealtToTurrets
   championEmbed.fbk += player.firstBloodKill
   // color-side wins
   championEmbed.bw += (player.teamId === 100 && player.win) ? 1 : 0
   championEmbed.rw += (player.teamId === 200 && player.win) ? 1 : 0
   // color-side games
   championEmbed.rsg += (player.teamId === 200) ? 1 : 0
   // multikills
   championEmbed.mk.t += player.tripleKills
   championEmbed.mk.q += player.quadraKills
   championEmbed.mk.p += player.pentaKills
   // champion spells
   championEmbed.sc.q += player.spell1Casts
   championEmbed.sc.w += player.spell2Casts
   championEmbed.sc.e += player.spell3Casts
   championEmbed.sc.r += player.spell4Casts
   // summoner spells
   championEmbed.ss[player.summoner1Id].games++
   championEmbed.ss[player.summoner1Id].casts += player.summoner1Casts
   championEmbed.ss[player.summoner2Id].games++
   championEmbed.ss[player.summoner2Id].casts += player.summoner2Casts
   // pings
   championEmbed.p.all += player.allInPings
   championEmbed.p.assist += player.assistMePings
   championEmbed.p.basic += player.basicPings
   championEmbed.p.comm += player.commandPings
   championEmbed.p.danger += player.dangerPings
   championEmbed.p.enMiss += player.enemyMissingPings
   championEmbed.p.enVis += player.enemyVisionPings
   championEmbed.p.back += player.getBackPings
   championEmbed.p.hold += player.holdPings
   championEmbed.p.vis += player.needVisionPings
   championEmbed.p.omw += player.onMyWayPings
   championEmbed.p.push += player.pushPings
   championEmbed.p.visClr += player.visionClearedPings
   // championEmbed.matches.unshift(matchDocument._id)
   championEmbed.matches.push(matchDocument._id)

   if (timelineData) {
      // Average it out on the front end (datum / games)
      for (let i = 0; i < 6; i++) {
         matchDocument.ic[i] = Math.round((matchDocument.ic[i] + timelineData.ic[i]) * 100) / 100
      }
      championEmbed.tf.exp += timelineData.exp
      championEmbed.tf.cap += timelineData.cap
      championEmbed.tf.use += timelineData.use
      championEmbed.tf.death += timelineData.death
      championEmbed.tf.part += timelineData.part
      championEmbed.tf.freq += timelineData.freq
      summonerDocument.fs += timelineData.fs
   }

   for (const participant of match.info.participants) {
      if (!participant.riotIdGameName) continue
      participantPuuids.push({
         updateOne: {
            filter: { _id: participant.puuid },
            update: {
               _id: participant.puuid,
               gn: participant.riotIdGameName,
               tl: participant.riotIdTagline,
            },
            upsert: true
         }
      })

      if (participant.puuid != player.puuid) {
         if (player.teamId === participant.teamId) {
            matchDocument.te.push(participant.puuid)
            matchDocument.tc.push(participant.championId)
         } else {
            matchDocument.ee.push(participant.puuid)
            matchDocument.ec.push(participant.championId)
         }
      }
   }

   await PuuidModel.bulkWrite(participantPuuids)
      .catch(e => {
         throw e
      })

   await matchDocument.save()
   return player.championId
}

function parseTimeline(timeline, playerIndex, playerTeam, items) {
   const CONTIGUITY = 5000
   const AVG_TEAMFIGHT_DISTANCE = 1300
   const BUILDING_KILL_WINDOW = 30000
   const FOUNTAIN_SITTING = 30000
   let timelineData = {
      ic: [0, 0, 0, 0, 0, 0],
      exp: 0,   // expectation
      cap: 0,   // capitalization
      use: 0,   // usefullness
      death: 0, // death probability
      part: 0,  // participation
      freq: 0,  // frequency
      fs: 1,    // fountain sitting
   }
   let teamfights = []
   let bin = []
   let initTimestamp
   let c1, c2
   let capFlag
   let tfPrerequisite = 0

   //  ITER FRAMES
   for (let i = 0; i < timeline.info.frames.length; i++) {
      let e = timeline.info.frames[i].events

      // ITER EVENTS
      for (let j = 0; j < e.length; j++) {
         if (e[j].type === 'ITEM_PURCHASED' && playerIndex === e[j].participantId) {
            if (timelineData.fs && e[j].timestamp < FOUNTAIN_SITTING) {
               timelineData.fs = 0
            }

            if (items && isLegendary(e[j].itemId, items)) {
               for (let i = 0; i < 6; i++) {
                  if (timelineData.ic[i] > 0) continue
                  timelineData.ic[i] = Math.round(e[j].timestamp / 600) / 100
                  break
               }
            }
         }
         // if (timelineData.fs && playerIndex === e[j].participantId && e[j].timestamp < FOUNTAIN_SITTING && e[j].type === 'ITEM_PURCHASED') {
         //    timelineData.fs = 0
         // }

         if (e[j].timestamp - capFlag <= BUILDING_KILL_WINDOW && e[j].type === 'BUILDING_KILL' && e[j].teamId !== playerTeam) {
            timelineData.cap++
            capFlag = undefined
         }

         if (e[j].timestamp - initTimestamp > CONTIGUITY) {
            if (tfPrerequisite > 1 && bin.length > 3 && averageDistance(bin) < AVG_TEAMFIGHT_DISTANCE) {
               teamfights.push(bin)
               capFlag = e[j].timestamp
            }

            tfPrerequisite = 0
            initTimestamp = c1 = c2 = undefined
            bin = []
         }

         if (e[j].type === 'CHAMPION_KILL') {
            if (e[j].timestamp - initTimestamp <= CONTIGUITY) {
               if ('assistingParticipantIds' in e[j] && e[j].assistingParticipantIds.length >= 2) tfPrerequisite++
               initTimestamp = e[j].timestamp
               bin.push(e[j])
            } else {
               if ('assistingParticipantIds' in e[j] && e[j].assistingParticipantIds.length >= 2) tfPrerequisite++

               if (!initTimestamp) {
                  initTimestamp = e[j].timestamp
                  bin.push(e[j])
               }
            }
         }
      }
   }

   // Frequency
   timelineData.freq = teamfights.length

   // ITER TEAMFIGHTS
   for (let i = 0; i < teamfights.length; i++) {
      let use = []
      let death = false
      let part = false

      // exp: 0,   // expectation
      // cap: 0,   // capitalization
      // use: 0,   // usefullness
      // death: 0, // death probability
      // part: 0,  // participation
      // freq: 0,  // frequency
      // fs: 1,    // fountain sitting

      // ITER TEAMFIGHT EVENTS
      for (let j = 0; j < teamfights[i].length; j++) {
         const cell = teamfights[i][j]

         if (('assistingParticipantIds' in cell
            && cell.assistingParticipantIds[playerIndex])
            || cell.killerId === playerIndex
            || cell.victimId === playerIndex) {

            // Participation
            part = true

            // Expectation
            if ((playerIndex <= 5 && cell.killerId <= 5) || (playerIndex > 5 && cell.killerId > 5)) {
               timelineData.exp++
            } else {
               timelineData.exp--

               // Usefullness/Longevity
               use.push(cell.victimId)
            }

            // Death Probability
            if (cell.victimId === playerIndex) death = true
         }
      }

      if (part) {
         // Participation
         timelineData.part++

         // Usefullness/Longevity
         timelineData.use += (use.findIndex(o => o === playerIndex) + 1) || 6
      }

      if (death) timelineData.death++
   }

   // Average out values since they're just iterating through and summing
   const af = (n, d) => (Math.round(n / d * 1000) / 1000)

   // if (timelineData.part) {
   //    timelineData.cap = af(timelineData.cap, timelineData.freq)      
   //    timelineData.exp = af(timelineData.exp, timelineData.part)
   //    timelineData.use = af(timelineData.use, timelineData.part)
   //    timelineData.death = af(timelineData.death, timelineData.part)
   // }
   return timelineData
}

function getKillParticipation(player, participants) {
   let total = 0
   participants.forEach((participant) => {
      if (participant.teamId === player.teamId) {
         total += participant.kills
      }
   })
   let kp = Math.round((player.kills + player.assists) / total * 100) / 100
   return kp || 0
}

function getDamageShare(player, participants) {
   let total = 0
   participants.forEach((participant) => {
      if (participant.teamId === player.teamId) {
         total += participant.totalDamageDealtToChampions
      }
   })

   let cowabunga = Math.round(player.totalDamageDealtToChampions / total * 100) / 100
   return cowabunga || 0
}

function getMatchItems(player) {
   let items = []

   for (let i = 0; i < 6; i++) {
      items.push(player[`item${i}`])
   }

   return items
}

function isLegendary(id, items) {
   /*
      Legendary classification
         - Item can't build into anything except an Ornn item (items >= 7000 or has requiredAlly: "ornn" in it) 
         - Item cost >= 2000
   */
   // if (items[id].into.length !== 0 || items[id].into.length !== 1) return false

   // if (items[id].gold.total >= 2000 && (!items[id].into || (items[id].into && items[items[id].into]) )) {
   // console.log(items[3031])

   if (items[id].gold.total >= 2000 && (!items[id].into || (items[id].into && items[id].into >= 7000))) {
      return true
   }

   return false
}

function averageDistance(bin) {
   bin = bin.map(x => ({ x: x.position.x, y: x.position.y }))

   let arr = []
   let avg
   for (let i = 0; i < bin.length; i++) {
      for (let j = i + 1; j < bin.length; j++) {
         arr.push(Math.sqrt(Math.pow(bin[i].x - bin[j].x, 2) + Math.pow(bin[i].y - bin[j].y, 2)))
      }
   }
   avg = arr.reduce((a, b) => a + b, 0) / arr.length
   return avg
}

async function computeChampionAverages(summonerDocument, championIds) {
   for (const champion of summonerDocument.championData) {
      let proxy

      if (championIds) {
         if (!championIds.has(champion.championId)) continue
         proxy = {
            "ahpm": 0,
            "a": 0,
            "dpm": 0,
            "ds": 0,
            "dtpm": 0,
            "d": 0,
            "ge": 0,
            "gpm": 0,
            "hpm": 0,
            "ah": 0,
            "as": 0,
            "kp": 0,
            "k": 0,
            "smpm": 0,
            "tdd": 0,
            "tdt": 0,
            "th": 0,
            "tsm": 0,
         }
      } else {
         proxy = champion.avg
      }

      const matches = await SummonerMatchesModel.find({ '_id': { $in: champion.matches } })

      for (const match of matches) {
         proxy.ahpm += Math.round(match.t.ah / match.gd)
         proxy.a += match.a
         proxy.dmg += match.t.dtc
         proxy.dpm += Math.round(match.t.dtc / match.gd)
         proxy.ds += match.ds * 100
         proxy.dtpm += Math.round(match.t.dt / match.gd)
         proxy.d += match.d
         proxy.ge += match.t.g
         proxy.gpm += Math.round(match.t.g / match.gd)
         proxy.hpm += Math.round(match.t.h / match.gd)
         proxy.ah += match.t.ah
         proxy.as += match.t.as
         proxy.kp += match.kp * 100
         proxy.k += match.k
         proxy.smpm += Math.round(match.t.sm / match.gd)
         proxy.tdd += match.t.dtc
         proxy.tdt += match.t.dt
         proxy.th += match.t.h
         proxy.tsm += match.t.sm
      }

      for (const [k, v] of Object.entries(proxy)) {
         proxy[k] = Math.round(v / matches.length)
      }

      if (championIds) champion.avg = proxy
   }

   summonerDocument.parse.status = config.status.COMPLETE
   summonerDocument.updated = Date.now()
   await summonerDocument.save()
}