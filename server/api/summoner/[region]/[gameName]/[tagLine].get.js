export default defineEventHandler(async (e) => {
   // if (e.context.dbReadyState === 0) {
   //    throw createError({
   //       statusCode: config.db.FAIL_STATUS,
   //       body: config.db.FAIL_MESSAGE
   //    })
   // }
   const queue = new Queue()
   let summoner
   const routerParams = getRouterParams(e, { decode: true})
   console.log(`[Searching]: ${routerParams.gameName}#${routerParams.tagLine} (${routerParams.region})`)
   try {
      summoner = await getSummonerStatus(routerParams.gameName, routerParams.tagLine, routerParams.region)
   } catch (e) {
      return {
         stage: config.status.DNE,
         data: e.body.message || e.message
      }
   }
   
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
