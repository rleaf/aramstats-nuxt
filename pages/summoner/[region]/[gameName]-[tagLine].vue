<script setup>
const route = useRoute()
const poll = ref(null)
const key = ref(0)
const res = reactive({
   stage: null,
   data: null
})

const { data, error } = await useFetch(`/api/summoner/${route.params.region}/${route.params.gameName}/${route.params.tagLine}`)
res.stage = data.value.stage
res.data = data.value.data

async function queueSummoner() {
   await $fetch(`/api/summoner/queueSummoner`, {
      method: 'POST',
      body: {
         region: route.params.region,
         gameName: route.params.gameName,
         tagLine: route.params.tagLine
      },
   })

   poll.value = setInterval(ping, 10000);
   ping()
}

async function ping() {
   console.log('ping')
   const { stage, data } = await $fetch(`/api/summoner/${route.params.region}/${route.params.gameName}/${route.params.tagLine}`)
      .catch((e) => { console.log(e, 'error') })

   res.stage = stage
   res.data = data
   key.value++

   if (stage === 'Complete') {
      console.log('clearing')
      clearInterval(poll.value)
   }
}

</script>

<template :key="key">
   <div>
   <div v-if="res">
      <UserReady v-if="res.stage === 'Complete'" :data="res.data" />
      <UserLoading @parse-summoner="queueSummoner" v-else :response="res" />
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

*:not(button) {
   color: var(--color-font);
}
</style>