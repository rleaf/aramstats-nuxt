import { MongoClient } from 'mongodb'

let _db

export const generateConnections = () => {
   /* Only fires on endpoints that need mongodb connection.
      https://github.com/nitrojs/nitro/issues/711#issuecomment-1415819402
   */
   if (!_db) {
      _db = new MongoClient(process.env.MONGODB_URI).db('aramstats')
   }
   return _db
}
