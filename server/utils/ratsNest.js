export default async function getSummonerStatus(gameName, tagLine, region) {
   let summoner
   try {
      summoner = await findSummoner(gameName, tagLine, region)
   } catch (e) {
      return (e.status === 404) ? config.SUMMONER_DNE : e.body.status.message
   }
   // console.log(summoner)
   summoner = await SummonerModel.findById(summoner.puuid, { _id: 1, parse: 1 })
   return summoner || config.SUMMONER_UNPARSED
}

export default async function findSummoner(gameName, tagLine, region) {
   try {
      const riotId = await getAccount(gameName, tagLine)
      const summoner = await getSummoner(riotId.puuid, region)

      return { ...riotId, ...summoner, region: region }
   } catch (e) {
      if (e instanceof Error) throw e
   }
}