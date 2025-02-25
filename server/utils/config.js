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

   /* Statuses */
   STATUS_COMPLETE = { code: 1, msg: 'Complete'}
   STATUS_UNPARSED = { code: 2, msg: 'Summoner is not parsed.'}
   STATUS_PARSING = { code: 3, msg: 'Parsing summoner...'}
   STATUS_CHAMPION_AVERAGES = { code: 4, msg: 'Computing champion averages...'}
   STATUS_DELETED = { code: 5, msg: 'Summoner deleted.'}
   STATUS_IN_QUEUE = { code: 6, msg: 'In queue...'}
   STATUS_DNE = { code: 7, msg: 'Summoner does not exist.'}

   API_KEY = 'Api key expired.'

}

export default new Config()
