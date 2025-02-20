<script setup>
const x = await $fetch('/api/summoner/na/penguinofdoom/na1', {
   method: 'GET',
   query: {
      tagLine: 'na1'
   }
})
</script>

<template>
   <div>
      <h1>Champions</h1>
      {{ x }}
      <NuxtLink to="champions/mel">mel</NuxtLink>
   </div>
</template>