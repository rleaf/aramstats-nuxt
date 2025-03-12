export async function getParseStatus(gameName, tagLine) {
   let summoner = await getAccount(gameName, tagLine)
   summoner = await SummonerModel.findById(summoner.puuid, {
      _id: 1, 
      parse: 1
   })

   return summoner || { parse: { status: config.status.UNPARSED}}
}