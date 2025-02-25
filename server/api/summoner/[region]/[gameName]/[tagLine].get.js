
export default defineEventHandler(async (e) => {
   const queue = new Queue()
   let summoner
   
   const routerParams = getRouterParams(e)
   console.log(`[Searching] ${routerParams.gameName}#${routerParams.tagLine} (${routerParams.region})`)

   try {
      summoner = await getSummonerStatus(routerParams.gameName, routerParams.tagLine, routerParams.region)
   } catch (e) {
      return createError({
         status: config.STATUS_DNE.code,
         statusMessage: config.STATUS_DNE.msg,
      })
   }

   switch (summoner.parse.status) {
      case config.STATUS_COMPLETE.code:
         console.log('SUMMONER FOUND')
         return { status: config.STATUS_COMPLETE, body: (await aggregateSummoner(summoner._id))[0]}
         // return (await aggregateSummoner(summoner._id))[0]

      case config.STATUS_PARSING.code:
         if (queue.inactiveRegions.has(summoner.region)) {
            console.log('SUMMONER DELETED')
            // deleteSummoner(summoner)
            throw createError({
               status: config.STATUS_DELETED.code,
               statusMessage: config.STATUS_DELETED.msg
            })
         } else {
            console.log('SUMMONER PARSING')
            const queuePosition = await queue.check(summoner.puuid, summoner.region)
            return { status: config.STATUS_PARSING, body: {...summoner.parse, queuePosition} }
            // return (queuePosition) ? { status: config.STATUS_IN_QUEUE, body: queuePosition } : { parse: summoner.parse }
         }

      case config.STATUS_UNPARSED.code:
         return config.STATUS_UNPARSED

      default:
         throw createError({
            statusMessage: summoner.parse.status,
            message: 'Unknown status'
         })
   }
   
   return 'no dice'
})
