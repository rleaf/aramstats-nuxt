
export default defineEventHandler(async (e) => {
   const queue = new Queue()
   let summoner
   
   const routerParams = getRouterParams(e)
   console.log(`[Searching] ${routerParams.gameName}#${routerParams.tagLine} (${routerParams.region})`)

   try {
      summoner = await getSummonerStatus(routerParams.gameName, routerParams.tagLine, routerParams.region)
   } catch (e) {
      return createError({
         status: e.status,
         statusMessage: config.SUMMONER_DNE,
         message: e.body.status.message
      })
   }

   switch (summoner.parse.status) {
      case config.STATUS_COMPLETE:
         console.log('SUMMONER FOUND')
         return (await aggregateSummoner(summoner._id))[0]

      case config.STATUS_PARSING:
         if (queue.inactiveRegions.has(summoner.region)) {
            console.log('SUMMONER DELETED')
            // deleteSummoner(summoner)
            throw createError({
               status: 404,
               statusMessage: config.SUMMONER_DELETED
            })
         } else {
            console.log('SUMMONER PARSING')
            const queuePosition = await queue.check(summoner.puuid, summoner.region)
            return { status: 200, body: {...summoner.parse, queuePosition} }
            // return (queuePosition) ? { status: config.STATUS_IN_QUEUE, body: queuePosition } : { parse: summoner.parse }
         }

      case config.SUMMONER_UNPARSED:
         return { status: 200, body: config.SUMMONER_UNPARSED }

      default:
         throw createError({
            status: 404,
            statusMessage: summoner.parse.status,
            message: 'Unknown status'
         })
   }
   
   return 'no dice'
})
