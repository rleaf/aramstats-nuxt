<script setup>

useSeoMeta({
   title: 'ARAM Stats',
   ogTitle: 'ARAM Stats',
   description: 'Aramstats provides insightful Howling Abyss summoner and champion statistics. ☃️',
   ogDescription: 'Aramstats provides insightful Howling Abyss summoner and champion statistics. ☃️',
})

const legal = computed(() => 
{
   return `Aramstats.lol isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.` })

</script>

<template>
   <div>
      <Search />
      <Experience />
      <span>{{ legal }}</span>
   </div>
</template>

<style scoped>
span {
   color: var(--color-font);
   font-family: var(--font-main);
   left: 0;
   right: 0;
   margin: 0 auto;
   text-align: center;
   position: absolute;
   max-width: 800px;
   font-size: .8rem;
   bottom: 3rem;
}
</style>