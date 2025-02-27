<script setup>
const route = useRoute()

const { data: res, error} = await useFetch(`/api/summoner/${route.params.region}/${route.params.gameName}/${route.params.tagLine}`)

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
      <br>
      <div v-if="res">
         
         {{ res.data.gameName }}
         {{ res.data.tagLine }}
         {{ res.data.region }}
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