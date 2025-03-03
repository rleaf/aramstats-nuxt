export default defineEventHandler(async e => {
   // if (e.context.dbReadyState === 0) {
   //    throw createError({
   //       statusCode: config.db.FAIL_STATUS,
   //       body: config.db.FAIL_MESSAGE
   //    })
   // }
   const query = getQuery(e)
   const tomatos = await utilLoadChampionCollection(query.patch)
   if (!tomatos) return
   const pancakes = await tomatos.find({}, { projection: { _id: 1, games: 1, wins: 1, pickRate: 1, metrics: 1 } }).toArray()
   
   return pancakes
})