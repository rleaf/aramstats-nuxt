class Config {
   version = 'v2'
   versioned_prefix = `/api/${this.version}`
   prefix = `/api`

   SUMMONER_PREFIX = `${this.prefix}/summoners/:region/:gameName/:tagLine`
   UPDATE_SUMMONER_PREFIX = `${this.prefix}/update/:region/:gameName/:tagLine`
   DELETE_SUMMONER_PREFIX = `${this.prefix}/delete/:region/:gameName/:tagLine`
   JANE_DOE_PREFIX = `${this.prefix}/summoners/random`
   CHECK_SUMMONER_PREFIX = `${this.prefix}/summoners/check/:region/:gameName/:tagLine`

   MATCH_PREFIX = `${this.prefix}/matchInfo/:region/:matchId`
   MATCH_HISTORY_PREFIX = `${this.prefix}/matchHistory/:region/:gameName/:tagLine`

   CHAMPION_PREFIX = `${this.prefix}/champion/:champion`
   CHAMPIONS_LIST_PREFIX = `${this.prefix}/championsList` // change to 'tier'? more catchy?

   db = {
      FAIL_STATUS: 500,
      FAIL_MESSAGE: 'Database connection failed.'
   }
   
   status = {
      COMPLETE: 'Complete',
      UNPARSED: 'Unparsed',
      PARSING: 'Parsing',
      AVERAGES: 'Averages',
      DELETED: 'Deleted',
      IN_QUEUE: 'Queue',
      DNE: 'DNE'
   }
   
   API_KEY = 'Api key expired.'
}

export default new Config()
