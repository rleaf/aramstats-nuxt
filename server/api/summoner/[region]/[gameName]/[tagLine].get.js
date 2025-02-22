import { RiotApi } from 'twisted'
import { RegionGroups } from 'twisted/dist/constants'
import { SummonerModel } from '~/server/models/summoner_model'
import mongoose from 'mongoose'

const riotApi = new RiotApi({ debug: true})

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

export default defineEventHandler(async (e) => {
   // let puuid
   let conn
   return 'toads'
   const testPUUID = '1drRAqWmygSD5609hYrHETGKzme8QG_UXH8sgw0ViCm4pLLWR2SzS4acNH8x4yrwRTIz7rn5gFFIFw'
   try {
      console.log(e.context.params)
      // let {puuid} = (await riotApi.Account.getByRiotId(e.context.params.gameName, e.context.params.tagLine, REGION_GROUPS[e.context.params.region])).response
      // return puuid
      
      conn = await SummonerModel.findOne({ _id: testPUUID })
   } catch (e) { 
      console.log('error', e)
   }

   return conn
})