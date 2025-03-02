export default defineEventHandler(async (e) => {
   const queue = new Queue()
   let summoner
   
   const routerParams = getRouterParams(e, { decode: true})
   console.log(`[Searching]: ${routerParams.gameName}#${routerParams.tagLine} (${routerParams.region})`)
   try {
      summoner = await getSummonerStatus(routerParams.gameName, routerParams.tagLine, routerParams.region)
   } catch (e) {
      throw createError({
         status: e.status,
         statusMessage: e.body.status.message || e.status.message || e.message
      })
   }

   switch (summoner.parse.status) {
      case config.status.COMPLETE:
         console.log('SUMMONER FOUND')
         return {
            stage: config.status.COMPLETE,
            data: (await aggregateSummoner(summoner._id))[0]
         }

      case config.status.PARSING:
         if (queue.inactiveRegions.has(routerParams.region)) { // Limbo accounts
            console.log('SUMMONER DELETED')
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
         return {
            stage: config.status.UNPARSED,
            data: 'Summoner is not parsed.'
         }

      default:
         throw createError('hmmmmmm')
   }
   
   return 'no dice'
})
