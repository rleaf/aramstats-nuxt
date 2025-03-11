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
* Utility wrapper to auto retry on 500 requests. Dunno if I want to use.
*/
// async function retryWrapper(fn, args) {
//    return await promiseRetry(async retry => {
//       return (await fn(...args)).response
//          .catch(e => {
//             if (e instanceof Error && e.status >= 500) {
//                retry()
//             } else {
//                throw e
//             }
//          })
//    },{ retries: 2, factor: 2, minTimeout: 2000 })
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

/** 
* Total match history for ARAM (450). matchList[0] is most recent match.
* @param puuid summoner puuid
* @param region summoner region
* @param lastMatchId the last match played to start from. Used for updating a summoner.
*/
export const getSummonerMatches = async (puuid, region, lastMatchId) => {
   let matchList = []
   let stop = true

   for (let i = 0; stop; i+=100) {
      let cookie = (await lolApi.MatchV5.list(puuid, REGION_GROUPS[region], { queue: 450, start: i, count: 100 })
         .catch(e => { throw e })).response

      if (lastMatchId && cookie.includes(lastMatchId)) {
         cookie = cookie.slice(0, cookie.indexOf(lastMatchId))
         stop = false

         if (cookie.length === 0) {
            return 0 // summoner already UTD
         }
      }

      matchList.push(cookie)
      
      try {
         await getMatchInfo(cookie[cookie.length - 1], region)
      } catch (e) {
         if (e.status === 404) {
            console.log(matchList.flat().length, 'initial match length')
            return matchList.flat()
         }
      }
      
      if (cookie.length === 0) stop = false
   }
   
   console.log(matchList.flat().length, 'initial match length')
   return matchList.flat()
}

/* 
* Match info.
*/
const getMatchInfo = async (matchId, region) => {
   return (await lolApi.MatchV5.get(matchId, REGION_GROUPS[region])
      .catch(e => { throw e })).response
}

/* 
* Batched match info.
*/
export const getBatchedMatchInfo = async (matchlist, region) => {
   return await Promise.all(matchlist.map(async matchId => {
      return (await lolApi.MatchV5.get(matchId, REGION_GROUPS[region])
         .catch(e => { throw e })).response
   }))
}

/* 
* Batched timeline info.
*/
export const getBatchedTimelineInfo = async (matchlist, region) => {
   return await Promise.all(matchlist.map(async matchId => {
      return (await lolApi.MatchV5.timeline(matchId, REGION_GROUPS[region])
         .catch(e => { throw e })).response
   }))
}

const challengeIds = [
   101105, // No hiding
   101204, // Free Money
   101205, // Free Ticket to Base
   101206, // Pop Goes the Poro
   101306, // Can't Touch This
   101201, // Another Day, Another Bullseye
   101203, // Snow Day
   101000, // Aram Authority
   101100, // Aram Warrior
   101200, // Aram Finesse
   101300, // Aram Champion
   101103, // Aram Legend
   101106, // ARAM Eradication
   101301, // All Random All Champions
   101305, // Active Participant
   101302, // All Random All Flawless
   101104, // Bad Medicine
   101107, // Farm Champs Not Minions
   101303, // Rapid Demolition
   101101, // DPS Threat
   101102, // Double Decimation
   101304, // Lightning Round
   101108, // Solo Carry
   101307, // NA-RAM
   101202, // It was a... Near-Hit
]

/* 
* Player Challenges.
*/
export const getPlayerChallenges = async (puuid, region) => {
   const donut = (await lolApi.Challenges.PlayerChallenges(puuid, REGION_CONSTANTS[region])
      .catch(e => { throw e })).response

   return donut.challenges.filter(el => challengeIds.includes(el.challengeId))
}

export async function challengeScribe(puuid, region) {
   const challengesDto = await getPlayerChallenges(puuid, region)
   const challenges = challengesDto.challenges.filter(el => challengeIds.includes(el.challengeId))

   return challenges
}