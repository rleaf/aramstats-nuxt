import { RegionGroups, Regions } from 'twisted/dist/constants/index.js'
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
      if (lastMatchId && pull.includes(lastMatchId)) {
         pull = pull.slice(0, pull.indexOf(lastMatchId))
         stop = false

         if (pull.length === 0) {
            return 0 // summoner already UTD
         }
      }

      matchList.push(pull)
      
      try {
         await getMatchInfo(pull[pull.length - 1], region)
      } catch (e) {
         if (e.status === 404) {
            console.log(matchList.flat().length, 'initial match length')
            return matchList.flat()
         }
      }
      
      if (pull.length === 0) stop = false
   }
   
   console.log(matchList.flat().length, 'initial match length')
   return matchList.flat()
}

/* 
* Match info.
*/
export const getMatchInfo = async (matchId, region) => {
   return (await lolApi.MatchV5.get(matchId, REGION_GROUPS[region])
      .catch(e => { })).response
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