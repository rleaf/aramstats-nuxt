export async function parseSummoner(matchlist, update) {
   const val = 50

   // preliminaries
   summoner.challenges = challenges
   summoner.parse.total = matchlist.length
   summoner.parse.status = config.status.PARSING
   summoner.save()

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

         const champions = new Set()
         const player = zip[j][0].info.participants.find(p => p.puuid === summonerDoc._id)

         const tl = parseTimeline(player, zip[j][1], items)
         const id = parseMatch(player, zip[j][0], tl)

         if (update) {
            champions.add(id)
         }

         if ((i + j) % 25 === 0) {
            summonerDoc.parse.current = (i + j)
            await summonerDoc.save()
            console.log(`${summonerDoc.gameName}#${summonerDoc.tagLine} (${summonerDoc.region}) [${i + j}/${matchlist.length}]`)
         }
      }
   }
}

async function parseMatch(player, match, teamfightData) {
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
   championEmbed.matches.push(matchDocument._id)

   if (teamfightData) {
      // Average it out on the front end (datum / games)
      for (let i = 0; i < 6; i++) {
         matchDocument.ic[i] = Math.round((matchDocument.ic[i] + teamfightData.ic[i]) * 100) / 100
      }
      championEmbed.tf.exp += teamfightData.exp
      championEmbed.tf.cap += teamfightData.cap
      championEmbed.tf.use += teamfightData.use
      championEmbed.tf.death += teamfightData.death
      championEmbed.tf.part += teamfightData.part
      championEmbed.tf.freq += teamfightData.freq
      summonerDocument.fs += teamfightData.fs
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
      .catch(e => { throw e })

   await matchDocument.save()
   return player.championId
}

async function parseTimeline(player, timeline, items) {

   return teamfightData
}