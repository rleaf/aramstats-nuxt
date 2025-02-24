import { SummonerModel } from "~/server/models/summoner_model"
const queue = new Queue()

export default defineEventHandler(async (e) => {
   const summoner = await getSummonerStatus(e.context.params.gameName, e.context.params.tagLine, e.context.params.region)
   let queuePosition

   switch (summoner.parse.status) {
      case config.STATUS_COMPLETE:
         console.log('SUMMONER FOUND')
         return (await aggregateSummoner(summoner._id))[0]

      case config.STATUS_PARSING:
         if (queue.inactiveRegions.has(summoner.region)) {
            console.log('SUMMONER DELETED')
            // deleteSummoner(summoner)
            return { status: 404, body: config.SUMMONER_DELETED }
         } else {
            console.log('SUMMONER PARSING')
            queuePosition = await this.queue.check(summoner.puuid, summoner.region)
            return (queuePosition) ? { status: config.STATUS_IN_QUEUE, position: queuePosition } : { parse: summoner.parse }
         }

      case config.SUMMONER_DNE:
         console.log('SUMMONER DNE')
         return { status: 404, body: config.SUMMONER_DNE }

      case config.SUMMONER_UNPARSED:
         console.log('SUMMONER UNPARSED')
         break

      default:
         throw createError({ statusCode: 404 })
   }

   // if (dbSumm) {
   //    let response
   //    if (dbSumm.parse.status === config.STATUS_COMPLETE) {
   //       // response = (await aggregateSummoner(summoner.puuid))[0]
   //       response = (await aggregateSummoner(testSummoner))[0]
   //    } else {
   //       // if (dbSumm.parse.status === config.STATUS_PARSING && this.queue.inactiveRegions.has(summoner.region)) {
   //       //    util.deleteSummoner(dbSumm)
   //       //    res.status(404).send(config.SUMMONER_DELETED)
   //       //    return
   //       // } else {
   //       //    console.log(`${summoner.gameName}#${summoner.tagLine} (${req.params.region}) [In Queue]`)
   //       //    workQueue(summoner)
   //       //    position = await queue.check(summoner.puuid, summoner.region)
   //       //    response = (position) ? { parse: { status: config.STATUS_IN_QUEUE, position: position } } : { parse: dbSumm.parse }
   //       // }

   //    }

   //    return response
   // }

   
   return 'no dice'
})

async function getSummonerStatus(gameName, tagLine, region) {
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


async function findSummoner(gameName, tagLine, region) {
   try {
      const riotId = await getAccount(gameName, tagLine)
      const summoner = await getSummoner(riotId.puuid, region)

      return { ...riotId, ...summoner, region: region }
   } catch (e) {
      if (e instanceof Error) throw e
   }
}

async function aggregateSummoner(puuid) {
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
