<script setup>
import { superStore } from '@/stores/superStore'
import { championNames } from '~/constants/championNames'

const store = superStore()
await store.initPatches()
const { start, finish } = useLoadingIndicator()
const queryPatch = ref(useRoute().query.patch || store.recentCleanPatch)
const championData = ref(null)
const sort = ref(1)
const descending = ref(false)
const winrates = reactive({
   max: 0,
   min: 101,
   delta: 0
})

await store.initPatches()
const { data: payload, error } = await useAsyncData(
   () => $fetch('/api/champions', {
      query: {
         patch: queryPatch.value
      }
   }))

championData.value = payload.value.championData
if (payload.value.patch !== queryPatch.value) {
   store.setNotification(`Patch ${queryPatch.value} data unavailable. Defaulting to ${payload.value.patch}.`)
   queryPatch.value = payload.value.patch
}

if (error.value) {
   throw createError({ statusCode: error.value.statusCode, fatal: true })
}

useSeoMeta({
   title: `Champions - ARAM Stats`,
   ogTitle: `Champions - ARAM Stats`,
   description: `ARAM tier list on patch ${store.recentCleanPatch}.`,
   ogDescription: `ARAM tier list on patch ${store.recentCleanPatch}.`,
})

computeWinrates()

function computeWinrates() {
   for (const i in championData.value) {
      const c = championData.value[i]
      c.winrate = Math.round(c.wins / c.games * 10000) / 100

      for (const j in c.metrics) {
         c[j] = {}
         c[j].m = computeSampleMean(c.metrics[j].x, c.games)
         c[j].v = computeSampleVariance(c.games, c.metrics[j].x, c.metrics[j].xx)
      }

      delete c.metrics
      if (c.winrate > winrates.max) winrates.max = c.winrate
      if (c.winrate < winrates.min) winrates.min = c.winrate
   }

   // for the lerp homie.
   winrates.delta = winrates.max - winrates.min
}

function computeSampleMean(o, g) {
   if (!o) return '-'
   return Math.round(o / g)
}

function computeSampleVariance(games, x, xx) {
   if (!games) return '-'
   return Math.round(Math.sqrt(((xx) - ((x ** 2) / games)) / (games - 1)))
}

function cleanPatch(patch) {
   return patch.split('.').slice(0, 2).join('.')
}

async function patchChange(patch) {
   if (cleanPatch(patch) === queryPatch.value) return
   start()
   queryPatch.value = cleanPatch(patch)
   const res = await $fetch('/api/champions', {
      query: {
         patch: queryPatch.value
      }
   })

   if (res) {
      championData.value = res.championData
      useRouter().push({ query: { patch: queryPatch.value } })
      computeWinrates()
   } else {
      store.setNotification('Patch data unavailable.')
   }
   finish()
}

function headerSort(o) {
   o === sort.value ? descending.value = !descending.value : sort.value = o
}

function headersExtended(val) {
   switch (val) {
      case 4:
         return 'DPM µ'
      case 5:
         return 'DPM σ'
      case 6:
         return 'DTPM µ'
      case 7:
         return 'DTPM σ'
      case 8:
         return 'DMPM µ'
      case 9:
         return 'DMPM σ'
      case 10:
         return 'GPM µ'
      case 11:
         return 'GPM σ'
      default:
         return '-'
   }
}

function championRoute(id) {
   if (championNames[id]) {
      // console.warn(`Champion ID ${id} not found in championNames constant.`)
      // return 'unknown'
   }
   return (id === 62) ? 'wukong' : championNames[id][0]
}

function champIcon(id) {
   return `https://ddragon.leagueoflegends.com/cdn/${store.patches[0]}/img/champion/${championNames[id][0]}.png`
}

function computeColor(g) {
   const val = (g - winrates.min) / winrates.delta
   const green = [79, 201, 79]
   const red = [201, 40, 0]

   const lerp = green.map((p, i) => p * val + red[i] * (1 - val))
   return `rgba(${lerp[0]},${lerp[1]},${lerp[2]})`
}

const headers = computed(() => {
   return [
      ['Champion', '_id'],
      ['Winrate', 'winrate'],
      ['Games', 'games'],
      ['Pickrate', 'pickRate'],
      ['DPM', 'dpm'],
      ['DTPM', 'dtpm'],
      ['SMPM', 'dmpm'],
      ['GPM', 'gpm'],
   ]
})

const getChampionsList = computed(() => {
   if (championData.value) {
      switch (true) {
         case sort.value === 0:
            return (descending.value) ? championData.value.sort((a, b) => championNames[b._id][1].localeCompare(championNames[a._id][1])) :
               championData.value.sort((a, b) => championNames[a._id][1].localeCompare(championNames[b._id][1]))
         case sort.value === 1:
            return (descending.value) ? championData.value.sort((a, b) => (a.winrate) - (b.winrate)) :
               championData.value.sort((a, b) => (b.winrate) - (a.winrate))
         case sort.value === 2:
            return (descending.value) ? championData.value.sort((a, b) => (a.games) - (b.games)) :
               championData.value.sort((a, b) => (b.games) - (a.games))
         case sort.value === 3:
            return (descending.value) ? championData.value.sort((a, b) => (a.pickRate) - (b.pickRate)) :
               championData.value.sort((a, b) => (b.pickRate) - (a.pickRate))
         case sort.value === 4 && typeof (championData.value[0].dpm) === 'object':
            return (descending.value) ? championData.value.sort((a, b) => (a.dpm.m) - (b.dpm.m)) :
               championData.value.sort((a, b) => (b.dpm.m) - (a.dpm.m))
         case sort.value === 5 && typeof (championData.value[0].dpm) === 'object':
            return (descending.value) ? championData.value.sort((a, b) => (a.dpm.v) - (b.dpm.v)) :
               championData.value.sort((a, b) => (b.dpm.v) - (a.dpm.v))
         case sort.value === 6 && typeof (championData.value[0].dtpm) === 'object':
            return (descending.value) ? championData.value.sort((a, b) => (a.dtpm.m) - (b.dtpm.m)) :
               championData.value.sort((a, b) => (b.dtpm.m) - (a.dtpm.m))
         case sort.value === 7 && typeof (championData.value[0].dtpm) === 'object':
            return (descending.value) ? championData.value.sort((a, b) => (a.dtpm.v) - (b.dtpm.v)) :
               championData.value.sort((a, b) => (b.dtpm.v) - (a.dtpm.v))
         case sort.value === 8 && typeof (championData.value[0].dmpm) === 'object':
            return (descending.value) ? championData.value.sort((a, b) => (a.dmpm.m) - (b.dmpm.m)) :
               championData.value.sort((a, b) => (b.dmpm.m) - (a.dmpm.m))
         case sort.value === 9 && typeof (championData.value[0].dmpm) === 'object':
            return (descending.value) ? championData.value.sort((a, b) => (a.dmpm.v) - (b.dmpm.v)) :
               championData.value.sort((a, b) => (b.dmpm.v) - (a.dmpm.v))
         case sort.value === 10 && typeof (championData.value[0].gpm) === 'object':
            return (descending.value) ? championData.value.sort((a, b) => (a.gpm.m) - (b.gpm.m)) :
               championData.value.sort((a, b) => (b.gpm.m) - (a.gpm.m))
         case sort.value === 11 && typeof (championData.value[0].gpm) === 'object':
            return (descending.value) ? championData.value.sort((a, b) => (a.gpm.v) - (b.gpm.v)) :
               championData.value.sort((a, b) => (b.gpm.v) - (a.gpm.v))
         default:
            return championData.value.sort((a, b) => championNames[a._id][1].localeCompare(championNames[b._id][1]))
      }
   }
})

</script>

<template>
   <div class="champ-list-main">
      <div class="utilities">

         <div class="patch-wrapper">
            <span class="superscript">Patch:</span>
            <button class="patch-button">{{ queryPatch }}</button>
            <div class="patch-options">
               <button @click="patchChange(patch)" v-for="patch in store.patches" :key="patch">{{ cleanPatch(patch) }}</button>
            </div>
         </div>

         <div class="sort-wrapper">
            <span class="superscript">Sorting by:</span>
            <button v-if="sort < 4" class="sort-button">{{ headers[sort][0] }}</button>
            <button v-else class="sort-button">{{ headersExtended(sort) }}</button>
            <div class="sort-options">
               <div v-for="(h, i) in headers" :key="i">
                  <button v-if="i < 4" @click="sort = i">{{ h[0] }}</button>
                  <div class="sort-metrics" v-else>
                     <span>{{ h[0] }}:</span>
                     <button @click="sort = (Math.floor(i / 4) - 1) * 4 + i + (i % 4)">µ</button>
                     <button @click="sort = (Math.floor(i / 4) - 1) * 4 + i + (i % 4) + 1">σ</button>
                  </div>
               </div>
            </div>
         </div>

         <button @click="descending = !descending">
            <svg width="18" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
               <rect class="asc-des" x="2" y="8" :width="descending ? '6' : '18'" height="2" />
               <rect class="asc-des" x="2" y="13" width="11" height="2" />
               <rect class="asc-des" x="2" y="18" :width="descending ? '18' : '6'" height="2" />
            </svg>
         </button>
         <UXTooltip class='toads' :align="'left'" :tip="'tierlist'" />
      </div>

      <div class="champ-table">
         <div class="header">
            <div v-for="(h, i) in headers" :key="i">
               <div v-if="i < 4">
                  <h2 :class="{ 'highlight': sort === i }" @click="headerSort(i)">{{ h[0] }}</h2>
               </div>
               <div v-else class="metrics">
                  <div>
                     <h3 @click="headerSort(i)">{{ h[0] }}</h3>
                     <hr>
                  </div>
                  <div>
                     <h2 :class="{ 'highlight': sort === (Math.floor(i / 4) - 1) * 4 + i + (i % 4) }"
                        @click="headerSort((Math.floor(i / 4) - 1) * 4 + i + (i % 4))">µ</h2>
                     <h2 :class="{ 'highlight': sort === (Math.floor(i / 4) - 1) * 4 + i + (i % 4) + 1 }"
                        @click="headerSort((Math.floor(i / 4) - 1) * 4 + i + (i % 4) + 1)">σ</h2>
                  </div>
               </div>
            </div>
         </div>
         <div :class="{ 'o': i % 2 === 0 }" class="champion"
            v-for="(champ, i) in getChampionsList" :key="i">
            <div class="index">
               {{ i + 1 }}
            </div>
            <div>
               <NuxtLink :to="{ name: 'champions-champion', params: { champion: championRoute(champ._id) } }">
                  <div class="image-wrapper">
                     <img rel="preload" :src="champIcon(champ._id)" alt="">
                  </div>
                  <div>
                     <span class="name">{{ championNames[champ._id][1] }}</span>
                  </div>
               </NuxtLink>
            </div>
            <div :style="{ color: computeColor(champ.winrate) }" class="winrate">
               {{ champ.winrate }}%
            </div>
            <div>
               {{ champ.games }}
            </div>
            <div>
               {{ champ.pickRate }}%
            </div>
            <div class="metric-value">
               <span>{{ (champ.dpm) ? champ.dpm.m : '-' }}</span>
               <span>{{ (champ.dpm) ? champ.dpm.v : '-' }}</span>
            </div>
            <div class="metric-value">
               <span>{{ (champ.dtpm) ? champ.dtpm.m : '-' }}</span>
               <span>{{ (champ.dtpm) ? champ.dtpm.v : '-' }}</span>
            </div>
            <div class="metric-value">
               <span>{{ (champ.dmpm) ? champ.dmpm.m : '-' }}</span>
               <span>{{ (champ.dmpm) ? champ.dmpm.v : '-' }}</span>
            </div>
            <div class="metric-value">
               <span>{{ (champ.gpm) ? champ.gpm.m : '-' }}</span>
               <span>{{ (champ.gpm) ? champ.gpm.v : '-' }}</span>
            </div>
         </div>
      </div>
   </div>

</template>

<style scoped>
   .utilities {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 950px;
   }

   .toads {
      /* alignment */
      margin-bottom: 5px;
   }

   .highlight {
      color: var(--surface-tint);
   }

   .patch-options,
   .sort-options {
      display: none;
      position: absolute;
      flex-direction: column;
      background: var(--surface);
      padding: 4px 5px;
      border-radius: 3px;
      border: 1px solid var(--outline-variant);
      z-index: 2;
   }

   .patch-wrapper:hover .patch-options {
      display: flex;
   }

   .sort-wrapper:hover .sort-options {
      display: flex;
   }

   .patch-wrapper:hover .patch-button {
      border: 1px solid var(--outline);
   }

   .sort-wrapper:hover .sort-button {
      border: 1px solid var(--outline);
   }

   .utilities>button {
      margin-bottom: 5px;
   }

   .utilities button {
      font-size: 0.9rem;
      padding: 0rem 1rem;
      height: 30px;
      min-width: 45px;
      cursor: pointer;
      border-radius: 3px;
      border: 1px solid var(--outline-variant);
      background: var(--surface);
      color: var(--color-font);
      transition: 150ms ease-in-out;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
   }

   .patch-wrapper>button,
   .sort-wrapper>button {
      margin-bottom: 5px;
   }

   .superscript {
      color: var(--color-font-faded);
      position: absolute;
      font-size: 0.75rem;
      transform: translateY(-1.1rem);
      text-wrap: nowrap;
   }

   .patch-options button,
   .sort-options button {
      border: none;
      display: inline-block;
      cursor: pointer;
      border-radius: 3px;
      min-width: 45px;
      padding: 6px 10px;
   }

   button.sort-button {
      min-width: 100px;
   }

   .patch-options button:hover,
   .sort-options button:hover {
      background: var(--surface-container-highest);
   }

   .sort-metrics span {
      display: inline-block;
      font-weight: normal;
      font-size: 0.7rem;
      padding-left: 10px;
      width: 40px;
      color: var(--color-font-faded);
   }

   .asc-des {
      padding: 0;
      fill: var(--color-font);
      transition: 500ms ease-out;
   }

   .region-button {
      padding: 0.5rem 1rem;
      background: tomato;
   }

   .champ-list-main {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 6vh;
   }

   .champ-table {
      width: 950px;
      padding-bottom: 15vh;
      color: var(--color-font)
   }

   .header {
      position: sticky;
      padding-top: 4vh;
      top: 0;
      background: var(--surface);
      z-index: 1;
      border-radius: 0px;
      display: flex;
      align-items: flex-end;
      padding-left: 50px;
      /* Same width as .champion:nth-child(1) */
      border-bottom: 1px solid var(--outline-variant);
      padding-bottom: 10px;
      /* margin-bottom: 5px; */
   }

   .image-wrapper {
      height: 30px;
      width: 30px;
      margin-right: 10px;
      overflow: hidden;
      border: 1px solid var(--outline-variant);
   }

   .image-wrapper img {
      width: 100%;
      transform: scale(1.1);
   }

   .o {
      background: var(--surface-container);
   }

   .header h2 {
      font-size: 0.85rem;
      font-weight: 600;
      transition: 0.2s;
      cursor: pointer;
      margin: 0;
      -webkit-touch-callout: none;
      /* iOS Safari */
      -webkit-user-select: none;
      /* Safari */
      -khtml-user-select: none;
      /* Konqueror HTML */
      -moz-user-select: none;
      /* Old versions of Firefox */
      -ms-user-select: none;
      /* Internet Explorer/Edge */
      user-select: none;
      /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
   }

   .header h3 {
      display: inline-block;
      text-wrap: nowrap;
      font-size: 0.7rem;
      color: var(--color-font-faded);
      font-weight: normal;
      margin: 0;
      -webkit-touch-callout: none;
      /* iOS Safari */
      -webkit-user-select: none;
      /* Safari */
      -khtml-user-select: none;
      /* Konqueror HTML */
      -moz-user-select: none;
      /* Old versions of Firefox */
      -ms-user-select: none;
      /* Internet Explorer/Edge */
      user-select: none;
      /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
   }

   .metrics hr {
      border: none;
      background-color: var(--outline-variant);
      display: inline-block;
      width: 60%;
      height: 1px;
      margin: 0;
   }

   .metrics {
      width: 120px;
   }

   .metrics>div {
      display: flex;
      align-items: center;
      gap: 2px;
   }

   .metrics>div h2 {
      width: 59px;
   }

   svg.triangle {
      width: 20px;
      height: 20px;
      fill: var(--secondary);
   }

   .descending {
      transform-box: fill-box;
      transform-origin: 7px 10px;
      transform: rotate(180deg);
   }

   .champion {
      display: flex;
      padding-left: 20px;
      align-items: center;
      height: 40px;
      border-radius: 3px;
      font-size: 0.85rem;
   }

   .champion div {
      display: flex;
      align-items: center;
   }

   .champion a {
      display: flex;
      align-items: center;
      font-family: var(--font-main);
      color: var(--color-font);
      text-decoration: none;
      transition: 0.2s;
   }

   .champion div {
      position: relative;
   }

   span.name {
      transition: 200ms ease-in-out;
   }

   span.name:hover {
      color: var(--color-font-focus);
   }

   .champion div span:hover:after {
      width: 100%;
      left: 0;
   }

   .rank,
   .grade {
      min-width: 80px;
   }

   /* INDEX */
   .champion>div:nth-child(1) {
      min-width: 30px;
   }


   /* CHAMPINON NAME */
   .champion>div:nth-child(2),
   .header>div:nth-child(1) {
      min-width: 150px;
   }

   /* WINRATE */
   .champion>div:nth-child(3),
   .header>div:nth-child(2) {
      min-width: 90px;
   }

   /* GAMES */
   .champion>div:nth-child(4),
   .header>div:nth-child(3) {
      min-width: 90px;
   }

   /* PICKRATE */
   .champion>div:nth-child(5),
   .header>div:nth-child(4) {
      min-width: 90px;
   }

   /* DPM */
   .champion>div:nth-child(6),
   .header>div:nth-child(5) {
      min-width: 120px;
   }

   /* DTPM */
   .champion>div:nth-child(7),
   .header>div:nth-child(6) {
      min-width: 120px;
   }

   /* SMPM */
   .champion>div:nth-child(8),
   .header>div:nth-child(7) {
      min-width: 120px;
   }

   /* GPM */
   .champion>div:nth-child(9),
   .header>div:nth-child(8) {
      min-width: 120px;
   }

   .metric-value {
      gap: 2px;
   }

   .metric-value span {
      width: 59px;
   }

   .loading-champ-list {
      display: flex;
      justify-content: center;
      width: 100%;
      color: var(--color-font);
      text-align: center;
   }

   /* Look into improving loading UX eventually */
   /* .loading-champ-list {
      background: linear-gradient(to right, var(--surface) 30%, var(--surface-container) 50%, var(--surface) 80%);
      background-size: 200% auto;
      background-position: 0 100%;
      animation: gradient 3s infinite;
      animation-fill-mode: forwards;
      animation-timing-function: linear;
   }

   @keyframes gradient {
      0% {
         background-position: 0 0;
      }

      100% {
         background-position: -200% 0;
      }
   } */
</style>