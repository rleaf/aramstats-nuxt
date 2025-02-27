import { RegionGroups, Regions } from 'twisted/dist/constants'
import twisted from 'twisted'
// import promiseRetry from 'promise-retry'

const lolApi = new twisted.LolApi()
const riotApi = new twisted.RiotApi()

const REGION_CONSTANTS = {
   na: Regions.AMERICA_NORTH,
   euw: Regions.EU_WEST,
   eune: Regions.EU_EAST,
   kr: Regions.KOREA,
   lan: Regions.LAT_NORTH,
   las: Regions.LAT_SOUTH,
   oce: Regions.OCEANIA,
   tr: Regions.TURKEY,
   ru: Regions.RUSSIA,
   jp: Regions.JAPAN,
   br: Regions.BRAZIL,
   vn: Regions.VIETNAM,
   tw: Regions.TAIWAN,
   th: Regions.THAILAND,
   sg: Regions.SINGAPORE,
   ph: Regions.PHILIPPINES,
   pbe: Regions.PBE,
}

const REGION_GROUPS = {
   na: RegionGroups.AMERICAS,
   euw: RegionGroups.EUROPE,
   eune: RegionGroups.EUROPE,
   kr: RegionGroups.ASIA,
   lan: RegionGroups.AMERICAS,
   las: RegionGroups.AMERICAS,
   oce: RegionGroups.SEA,
   tr: RegionGroups.EUROPE,
   ru: RegionGroups.EUROPE,
   jp: RegionGroups.ASIA,
   br: RegionGroups.AMERICAS,
   vn: RegionGroups.SEA,
   tw: RegionGroups.SEA,
   th: RegionGroups.SEA,
   sg: RegionGroups.SEA,
   ph: RegionGroups.SEA,
}

// export const retryWrapper = async (fn, args) => {
//    return await promiseRetry(async retry => {
//       try {
//          return (await fn(...args)).response
//       } catch (e) {
//          if (e instanceof Error && (e.status !== 404) && e.status !== 429) { // Do not retry on 404
//             console.log(e.status, e.message, e.body, 'retryWrapper ')
//             if (e.status === 403 || e.status === 400) throw e
//             retry()
//          } else {
//             throw e
//          }
//       }
//    }, { retries: 2, factor: 2, minTimeout: 2000 })
//    .catch(e => {
//       if (e instanceof Error) throw e
//    })
// }

// export const axiosRetryWrapper = async (fn, args) => {
//    return await promiseRetry(async retry => {
//       try {
//          return (await fn(...args)).response
//       } catch (e) {
//          if (e instanceof Error && (e.name === 'GenericError') && e.status !== 429) { // Do not retry on 404
//             retry()
//          } else {
//             throw e
//          }
//       }
//    }, { retries: 1, factor: 2, minTimeout: 2000 })
//    .catch(e => {
//       if (e instanceof Error) throw e
//    })
// }

/** 
* Summoner info w/ account-v1
* Tethered to AMERICAS region rn because closest to backend server. Can move if need to balance rate limits
* @param gameName summoner name
* @param tagLine summoner tagline
*/
export const getAccount = async (gameName, tagLine) => {
   return (await riotApi.Account.getByRiotId(gameName, tagLine, RegionGroups.AMERICAS).catch(e => { throw e })).response
}

/** 
* Summoner info.
* @param puuid summoner puuid
* @param region summoner region
*/
export const getSummoner = async (puuid, region) => {
   return (await lolApi.Summoner.getByPUUID(puuid, REGION_CONSTANTS[region]).catch(e => { throw e })).response
}

/* 
* Variable match history for ARAM (450). Used for utility.
*/
export const getSummonerMatches = async (puuid, region, start, count) => {
   return await lolApi.MatchV5.list('adskdf', REGION_GROUPS[region], { queue: 450, start: start, count: count })
      .catch(e => { })
   // return await retryWrapper(lolApi.MatchV5.list.bind(lolApi.MatchV5), [puuid, REGION_GROUPS[region], { queue: 450, start: start, count: count }])
   //    .catch(e => { })
}

/* 
* Total match history for ARAM (450). matchList[0] is most recent match. 
*/
export const getAllSummonerMatches = async (puuid, region, lastMatchId) => {
   let matchList = []
   let stop = true

   for (let i = 0; stop; i+=100) {
      let pull = (await lolApi.MatchV5.list(puuid, REGION_GROUPS[region], { queue: 450, start: i, count: 100 })
         .catch(e => { 
            // maybe do something here?
          })).response
      // let pull = await retryWrapper(lolApi.MatchV5.list.bind(lolApi.MatchV5), [puuid, REGION_GROUPS[region], { queue: 450, start: i, count: 100 }])
      if (lastMatchId && pull.includes(lastMatchId)) {
         pull = pull.slice(0, pull.indexOf(lastMatchId))
         stop = false
      }

      matchList.push(pull)
      
      try {
         await getMatchInfo(pull[pull.length - 1], region)
      } catch (e) {
         if (e.status === 404) return matchList.flat()
      }
      
      if (pull.length === 0) stop = false
   }
   
   console.log(matchList.flat().length, 'initial match length')
   return matchList.flat()
}

/* 
* Get ARAM matches on the most recent patch by the hundreds. Used for crawl init atm.
* Summoner `iLoveUrMomXD` (na) has a contiguous sequence of dead matches that return 404. Starting @ NA1_3961520099.
* 
* Break loop if matchlist[-1] 404s  
*/
// export const getSummonerMatchesOnPatch = async (puuid, region, patch) => {
//    let matchlist = []
//    let stop = true

//    for (let i = 0; stop; i+=100) {
//       const pull = await retryWrapper(lolApi.MatchV5.list.bind(lolApi.MatchV5), [puuid, REGION_GROUPS[region], { queue: 450, start: i, count: 100 }])
//       matchlist.push(pull)

//       const lastMatch = await getMatchInfo(pull[pull.length - 1], region)
//       if (lastMatch.status_code && lastMatch.status_code === 404) break

//       const matchPatch = lastMatch.info.gameVersion.split('.').slice(0, 2).join('.')
//       if (patch != matchPatch) stop = false
//    }

//    return matchlist.flat()
// }

/* 
* Match info.
*/
export const getMatchInfo = async (matchId, region) => {
   return (await lolApi.MatchV5.get(matchId, REGION_GROUPS[region])
      .catch(e => { })).response
   // return await retryWrapper(lolApi.MatchV5.get.bind(lolApi.MatchV5), [matchId, REGION_GROUPS[region]])
   //    .catch(e => { })
}

/* 
* Batched match info.
*/
export const getBatchedMatchInfo = async (matchlist, region) => {
   return await Promise.all(matchlist.map(async matchId => {
      return (await lolApi.MatchV5.get(matchId, REGION_GROUPS[region])
         .catch(e => { console.log(e.status, e.message, e.body, 'getBatchedMatchInfo @@') })).response
   }))
}

/* 
* Batched timeline info.
*/
export const getBatchedTimelineInfo = async (matchlist, region) => {
   return await Promise.all(matchlist.map(async matchId => {
      return (await lolApi.MatchV5.timeline(matchId, REGION_GROUPS[region])
         .catch(e => { console.log(e.status, e.message, e.body, 'getBatchedTimelineInfo @@') })).response
   }))
}

/* 
* Match timeline info.
*/
export const getMatchTimeline = async (matchId, region) => {
   return (await lolApi.MatchV5.timeline(matchId, REGION_GROUPS[region])
      .catch(e => { })).response
}

/* 
* Player Challenges.
*/
export const getPlayerChallenges = async (puuid, region) => {
   return (await lolApi.Challenges.PlayerChallenges(puuid, REGION_CONSTANTS[region])
      .catch(e => { })).response
}