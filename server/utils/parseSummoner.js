export async function parseSummoner(summonerDoc) {
   const val = 50
   let updateIds
   if (summonerDoc.lastMatchId) {
      updateIds = new Set()
   }

   const [matchlist, challenges] = await Promise.all([
      getSummonerMatches(summonerDoc._id, summonerDoc.region, summonerDoc.lastMatchId),
      getPlayerChallenges(summonerDoc._id, summonerDoc.region)
   ])

   if (!matchlist.length) { // summoner already UTD
      return 204
   }

   // preliminaries
   summonerDoc.challenges = challenges
   summonerDoc.parse.total = matchlist.length
   summonerDoc.parse.status = config.status.PARSING
   summonerDoc.save()

   for (let i = 0; i < matchlist.length; i += val) {
      const matches = await getBatchedMatchInfo(matchlist.slice(i, i + val), summonerDoc.region)
      const timelines = await getBatchedTimelineInfo(matchlist.slice(i, i + val), summonerDoc.region)
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

         const player = zip[j][0].info.participants.find(p => p.puuid === summonerDoc._id)
         let champContainer = summonerDoc.championData.find(c => c.championId === player.championId)

         if (!champContainer) {
            summonerDoc.championData.push({ championId: player.championId })
            champContainer = summonerDoc.championData.find(c => c.championId === player.championId)
         }

         const teamfightData = parseTimeline(player, zip[j][1], items)
         const champId = await parseMatch(summonerDoc._id, player, zip[j][0], teamfightData, champContainer)

         if (updateIds) {
            updateIds.add(champId)
         }

         if ((i + j) % 25 === 0) {
            summonerDoc.parse.current = (i + j)
            await summonerDoc.save()
            console.log(`${summonerDoc.gameName}#${summonerDoc.tagLine} (${summonerDoc.region}) [${i + j}/${matchlist.length}]`)
         }
      }
   }

   await summonerDoc.save()

   // champion averages
   for (const champion of summonerDoc.championData) {
      if (updateIds && !updateIds.has(champion.championId)) continue
      const matches = await SummonerMatchesModel.find({ '_id': { $in: champion.matches } })

      let proxy = {
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

      champion.avg = proxy
   }

   summonerDoc.parse.status = config.status.COMPLETE
   summonerDoc.updated = Date.now()
   await summonerDoc.save()
}

async function parseMatch(id, player, match, teamfightData, champContainer) {
   const matchDocument = new SummonerMatchesModel({
         m: id,
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

   champContainer.wins += (player.win) ? 1 : 0
   champContainer.games += 1
   champContainer.tg += match.info.participants.find(p => p.teamId !== player.teamId).turretsLost
   champContainer.tl += player.turretsLost
   champContainer.ddtt += player.damageDealtToTurrets
   champContainer.fbk += player.firstBloodKill
   // color-side wins
   champContainer.bw += (player.teamId === 100 && player.win) ? 1 : 0
   champContainer.rw += (player.teamId === 200 && player.win) ? 1 : 0
   // color-side games
   champContainer.rsg += (player.teamId === 200) ? 1 : 0
   // multikills
   champContainer.mk.t += player.tripleKills
   champContainer.mk.q += player.quadraKills
   champContainer.mk.p += player.pentaKills
   // champion spells
   champContainer.sc.q += player.spell1Casts
   champContainer.sc.w += player.spell2Casts
   champContainer.sc.e += player.spell3Casts
   champContainer.sc.r += player.spell4Casts
   // summoner spells
   champContainer.ss[player.summoner1Id].games++
   champContainer.ss[player.summoner1Id].casts += player.summoner1Casts
   champContainer.ss[player.summoner2Id].games++
   champContainer.ss[player.summoner2Id].casts += player.summoner2Casts
   // pings
   champContainer.p.all += player.allInPings
   champContainer.p.assist += player.assistMePings
   champContainer.p.basic += player.basicPings
   champContainer.p.comm += player.commandPings
   champContainer.p.danger += player.dangerPings
   champContainer.p.enMiss += player.enemyMissingPings
   champContainer.p.enVis += player.enemyVisionPings
   champContainer.p.back += player.getBackPings
   champContainer.p.hold += player.holdPings
   champContainer.p.vis += player.needVisionPings
   champContainer.p.omw += player.onMyWayPings
   champContainer.p.push += player.pushPings
   champContainer.p.visClr += player.visionClearedPings
   champContainer.matches.push(matchDocument._id)

   if (teamfightData) {
      // Average it out on the front end (datum / games)
      for (let i = 0; i < 6; i++) {
         matchDocument.ic[i] = Math.round((matchDocument.ic[i] + teamfightData.ic[i]) * 100) / 100
      }

      champContainer.tf.exp += teamfightData.exp
      champContainer.tf.cap += teamfightData.cap
      champContainer.tf.use += teamfightData.use
      champContainer.tf.death += teamfightData.death
      champContainer.tf.part += teamfightData.part
      champContainer.tf.freq += teamfightData.freq
   }

   const participantPuuids = []

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
      .catch(e => { throw e })

   await matchDocument.save()
   return player.championId
}

function parseTimeline(player, timeline, items) {
   const CONTIGUITY = 5000
   const AVG_TEAMFIGHT_DISTANCE = 1300
   const BUILDING_KILL_WINDOW = 30000
   let teamfightData = {
      ic: [0, 0, 0, 0, 0, 0],
      exp: 0,   // expectation
      cap: 0,   // capitalization
      use: 0,   // usefullness
      death: 0, // death probability
      part: 0,  // participation
      freq: 0,  // frequency
   }
   let teamfights = []
   let bin = []
   let initTimestamp
   let capFlag
   let tfPrerequisite = 0

   //  ITER FRAMES
   for (let i = 0; i < timeline.info.frames.length; i++) {
      let e = timeline.info.frames[i].events

      // ITER EVENTS
      for (let j = 0; j < e.length; j++) {
         if (e[j].type === 'ITEM_PURCHASED' && player.participantId === e[j].participantId) {

            if (items && isLegendary(e[j].itemId, items)) {
               for (let i = 0; i < 6; i++) {
                  if (teamfightData.ic[i] > 0) continue
                  teamfightData.ic[i] = Math.round(e[j].timestamp / 600) / 100
                  break
               }
            }
         }

         if (e[j].timestamp - capFlag <= BUILDING_KILL_WINDOW && e[j].type === 'BUILDING_KILL' && e[j].teamId !== player.teamId) {
            teamfightData.cap++
            capFlag = undefined
         }

         if (e[j].timestamp - initTimestamp > CONTIGUITY) {
            if (tfPrerequisite > 1 && bin.length > 3 && averageDistance(bin) < AVG_TEAMFIGHT_DISTANCE) {
               teamfights.push(bin)
               capFlag = e[j].timestamp
            }

            tfPrerequisite = 0
            initTimestamp = undefined
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
   teamfightData.freq = teamfights.length

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

      // ITER TEAMFIGHT EVENTS
      for (let j = 0; j < teamfights[i].length; j++) {
         const cell = teamfights[i][j]

         if (('assistingParticipantIds' in cell
            && cell.assistingParticipantIds[player.participantId])
            || cell.killerId === player.participantId
            || cell.victimId === player.participantId) {

            // Participation
            part = true

            // Expectation
            if ((player.participantId <= 5 && cell.killerId <= 5) || (player.participantId > 5 && cell.killerId > 5)) {
               teamfightData.exp++
            } else {
               teamfightData.exp--

               // Usefullness/Longevity
               use.push(cell.victimId)
            }

            // Death Probability
            if (cell.victimId === player.participantId) death = true
         }
      }

      if (part) {
         // Participation
         teamfightData.part++

         // Usefullness/Longevity
         teamfightData.use += (use.findIndex(o => o === player.participantId) + 1) || 6
      }

      if (death) teamfightData.death++
   }

   return teamfightData
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
      Legendary
         - Item can't build into anything except an Ornn item (items >= 7000 or has requiredAlly: "ornn" in it) 
         - Item cost >= 2000
   */
   return (items[id].gold.total >= 2000 && (!items[id].into || (items[id].into && items[id].into >= 7000))) ? true : false
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