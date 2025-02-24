export default defineEventHandler(async (e) => {
   const summoner = await getSummonerStatus(e.context.params.gameName, e.context.params.tagLine, e.context.params.region)

   try {
      console.log(`${e.context.params.gameName}#${e.context.params.tagLine} (${e.context.params.region}) [Searching]`)
      summoner = await util.findSummoner(e.context.params.gameName, e.context.params.tagLine, e.context.params.region)
   } catch (e) {
      const msg = (e.status === 404) ? config.SUMMONER_DNE : e.body.status.message
      res.status(e.status).send(msg)
      return
   }

   

})