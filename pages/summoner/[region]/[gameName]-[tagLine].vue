<script setup>
const route = useRoute()

// const summoner = useFetch('/api/summoner/:region/:gameName/:tagLine', { params: { region: route.params.region, gameName: route.params.gameName, tagLine: route.params.tagLine } })
const { data: summonerData, status, error } = await useFetch(`/api/summoner/${route.params.region}/${route.params.gameName}/${route.params.tagLine}`)

</script>

<template>
   <div>
      <h1>Summoner</h1>
      {{ summonerData }}
      <!-- {{ summonerData.gameName }}
      {{ summonerData.tagLine }}
      {{ summonerData.region }} -->
   </div>
</template>