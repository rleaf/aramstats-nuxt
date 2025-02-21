import mongoose from 'mongoose'

export default defineNitroPlugin(() => {
   mongoose.connect(process.env.MONGODB_URI)
})