import { SummonerModel } from "~/server/models/summonerModel"

const queue = new Queue()

export default defineEventHandler(async (e) => {
   /* 
      User has requested a parse.
   */

   const body = await readBody(e)
   let summoner

   try {
      summoner = await findSummoner(body.gameName, body.tagLine, body.region)
   } catch(e) {
      if (e instanceof Error) {
         throw createError({
            status: e.status,
            statusMessage: e.body.status.message
         })
      }
   }

   try {
      await queue.add(summoner.puuid, summoner.region)
      await SummonerModel.create({
         _id: summoner.puuid,
         gameName: summoner.gameName,
         tagLine: summoner.tagLine,
         region: summoner.region,
         level: summoner.summonerLevel,
         profileIcon: summoner.profileIconId,
         parse: { status: config.STATUS_IN_QUEUE },
      })

      console.log(`[+ Queue]: ${summoner.gameName}#${summoner.tagLine} (${summoner.region})`)
   } catch (e) {
      if (e.code === 11000 && e instanceof Error) { // dup key
         throw createError({
            status: e.code,
            statusMessage: e.message
         })
      }
   }

   await workQueue(summoner)
   return 'toads'
})