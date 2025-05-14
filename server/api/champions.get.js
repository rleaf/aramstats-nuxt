export default defineEventHandler(async e => {
   const query = getQuery(e)
   const tomatos = await utilLoadChampionCollection(query.patch)
   
   if (!tomatos) return
   const pancakes = await tomatos.find({}, { projection: { _id: 1, games: 1, wins: 1, pickRate: 1, metrics: 1 } }).toArray()

   // return pancakes
   return { patch: tomatos.collectionName.split('_')[0], championData: pancakes }
})