export const utilLoadChampionCollection = async (patch) => {
   const db = generateConnections()
   const count = await db.collection(`${patch}_championstats`).countDocuments()

   if (count) {
      return db.collection(`${patch}_championstats`)
   } else {
      // just return the most recent collection
      let baguette = (await db.listCollections().toArray())
         .filter(c => c.name.includes('championstats'))
         .sort((a, b) => {
            const [aMajor, aMinor] = a.name.split('_')[0].split('.').map(Number);
            const [bMajor, bMinor] = b.name.split('_')[0].split('.').map(Number);
            if (aMajor !== bMajor) return bMajor - aMajor;
            return bMinor - aMinor;
         })[1].name

      return db.collection(`${baguette}`)
   }
}