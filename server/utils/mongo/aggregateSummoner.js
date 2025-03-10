export async function aggregateSummoner(puuid) {
   return await SummonerModel.aggregate([
      { $match: { _id: puuid } },
      { $unwind: "$championData" },
      {
         $lookup: {
            from: "test_summoner_matches",
            localField: "championData.matches",
            foreignField: "_id",
            as: "championData.matches",
            pipeline: [ // For Encounters.vue
               {
                  $lookup: {
                     from: "test_summoner_puuids",
                     localField: "te",
                     foreignField: "_id",
                     as: "te",
                     pipeline: [
                        {
                           $project: {
                              _id: 0,
                           }
                        }
                     ]
                  }
               },
               {
                  $lookup: {
                     from: "test_summoner_puuids",
                     localField: "ee",
                     foreignField: "_id",
                     as: "ee",
                     pipeline: [
                        {
                           $project: {
                              _id: 0,
                           }
                        }
                     ]
                  }
               },
               {
                  $project: {
                     _id: 0,
                     __v: 0
                  }
               }
            ]
         }
      },
      // Lookup does not guarantee order https://stackoverflow.com/questions/67396937/array-is-reordered-when-using-lookup
      // {$sort: {
      //    "championData.gameCreation": 1 # something like this
      // }},
      {
         $group: {
            _id: "$_id",
            puuid: { $first: "$puuid" },
            level: { $first: "$level" },
            gameName: { $first: "$gameName" },
            tagLine: { $first: "$tagLine" },
            region: { $first: "$region" },
            profileIcon: { $first: "$profileIcon" },
            challenges: { $first: "$challenges" },
            championData: { $push: "$championData" },
            updated: { $first: "$updated" },
            fountainSitter: { $first: "$fountainSitter" },
            parse: { $first: "$parse" },
         }
      },
      {
         $project: {
            _id: 0,
            puuid: 0,
         }
      }
   ])
}