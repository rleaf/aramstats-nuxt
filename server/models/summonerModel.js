// const mongoose = require("mongoose")
import mongoose from 'mongoose'
import { championEmbedSchema } from './championEmbedSchema'

const challengeSchema = new mongoose.Schema({
   _id: false,
   challengeId: Number,
   percentile: Number,
   level: String,
   value: Number,
   achievedTime: Number
})

const summonerSchema = new mongoose.Schema({
   _id: String, // Summoner puuid
   gameName: String,
   tagLine: String,
   level: Number,
   region: String,
   profileIcon: Number,
   fountainSitter: { type: Number, default: 0 },
   updated: { type: Date },
   parse: {
      current: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      status: { type: String, default: '' },
   },
   lastMatchId: { type: String, default: '' },
   challenges: [challengeSchema],
   championData: [championEmbedSchema]
}, { versionKey: false })

export const SummonerModel = mongoose.model('nuxt_test_summoners', summonerSchema)