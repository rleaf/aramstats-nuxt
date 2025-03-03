<script setup>
const { error } = defineProps(['error'])

const roulette = computed(() => useRoulette())
const msg = computed(() => {
   switch (error.statusCode) {
      case 500:
         return 'Aramstats database seems to be down. Feel free to message me in Discord so I can restart it.'
      case 404:
         return 'This page does not exist'
      default:
         return 'Something went wrong.'
         break;
   }
})

</script>

<template>
   <NuxtLayout />
   <div class="error-main">
      <h1>{{ error.statusCode }}</h1>
      <p>{{ msg }}</p>
      <img :src="`${roulette}`" alt="">
   </div>
</template>

<style scoped>
.error-main {
   display: flex;
   flex-direction: column;
   width: 100%;
   align-items: center;
   margin-top: 15vh;
   text-align: center;
}

h1 {
   font-family: var(--header-font);
   color: var(--color-font-focus);
   margin: 0;
}

img {
   padding-top: 50px;
   max-height: 55vh;
   display: block;
   margin: auto;
}

p {
   color: var(--color-font);
   font-size: 0.9rem;
}
</style>