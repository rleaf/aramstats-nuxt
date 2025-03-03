export default defineEventHandler(async e => {
   const query = getQuery(e)
   const coll = await utilLoadChampionCollection(query.patch)
   if (!coll) {
      return
   }
   const pancakes = (await aggregateChampion(coll, Number(query.champId)))[0]

   if (!pancakes) {
      throw createError({
         statusCode: 404,
      })
   }

   return pancakes
})

async function aggregateChampion(coll, champion) {
   return await coll.aggregate([
      { $match: { "_id": champion } },
      {
         $project: {
            patch: coll.collectionName.split('_')[0],
            core: {
               $arrayToObject: { $slice: [{ $sortArray: { input: { $objectToArray: "$core" }, sortBy: { "v.games": -1 } } }, 10] }
            },
            starting: {
               $slice: [{ $sortArray: { input: { $objectToArray: "$starting" }, sortBy: { "v.games": -1 } } }, 10]
            },
            spells: {
               $slice: [{ $sortArray: { input: { $objectToArray: "$spells" }, sortBy: { "v.games": -1 } } }, 10]
            },
            skills: {
               $sortArray: { input: { $objectToArray: "$skills" }, sortBy: { "v.games": -1 } }
            },
            games: 1,
            wins: 1,
            runes: 1,
            pickRate: 1,
            rank: 1,
            items: 1,
         }
      }
   ]).toArray()
}