// async function loadCollection(patch) {
//    const db = generateConnections()
//    const list = await db.listCollections().toArray()
//    if (list.some(c => c.name === `${patch}_championstats`)) {
//       return db.collection(`${patch}_championstats`)
//    }

import { get } from "mongoose"


//    const dbPatch = (await db.collection('meta').findOne({ '_id': 'crawler' })).patch
//    const livePatch = (await db.collection(`${dbPatch[0]}_championstats`).findOne({}, { projection: { _id: 1 } })) ? dbPatch[0] : dbPatch[1]
   
//    return db.collection(`${livePatch}_championstats`)
// }


export default defineEventHandler(async e => {
   const query = getQuery(e)
   console.log(query, 'query')
   const tomatos = await utilLoadChampionCollection(query.patch)
   if (!tomatos) return
   const pancakes = await tomatos.find({}, { projection: { _id: 1, games: 1, wins: 1, pickRate: 1, metrics: 1 } }).toArray()

   return pancakes
})