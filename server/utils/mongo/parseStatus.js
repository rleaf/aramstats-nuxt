export async function getParseStatus(gameName, tagLine) {
   let summoner = await getAccount(gameName, tagLine)
   try {
      summoner = await SummonerModel.findById(summoner.puuid, {
         _id: 1, 
         parse: 1
      })
   } catch (e) { 
      throw e
   }
   
   return summoner || { parse: { status: config.status.UNPARSED}}
}