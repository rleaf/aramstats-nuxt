import { SummonerModel } from "~/server/utils/models/summonerModel"

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
   const potato = await parseSummoner(summonerDocument)

   if (potato === 204) {
      console.log(`[Already UTD]: ${query.gameName}#${query.tagLine} (${query.region})`)
      summonerDocument.updated = new Date()
      summonerDocument.gameName = summoner.gameName
      summonerDocument.tagLine = summoner.tagLine
      summonerDocument.profileIcon = summoner.profileIconId
      await summonerDocument.save()
      return { status: 204 }   
   }
   
   return { status: 200, payload: (await aggregateSummoner(summoner.puuid))[0] }
})