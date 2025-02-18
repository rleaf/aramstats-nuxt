<script setup lang="ts">
</script>

<template>
   <div>
      <h1>Summoner</h1>
      {{ $route.params.region }}
      {{ $route.params.gameName }}
      {{ $route.params.tagLine }}
   </div>
</template>