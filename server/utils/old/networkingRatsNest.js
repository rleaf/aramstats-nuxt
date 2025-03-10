import { MongoClient } from 'mongodb'
import { SummonerModel } from "~/server/utils/models/summonerModel"

export const utilLoadChampionCollection = async (patch) => {
      const db = generateConnections()
      const list = await db.listCollections().toArray()
      if (list.some(c => c.name === `${patch}_championstats`)) {
            return db.collection(`${patch}_championstats`)
      }

      // const dbPatch = (await db.collection('meta').findOne({ '_id': 'crawler' })).patch
      // const livePatch = (await db.collection(`${dbPatch[0]}_championstats`).findOne({}, { projection: { _id: 1 } })) ? dbPatch[0] : dbPatch[1]

      // return db.collection(`${livePatch}_championstats`)
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

