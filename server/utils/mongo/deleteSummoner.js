export async function deleteSummoner(puuid) {
   const summoner = await SummonerModel.findById(puuid)
   let bin = []

   for (const data of summoner.championData) {
      for (const match of data.matches) {
         bin.push({
            deleteOne: { filter: { _id: match } }
         })
      }
   }


   await SummonerMatchesModel.bulkWrite(bin)
   await SummonerModel.deleteOne({ _id: summoner._id })
}