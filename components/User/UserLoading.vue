<script setup>
const { response } = defineProps(['response'])
const { stage, data } = toRefs(response)

useHead({
   title: 'ARAM Stats'
})

const parseStatus = computed(() => {
   if (document) document.title = `${data.value.current} / ${data.value.total} | ARAM Stats`
   return `${data.value.current} / ${data.value.total} matches completed`
})

const msg = `I update every 30 seconds. A summoner generally takes a couple minutes to parse. Feel free to close this window & check back later.`
</script>

<template>
   <div class="loading-main">
      <div v-if="stage === 'Queue'">
         <h2>Summoner is in queue.</h2>
         <p class="queue">
            <span v-if="data === 1">You are next.</span>
            <span v-else-if="data - 1 === 1">There is 1 summoner ahead of you.</span>
            <span v-else>There are {{ data - 1 }} summoners ahead of you.</span>
         </p>
         <p class="sub">
            {{ msg }}
            <NuxtLink :to="{ name: 'summoner-region-gameName-tagLine', params: { region: 'na', gameName: 'ryi', tagLine: 'na1' } }"
               target="_blank">Here</NuxtLink> is what you can expect to see.
         </p>

      </div>

      <div v-else-if="stage === 'Parsing'">
         <h2>Currently parsing summoner.</h2>
         <p class="queue">{{ parseStatus }}</p>
         <p class="sub"> {{ msg }} </p>
      </div>

      <div v-else-if="stage === 'Unparsed'">
         <h2>Hello, it seems this summoner has never been parsed.</h2>
         <p class="sub">
            This process can take some time depending on the queue. You'll be able to refresh the page to see your progress.
            <NuxtLink
               :to="{ name: 'summoner-region-gameName-tagLine', params: { region: 'na', gameName: 'ryi', tagLine: 'na1' } }"
               target="_blank">Here</NuxtLink>
            is what you can expect to see when the account finishes.
         </p>
         <button @click="$emit('parseSummoner')">Parse summoner</button>
      </div>

      <div v-else>
         <h2>Loading...</h2>
      </div>
   </div>
</template>

<style scoped>

h2 {
   font-size: 0.9rem;
   font-weight: normal;
   color: var(--color-font-focus);
}

.loading-main {
   display: flex;
   flex-direction: column;
   width: 100%;
   align-items: center;
   margin-top: 15vh;
   text-align: center;
}

p {
   color: var(--color-font);
   width: 500px;
   font-size: 0.9rem;
   line-height: 1.5;
}

button {
   width: 230px;
   margin: 0 auto;
   margin-top: 30px;
   cursor: pointer;
   border-radius: 3px;
   border: 1px solid var(--outline-variant);
   background: var(--off-blue);
   padding: 0.45rem 0.75rem;
   color: var(--color-font);
   transition: 150ms ease-in-out;
}

button:hover {
   border-color: var(--outline);
}

p.sub {
   font-size: 0.8rem;
   line-height: 1.5;
   font-weight: 400;
   color: var(--color-font-faded);
}

a {
   color: var(--color-font-faded);
   transition: color 200ms ease-in-out;
}

a:hover {
   color: var(--color-font);
}

</style>