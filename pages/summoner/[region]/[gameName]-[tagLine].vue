<script setup>
const route = useRoute()

const { data: summonerData, status, error } = await useFetch(`/api/summoner/${route.params.region}/${route.params.gameName}/${route.params.tagLine}`)

async function queueSummoner() {
   await $fetch(`/api/summoner/queueSummoner`, {
      method: 'POST',
      body: {
         region: route.params.region,
         gameName: route.params.gameName,
         tagLine: route.params.tagLine
      },
      
   })
}
</script>

<template>
   <div>
      <button @click="queueSummoner()">
         Queue Test
      </button>
      {{ summonerData, 'yerr' }}
      <div v-if="status === 'success'">
         <!-- Summoner SUCCESS -->
         {{ summonerData.gameName }}
         {{ summonerData.tagLine }}
         {{ summonerData.region }}
      </div>
      <!-- <div v-else-if="">
         {{ summonerData, 'toads' }}
         
      </div> -->
      <div v-if="status === 'error'">
         <!-- Summoner DNE -->
         <h1>Summoner</h1>
         {{ status, 'status' }}
         {{ error, 'error' }}

      </div>
   </div>
</template>

<style scoped>

*:not(button) {
   color: var(--color-font);
}
</style>