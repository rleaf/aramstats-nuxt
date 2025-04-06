export default defineEventHandler(async e => {
   const query = getQuery(e)
   const tomatos = await utilLoadChampionCollection(query.patch)
   
   if (!tomatos) return
   const pancakes = await tomatos.find({}, { projection: { _id: 1, games: 1, wins: 1, pickRate: 1, metrics: 1 } }).toArray()

   const potatos = {
      patchResponse: tomatos.collectionName.slice(0, 4)
   }

   // return pancakes
   return { meta: potatos, championData: pancakes }
})