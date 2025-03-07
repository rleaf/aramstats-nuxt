export class MongoError extends Error {
constructor(message, error) {
   super(message)
      this.status = error.status
   }
}

export class RiotError extends Error {
   constructor(message, error) {
      super(message)
      this.status = error.status
   }
}