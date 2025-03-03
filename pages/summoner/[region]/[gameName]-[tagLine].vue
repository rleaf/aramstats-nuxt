<script setup>
const route = useRoute()
const poll = ref(null)
const res = reactive({
   stage: null,
   data: null
})

const { data, error } = await useFetch(`/api/summoner/${route.params.region}/${route.params.gameName}/${route.params.tagLine}`)

console.log(data.value, 'data')
console.log(error.value, 'error')

if (data.value) {
   res.stage = data.value.stage
   res.data = data.value.data
}
console.log(res, 'res')
async function queueSummoner() {
   res.stage = null
   $fetch(`/api/summoner/queueSummoner`, {
      method: 'POST',
      body: {
         region: route.params.region,
         gameName: route.params.gameName,
         tagLine: route.params.tagLine
      },
   })

   poll.value = setInterval(ping, 15000);
   setTimeout(ping, 3000);
}

async function ping() {
   console.log('ping')
   const { stage, data } = await $fetch(`/api/summoner/${route.params.region}/${route.params.gameName}/${route.params.tagLine}`)
      .catch((e) => { console.log(e, 'error') })

   res.stage = stage
   res.data = data

   if (stage === 'Complete') {
      console.log('clearing')
      clearInterval(poll.value)
   }
}

</script>

<template>
   <div>
      <div v-if="res.data">
         <UserReady v-if="res.stage === 'Complete'" :data="res.data" />
         <UserLoading v-else @parse-summoner="queueSummoner" :response="res" />
      </div>

      <div v-if="error">
         <!-- Summoner DNE -->
         {{ error }}
         <br>
         {{ error.statusCode }} code
         <br>
         {{ error.statusMessage }} statusMessage
         <br>
      </div>
   </div>
</template>

<style scoped>

/* *:not(button) {
   color: var(--color-font);
} */
</style>