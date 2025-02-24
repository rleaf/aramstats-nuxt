import { MongoClient } from 'mongodb'
import { SummonerModel } from "~/server/models/summoner_model"

export const utilLoadChampionCollection = async (patch) => {
      const db = generateConnections()
      const list = await db.listCollections().toArray()
      if (list.some(c => c.name === `${patch}_championstats`)) {
         return db.collection(`${patch}_championstats`)
      }

      const dbPatch = (await db.collection('meta').findOne({ '_id': 'crawler' })).patch
      const livePatch = (await db.collection(`${dbPatch[0]}_championstats`).findOne({}, { projection: { _id: 1 } })) ? dbPatch[0] : dbPatch[1]

      return db.collection(`${livePatch}_championstats`)
}

let _db

export const generateConnections = () => {
      /* Only fires on endpoints that need mongodb connection.
         https://github.com/nitrojs/nitro/issues/711#issuecomment-1415819402
      */
      if (!_db) {
            _db = new MongoClient(process.env.MONGODB_URI).db('aramstats')
      }
      return _db
}

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