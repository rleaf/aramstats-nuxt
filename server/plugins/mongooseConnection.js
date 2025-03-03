import mongoose from 'mongoose'

export default defineNitroPlugin((nitro) => {
   mongoose.connect(process.env.MONGODB_URI)

   // Bind mongoose connection status to context to see if db is connected maybe?
   // nitro.hooks.hook('request', (e) => {
   //    e.context.dbReadyState = mongoose.connection.readyState
   // })
})