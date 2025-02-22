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