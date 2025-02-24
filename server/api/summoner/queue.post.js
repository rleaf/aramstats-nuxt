import { SummonerModel } from "~/server/models/summoner_model"

export default defineEventHandler(async (e) => {
   /* 
      User has requested a parse.
   */

   const body = await readBody(e)
   let summoner

   try {
      await findSummoner(body.gameName, body.tagLine, body.region)
   } catch(e) {
      if (e instanceof Error) {
         throw createError({
            status: e.status,
            statusMessage: e.body.status.message
         })
      }
   }

   return summoner
   return 'toads'


})

async function workQueue(summoner) {
   /**
    * Queue management that works via baton passing.
    * Longterm, maybe more reliable to create a separate script that runs via cronjobs to ping the queue for a given region every ~minute. Can build this in python too.
   */

   const queue = new Queue()
   if (queue.inactiveRegions.has(summoner.region)) {
      let qSummoner = await queue.get(summoner.region)
      let document

      while (qSummoner) {
         queue.inactiveRegions.delete(summoner.region)

         try {
            document = await SummonerModel.findOne({ '_id': qSummoner.qPuuid })
            await queue.update(summoner.region)
            await initialParse(document)
            qSummoner = await queue.get(summoner.region)
            if (qSummoner) document = await SummonerModel.findOne({ '_id': qSummoner.qPuuid })
         } catch (e) {
            qSummoner = await queue.get(summoner.region)
            queue.inactiveRegions.add(summoner.region)
            throw e
            // console.log(e, 'rip bozo') // So I'm not scrolling for hours in prod
         }
      }

      console.log(`(${summoner.region}) Queue complete.`)
      queue.inactiveRegions.add(summoner.region)
   }
}