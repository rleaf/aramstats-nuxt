async function one() {
   // return new Error('turkeys')
   throw {msg: 'yer', testo: 3}
   // return Promise.reject(new Error('huh'))
}

async function two() {
   return await one()
      // .catch(e => {
      //    return e
      //    // throw e
      //    // console.log(e.message, 'error two')
      // })
}

async function three() {
   let x = await two()
      // .catch(e => {
      //    console.log(e.message, 'error three')
      // })

   console.log(x, 'x')
   return x
}

three()
