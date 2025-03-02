<script setup>
const { response } = defineProps(['response'])
const { stage, data } = response

useHead({
   title: 'ARAM Stats'
})

const queueInfo = computed(() => {
   // document.title = `(${data.parse.current} / ${data.parse.total}) | ARAM Stats`
   return `${data.parse.current} / ${data.parse.total} matches completed`
})

</script>

<template>
   <div class="loading-main">
      <div v-if="stage === 'Queue'">
         <h2>Summoner is in queue.</h2>
         <p class="sub">
            <span v-if="data === 1">You are next.</span>
            <span v-else-if="data - 1 === 1">There is 1 summoner ahead of you.</span>
            <span v-else>There are {{ data - 1 }} summoners ahead of you.</span>
            <br>
            <NuxtLink
               :to="{ name: 'summoner-region-gameName-tagLine', params: { region: 'na', gameName: 'ryi', tagLine: 'na1' } }"
               target="_blank">Here</NuxtLink> is what you can expect to see.
         </p>
         <!-- <p v-if="data === 1">You are next.</p>
         <p v-else-if="data - 1 === 1">There is 1 summoner ahead of you.</p>
         <p v-else>There are {{ data - 1 }} summoners ahead of you.</p> -->

      </div>

      <div v-else-if="stage === 'Parsing'">
         <h2>Currently parsing summoner.</h2>
         <p class="queue">{{ queueInfo }}</p>
         <p class="sub">
            I update every 30 seconds. A single summoner can take, ballpark, upwards of 20 min to complete. Feel free to
            close this window & check back later.
         </p>
      </div>

      <div v-else-if="stage === 'Unparsed'">
         <h2>Hello, it seems this summoner has never been parsed.</h2>
         <p class="sub">
            This process can take some time, upwards of 20 minutes if there is no queue. You'll be able to refresh the page to see your accounts progress.
            <NuxtLink
               :to="{ name: 'summoner-region-gameName-tagLine', params: { region: 'na', gameName: 'ryi', tagLine: 'na1' } }"
               target="_blank">Here</NuxtLink>
            is what you can expect to see when the account finishes.
         </p>
         <button @click="$emit('parseSummoner')">Parse summoner</button>
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

p.queue {
   font-weight: 500;
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