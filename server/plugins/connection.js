import mongoose from 'mongoose'

export default defineNitroPlugin((nitroApp) => {
   mongoose.connect(process.env.MONGODB_URI)
})