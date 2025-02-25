import mongoose from 'mongoose'

/* 
   Dynamically set the collection name
*/
const puuidSchema = new mongoose.Schema({
   _id: String,
   gn: String,
   tl: String,
   name: String,
}, { versionKey: false })

export const puuidModel = mongoose.model('nuxt_summoner_puuid', puuidSchema)