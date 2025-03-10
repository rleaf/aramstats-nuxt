import mongodb from 'mongodb'
import { SummonerModel } from '../models/summonerModel'
// import { initSummonerParse } from './parse'

let instance = null

export class Queue {
   constructor() {

      if (instance) {
         return instance
      }

      instance = this

      this.name = 'queue'
      this.inactiveRegions = new Set([
         'na',
         'euw',
         'eune',
         'kr',
         'lan',
         'las',
         'oce',
         'tr',
         'ru',
         'jp',
         'br',
         'vn',
         'tw',
         'th',
         'sg',
         'ph',
         'me'
      ])
      // this.db = generateConnections()
      // this.initCollection()
   }

   async initCollection() {
      const queueCollection = await this.db.listCollections({ name: this.name }, { nameOnly: true }).toArray()
      if (!queueCollection.length) {
         const $jsonSchema = {
            bsonType: 'object',
            required: ['qPuuid', 'region', 'position'],
            properties: {
               qPuuid: { bsonType: 'string' },
               region: { bsonType: 'string' },
               position: { bsonType: 'int' }
            }
         }
         await this.db.createCollection(this.name, { validator: { $jsonSchema } })
         await this.db.collection(this.name).createIndex('qPuuid', { unique: true })
      }

      this.collection = await this.db.collection(this.name)
      // await this.establishMeta()
   }

   async establishMeta() {
      this.metaCollection = await this.db.collection('meta')
      const metaDoc = await this.metaCollection.findOne({ _id: 'queue' })
      if (!metaDoc) {

         const schema = {
            '_id': 'queue',
            'na': 0,
            'euw': 0,
            'eune': 0,
            'kr': 0,
            'lan': 0,
            'las': 0,
            'oce': 0,
            'tr': 0,
            'ru': 0,
            'jp': 0,
            'br': 0,
            'vn': 0,
            'tw': 0,
            'th': 0,
            'sg': 0,
            'ph': 0,
            'me': 0,
         }

         this.metaCollection.insertOne(schema)
      }
   }

   /**
    * Gets the proceeding summoner in the queue
    * @param region Summoner Region
   */
   async get(region) {
      try {
         // return (await this.collection.findOneAndDelete({ region: region }, { sort: { _id: 1 }, projection: { _id: 0, qPuuid: 1 } })).value
         return await this.collection.findOneAndDelete({ region: region }, { sort: { _id: 1 }, projection: { _id: 0, qPuuid: 1 } })
      } catch (e) {
         if (e instanceof mongodb.MongoServerError) throw e
      }
   }

   /**
    * Updates queue members position
    * @param region Summoner Region
   */
   async update(region) {
      try {
         await this.collection.updateMany({ region: region }, { $inc: { position: -1 } })
      } catch (e) {
         if (e instanceof mongodb.MongoServerError) throw e
      }
   }

   /**
    * Adds a summoner to the end of the queue
    * @param puuid Summoner PUUID
    * @param region Summoner Region
   */
   async add(puuid, region) {
      try {
         const idx = (await this.count(region))
         await this.collection.insertOne({ qPuuid: puuid, region: region, position: idx + 1 })
      } catch (e) {
         if (e instanceof mongodb.MongoServerError) throw e
      }
   }

   /**
    * Check to see if summoner exists in the queue
    * @param puuid Summoner PUUID
   */
   async check(puuid) {
      let position

      await this.collection.findOne({ qPuuid: puuid })
         .then(res => position = (res) ? res.position : null)

      return position
   }

   /**
    * Deletes a summoner from the queue
    * @param puuid Summoner PUUID
    * @param region Summoner Region
   */
   async remove(puuid) {
      await this.collection.deleteOne({ puuid: puuid })
   }

   /**
    * Counts the number of summoners in the queue
   */
   async count(region) {
      try {
         return await this.collection.countDocuments({ region: region })
      } catch (e) {
         if (e instanceof mongodb.MongoServerError) throw e
      }
   }

   /**
    * Gets the queue length stored in the meta collection for a corresponding region.
    * @param region Specified region to count
   */
   async regionCount(region) {
      try {
         return await this.metaCollection.findOne({ _id: 'queue' }, { projection: { [region]: 1 } })
      } catch (e) {
         if (e instanceof mongodb.MongoServerError) throw e
      }
   }

   /**
    * Deletes all summoners in the queue
   */
   async purge() {
      try {
         await this.collection.deleteMany({})
      } catch (e) {
         if (e instanceof mongodb.MongoServerError) throw e
      }
   }
}

export async function workQueue(summoner) {
   /**
    * Queue management that works via baton passing.
    * Longterm, maybe more reliable to create a separate script that runs via cronjobs to ping the queue for a given region every ~minute. Can build this in python too.
   */
   const queue = new Queue()

   if (queue.inactiveRegions.has(summoner.region)) {
      queue.inactiveRegions.delete(summoner.region)
      let qSummoner = await queue.get(summoner.region)
      let document
      
      while (qSummoner) {

         try {
            document = await SummonerModel.findOne({ '_id': qSummoner.qPuuid })
            await queue.update(summoner.region)

            const [matchlist, challenges] = await Promise.all([
               getSummonerMatches(document._id, document.region),
               challengeScribe(document._id, document.region)
            ])

            await parseSummoner(matchlist)
            // await initialParse(document)
            qSummoner = await queue.get(summoner.region)
            if (qSummoner) document = await SummonerModel.findOne({ '_id': qSummoner.qPuuid })
         } catch (e) {
            qSummoner = await queue.get(summoner.region)
            queue.inactiveRegions.add(summoner.region)
            throw e
            // console.log(e, 'rip bozo') // So I'm not scrolling for hours in prod
         }
      }

      console.log(`(${summoner.region}) Queue complete.`)
      queue.inactiveRegions.add(summoner.region)
   }
}