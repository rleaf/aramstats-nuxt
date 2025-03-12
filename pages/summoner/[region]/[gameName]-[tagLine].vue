<script setup>
const route = useRoute()
const poll = ref(null)
const res = reactive({
   stage: null,
   data: null,
   error: null
})

const { data } = await useFetch(`/api/summoner/${route.params.region}/${route.params.gameName}/${route.params.tagLine}`)

if (data.value) {
   res.stage = data.value.stage
   res.data = data.value.data
}

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

   poll.value = setInterval(ping, 30000);
   setTimeout(ping, 5000);
}

async function ping() {
   const { stage, data } = await $fetch(`/api/summoner/${route.params.region}/${route.params.gameName}/${route.params.tagLine}`)
      .catch((e) => { console.log(e, 'error') })

   res.stage = stage
   res.data = data

   if (stage === 'Complete') {
      clearInterval(poll.value)
   }
}

</script>

<template>
   <div v-if="res.data">
      <UserReady v-if="res.stage === 'Complete'" :data="res.data" />
      <UserLoading v-else @parse-summoner="queueSummoner" :response="res" />
   </div>
</template>

<style scoped>

</style>