// export default defineEventHandler(async (e) => {
//    const query = getQuery(e)
//    console.log(`[Deleting]: ${query.gameName}#${query.tagLine} (${query.region})`)
//    const summ = await getAccount(query.gameName, query.tagLine, query.region)
//    return await deleteSummoner(summ.puuid)
// })