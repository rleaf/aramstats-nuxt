import { deleteSummoner } from "~/server/utils/ratsNest"

export default defineEventHandler(async (e) => {
   const queue = new Queue()
   let summoner
   
   const routerParams = getRouterParams(e)
   console.log(`[Searching]: ${routerParams.gameName}#${routerParams.tagLine} (${routerParams.region})`)

   try {
      summoner = await getSummonerStatus(routerParams.gameName, routerParams.tagLine, routerParams.region)
   } catch (e) {
      return createError({
         status: e.status,
         statusMessage: (e.status === 404) ? config.STATUS_DNE : e.message
      })
   }

   switch (summoner.parse.status) {
      case config.STATUS_COMPLETE:
         console.log('SUMMONER FOUND')
         return { status: config.STATUS_COMPLETE, data: (await aggregateSummoner(summoner._id))[0] }
         // return (await aggregateSummoner(summoner._id))[0]

      case config.STATUS_PARSING:
         if (queue.inactiveRegions.has(routerParams.region)) {
            console.log('SUMMONER DELETED')
            await deleteSummoner(summoner._id)
            throw createError({
               status: 404,
               statusMessage: config.STATUS_DELETED
            })
         } else {
            console.log(summoner, 'yer')
            console.log(`[In Queue]: ${routerParams.gameName}#${routerParams.tagLine} (${routerParams.region})`)
            const queuePosition = await queue.check(summoner.puuid, routerParams.region)
            workQueue(summoner)
            return { status: config.STATUS_PARSING, data: {...summoner.parse, queuePosition} }
            // return (queuePosition) ? { status: config.STATUS_IN_QUEUE, body: queuePosition } : { parse: summoner.parse }
         }

      case config.STATUS_UNPARSED:
         return config.STATUS_UNPARSED

      default:
         throw createError({
            statusMessage: summoner.parse.status,
            message: 'Unknown status'
         })
   }
   
   return 'no dice'
})
