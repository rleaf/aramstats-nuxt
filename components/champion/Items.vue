<script setup>
import { superStore } from '@/stores/superStore'

const store = superStore()
const item = ref(null)
const wins = ref(0)
const total = ref(0)
const mean = ref(0)
const popularity = ref(0)
const slotPopularity = ref([0, 0, 0, 0, 0, 0])
const popularityFocus = ref(null)
const slotWinrate = ref([0, 0, 0, 0, 0, 0])

const props = defineProps(['championData'])
const { championData } = toRefs(props)

function setItem(id) {
   setLabels(id)

   for (const [k, v] of Object.entries(championData.value.items)) {
      if (v[item.value]) {
         wins.value += v[item.value].wins
         slotPopularity.value[k - 1] = (v[item.value].games / total.value)
         slotWinrate.value[k - 1] = (v[item.value].wins / v[item.value].games)
      }
   }
   popularity.value = (total.value / championData.value.games * 100).toFixed(1) + '%'
}

function setLabels(o) {
   if (o) {
      item.value = o
      total.value = itemSum()
   } else {
      item.value = null
      total.value = 0
   }

   wins.value = 0
   mean.value = 0
   popularity.value = 0
   slotPopularity.value = [0, 0, 0, 0, 0, 0]
   slotWinrate.value = [0, 0, 0, 0, 0, 0]
}

function itemSum() {
   let lobster = 0
   for (const o in championData.value.items) {
      if (championData.value.items[o][item.value]) {
         lobster += championData.value.items[o][item.value].games
      }
   }
   return lobster
}

function itemImage(id) {
   return `https://ddragon.leagueoflegends.com/cdn/${store.patches[0]}/img/item/${id}.png`
}

function winrate(total, win) {
   return (win / total * 100)
}
   
// const getItemName = computed(() => {
//    if (itemData.value && item.value) {
//       return itemData.value[item.value].name
//    }
// })
</script>

<template>
   <div class="items-main" id="items">
      <div class="section-header">
         <h1>Items</h1>
         <!-- <img @click="this.config.modals.items = true" class="settings" src="/svg/ellipses.svg" alt=""> -->
      </div>
      <div class="section">
         <div class="synopsis">
            <div class="synopsis-header">
               <div class="image-wrapper">
                  <img v-if="item" :src="itemImage(item)" @click="setLabels()" alt="">
               </div>
               <div v-if="item">{{ store.items[item].name }}</div>
               <div class="placeholder" v-else>Click an item</div>
            </div>
            <div class="synopsis-body">

               <div>
                  <div class="chart-header">
                     <h4>Popularity</h4>
                     <UXTooltip :align="'left'" :tip="'popularity'" />
                  </div>
                  <svg>
                     <g v-for="(k, i) in 6" :key="i">
                        <text :x="`${i * 37 + 18}`" y="95%">{{ (slotPopularity[i] * 100).toFixed(1) + '%'}}</text>
                        <rect @mouseenter="popularityFocus = k" :class="{ 'rect-focus': popularityFocus === k }" class="backdrop" :x="`${i * 37 + 5}`" y="20%" rx="2" width="24" height="80%"></rect>
                        <rect @mouseenter="popularityFocus = k" class="value" :x="`${i * 37 + 5}`" y="20%" rx="2" width="24" :height="slotPopularity[i] * 80"></rect>
                     </g>
                  </svg>
                  <div class="details">
                     <div>Item Popularity: <span class="value">{{ (item) ? popularity : '-' }}</span></div>
                     <div>Slot Frequency: <span class="value"> {{ (popularityFocus && item) ? championData.items[popularityFocus][item].games : '-' }} </span></div>
                     <div>Total Frequency: <span class="value">{{ total || '-' }}</span></div>
                  </div>
               </div>
               <div>
                  <div class="chart-header">
                     <h4>Winrate</h4>
                     <UXTooltip :align="'left'" :tip="'winrate'" />
                  </div>
                  <svg>
                     <g v-for="(_, i) in 6" :key="i">
                        <text :x="`${i * 37 + 18}`" y="95%">{{ (slotWinrate[i] * 100).toFixed(0) + '%'}}</text>
                        <rect class="backdrop" :x="`${i * 37 + 5}`" y="20%" rx="2" width="24" height="80%"></rect>
                        <rect class="value" :x="`${i * 37 + 5}`" y="20%" rx="2" width="24" :height="slotWinrate[i] * 80"></rect>
                     </g>
                  </svg>
                  <div class="details">
                     <div>Item winrate: <span class="value">{{ (item) ? ((wins / total) * 100).toFixed(1) + '%' : '-'  }}</span></div>
                  </div>
               </div>
            </div>
         </div>
         <div class="table">
            <div class="headers">
               <h3 v-for="i in 6" :key="i">{{ i }}</h3>
            </div>
            <div class="table-data">
               <div class="column" :class="{ 'column-bg': (i + 1) % 2 === 0 }" v-for="i in 6" :key="i">
                  <div class="element" v-for="([k, v], j) of Object.entries(championData.items[i]).sort((a, b) => b[1].games - a[1].games)" :key="j">
                     <img :class="{'item-fade' : item != k && item }" :src="itemImage(k)" @click="setItem(k)" alt="">
                     <div>
                        <div :class="{ 'font-fade': item != k && item }" class="winrate">{{ winrate(v.games, v.wins).toFixed(1) + '%' }}</div>
                        <div class="games">{{ v.games }}</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<style scoped>
@import url('@/assets/css/championComponent.css');

.section {
   color: var(--color-font);
   height: 80vh;
   display: flex;
   justify-content: space-between;
}
.synopsis {
   border-right: 1px solid var(--outline);
   width: 270px;
   padding-left: 20px;
}

.synopsis-header {
   display: flex;
   align-items: center;
   margin-top: 30px;
   margin-bottom: 50px;
   gap: 20px;
   font-weight: bold;
}

.synopsis-body {
   display: flex;
   flex-direction: column;
}

.synopsis-body > div {
   margin-bottom: 30px;
   width: 220px;
}

.placeholder {
   font-size: 0.75rem;
   font-weight: normal;
   font-style: italic;
   color: var(--color-font-faded);
}
.chart-header {
   display: flex;
   gap: 10px;
   align-items: center;
}

h4 {
   display: inline-block;
   margin: 0;
   font-weight: normal;
   font-size: 0.9rem;
   color: var(--color-font);
}

svg {
   width: inherit;
   height: 100px;
   margin-top: 10px;
   margin-bottom: 5px;
}

text {
   fill: var(--color-font);
   font-size: 0.7rem;
   text-anchor: middle;
}
text.slot {
   fill: var(--color-font);
   font-size: 0.75rem;
}

.synopsis-body > div:first-child rect {
   cursor : pointer;
}

rect.backdrop {
   fill: var(--surface-container);
   transform: rotate(180deg) scaleX(-1);
   transform-origin: center center;
   transition: 0.15s ease-in-out; 
}
rect.value {
   fill: var(--secondary);
   transform: rotate(180deg) scaleX(-1);
   transform-origin: center center;
   transition: height 0.5s;
}

rect.rect-focus {
   fill: var(--surface-container-highest);
}

.details {
   font-size: 0.8rem;
   width: 180px;
   color: var(--color-font-faded);
}

.details > div {
   display: flex;
   justify-content: space-between;
   margin-bottom: 0.25rem;
   margin-left: 5px;
}

.details .value {
   min-width: 50px;
   color: var(--color-font);
}

.image-wrapper {
   width: 42px;
   height: 42px;
   border: 1px solid var(--outline-variant);
   background: var(--surface-container);
}
.image-wrapper img {
   width: inherit;
   height: inherit;
   cursor: pointer;
}

.table {
   width: 780px;
   display: flex;
   flex-direction: column;
}
.table-data {
   width: 100%;
   height: calc(80vh - 2.5rem);
   display: flex;
   justify-content: space-around;
}


.headers {
   width: 100%;
   display: flex;
   justify-content: space-around;
}

.headers h3 {
   margin: 0;
   font-weight: normal;
   color: var(--color-font-faded);
   font-size: 1rem;
   margin-bottom: 1.5rem;
}

.column {
   padding: 20px;
   border-radius: 5px;
   overflow-y: scroll;
}

.column::-webkit-scrollbar {
   width: 4px;
}

.column::-webkit-scrollbar-track {
   border-radius: 5px;
   padding-right: 15px;
}

.column::-webkit-scrollbar-thumb {
   background: var(--outline-variant);
   border-radius: 5px;
   
}
.column::-webkit-scrollbar-thumb:hover {
   background: var(--outline);
   transition: 0.25s;
}

.winrate {
   color: var(--color-font);
   font-size: 0.8rem;
   transition: 0.25s ease-in-out;
}
.element {
   margin-bottom: 10px;
   text-align: center;
   -webkit-touch-callout: none; /* iOS Safari */
   -webkit-user-select: none; /* Safari */
   -khtml-user-select: none; /* Konqueror HTML */
   -moz-user-select: none; /* Old versions of Firefox */
   -ms-user-select: none; /* Internet Explorer/Edge */
   user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}
.games {
   color: var(--color-font-faded);
   font-size: 0.75rem;
}
.column-bg {
   background: var(--surface-container);
}

.column img {
   display: block;
   margin: 0 auto;
   margin-bottom: 3px;
   width: 34px;
   cursor: pointer;
   border: 1px solid var(--outline-variant);
   transition: 0.25s ease-in-out;
}

img.item-fade {
   filter: saturate(0);
   opacity: 0.3;
}

.font-fade {
   color: var(--color-font-faded);
}


</style>