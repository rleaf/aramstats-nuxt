export const utilLoadChampionCollection = async (patch) => {
   const db = generateConnections()
   const count = await db.collection(`${patch}_championstats`).countDocuments()

   if (count) {
      return db.collection(`${patch}_championstats`)
   } else {
      // just return the most recent collection
      let baguette = (await db.listCollections().toArray())
         .filter(c => c.name.includes('championstats'))
         .map(c => c.name)
         .sort((a, b) => b.localeCompare(a))[0]
         
      return db.collection(`${baguette}`)
   }
}