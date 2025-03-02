import { SummonerModel } from "~/server/models/summonerModel"

export default defineEventHandler(async (e) => {
   /* 
      User has requested an update.
   */

   const query = getQuery(e)
   console.log(`[Updating]: ${query.gameName}#${query.tagLine} (${query.region})`)

   let summoner = await findSummoner(query.gameName, query.tagLine, query.region)
      .catch(() => {
         throw createError({
            status: e.status,
            statusMessage: e.body.status.message || e.status.message || e.message
         })
      })

   const summonerDocument = await SummonerModel.findById(summoner.puuid)

   const [matchlist, challenges] = await Promise.all([
      getAllSummonerMatches(summoner.puuid, summoner.region, summonerDocument.lastMatchId),
      challengeScribe(summoner.puuid, summoner.region)
   ])

   if (!matchlist.length) {
      console.log(`[Already UTD]: ${query.gameName}#${query.tagLine} (${query.region})`)
      summonerDocument.updated = new Date()
      await summonerDocument.save()
      return { status: 204 }
   }
   
   console.log('updating summoner')
   summonerDocument.challenges = challenges
   summonerDocument.gameName = summoner.gameName
   summonerDocument.tagLine = summoner.tagLine
   summonerDocument.region = summoner.region
   summonerDocument.level = summoner.summonerLevel
   summonerDocument.profileIcon = summoner.profileIconId

   await initialParse(summonerDocument, matchlist)

   return (await aggregateSummoner(summoner.puuid))[0]
})