export const utilLoadChampionCollection = async (patch) => {
   const db = generateConnections()
   const list = await db.listCollections().toArray()
   // return db.collection(`15.5_championstats`)
   if (list.some(c => c.name === `${patch}_championstats`)) {
      // return db.collection(`${patch}_championstats`)
      const count = await db.collection(`${patch}_championstats`).countDocuments()
      if (count) {
         return db.collection(`${patch}_championstats`)
      } else {
         const o = parseFloat(patch) - 0.1
         return db.collection(`${o}_championstats`)
      }
   }

   // const dbPatch = (await db.collection('meta').findOne({ '_id': 'crawler' })).patch
   // const livePatch = (await db.collection(`${dbPatch[0]}_championstats`).findOne({}, { projection: { _id: 1 } })) ? dbPatch[0] : dbPatch[1]

   // return db.collection(`${livePatch}_championstats`)
}