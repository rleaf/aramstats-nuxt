<script setup>
const store = superStore()
store.initPatches()
const patch = computed(() => (store.recentCleanPatch) ? `Patch ${store.recentCleanPatch} data available. ☃️` : '☃️')

useSeoMeta({
   title: 'ARAM Stats',
   ogTitle: 'ARAM Stats',
   description: `Aramstats provides insightful Howling Abyss summoner and champion statistics. ${patch.value}`,
   ogDescription: `Aramstats provides insightful Howling Abyss summoner and champion statistics. ${patch.value}`,
})

</script>

<template>
   <div>
      <Search />
      <Experience />
      <span>
         Aramstats.lol isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone associated properties are trademarks or registered trademarks of Riot Games, Inc.
      </span>
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