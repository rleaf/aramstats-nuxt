export async function getSummonerStatus(gameName, tagLine, region) {
   let summoner = await findSummoner(gameName, tagLine, region)
   // if (!summoner.puuid) throw { status_code: 404 } ???
   try {
      summoner = await SummonerModel.findById(summoner.puuid, {
         _id: 1, 
         parse: 1
      })
      
   } catch (e) { }
   return summoner || { parse: { status: config.status.UNPARSED}}
}

export async function findSummoner(gameName, tagLine, region) {
   const riotId = await getAccount(gameName, tagLine)
   const summoner = await getSummoner(riotId.puuid, region)

   return { ...riotId, ...summoner, region: region }
}