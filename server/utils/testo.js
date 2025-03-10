async function one() {
   try {
      // await Promise.reject('REJECT')
      return new Error('error')
   } catch (e) {
      console.log('throwing')
      throw e
   }
}

async function two() {
   return await one()
}

async function three() {
   await two()
      .catch(e => console.log(e, 'three'))
}

three()