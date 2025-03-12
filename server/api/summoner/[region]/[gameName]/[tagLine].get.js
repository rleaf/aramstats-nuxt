import { MongooseError } from "mongoose"

export default defineEventHandler(async (e) => {
   let summoner
   const routerParams = getRouterParams(e, { decode: true})
   console.log(`[Searching]: ${routerParams.gameName}#${routerParams.tagLine} (${routerParams.region})`)

   try {
      summoner = await getParseStatus(routerParams.gameName, routerParams.tagLine)
   } catch (e) {
      if (e instanceof MongooseError) {
         throw e
      } else {
         return {
            stage: config.status.DNE,
            data: e.body.status.message || e.body.message || e.message // some wild responses
         }
      }
   }

   const queue = new Queue()

   switch (summoner.parse.status) {
      case config.status.COMPLETE:
         console.log(`[Found]: ${routerParams.gameName}#${routerParams.tagLine} (${routerParams.region})`)
         return {
            stage: config.status.COMPLETE,
            data: (await aggregateSummoner(summoner._id))[0]
         }

      case config.status.PARSING:
         if (queue.inactiveRegions.has(routerParams.region)) { // Limbo accounts
            console.log(`[Deleted]: ${routerParams.gameName}#${routerParams.tagLine} (${routerParams.region})`)
            await deleteSummoner(summoner._id)
            return { stage: config.status.DELETED }
         } else {
            console.log(`[Parsing]: ${routerParams.gameName}#${routerParams.tagLine} (${routerParams.region})`)
            workQueue(summoner)
            return { stage: config.status.PARSING, data: summoner.parse }
         }
         
      case config.status.IN_QUEUE:
         console.log(`[In Queue]: ${routerParams.gameName}#${routerParams.tagLine} (${routerParams.region})`)
         return {
            stage: config.status.IN_QUEUE,
            data: await queue.check(summoner._id)
         }

      case config.status.UNPARSED:
         console.log(`[Unparsed]: ${routerParams.gameName}#${routerParams.tagLine} (${routerParams.region})`)
         return {
            stage: config.status.UNPARSED,
            data: 'Summoner is not parsed.'
         }

      default:
         throw createError('hmmmmmm')
   }
   
   return 'no dice'
})
