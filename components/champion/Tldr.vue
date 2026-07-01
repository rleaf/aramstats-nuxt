<script setup>
import { superStore } from '@/stores/superStore'
import { championStore } from '@/stores/championStore'
import { _runes, _flex } from '@/constants/runes'

const coreFocus = ref(0)
const organizedCore = ref([])
const config = championStore()
const maxWinrate = ref(0)
const minWinrate = ref(2)

const store = superStore()
const props = defineProps(['championData'])
const { championData } = toRefs(props)

watch(championData, () => {
   organizedCore.value = []
   maxWinrate.value = 0
   minWinrate.value = 2
   coreFocus.value = 0
   sortCore()
})

sortCore()
function sortCore() {
   for (const c in championData.value.core) {
      championData.value.core[c].core = c
      championData.value.core[c].winrate = championData.value.core[c].wins / championData.value.core[c].games
      if (championData.value.core[c].winrate > maxWinrate.value) maxWinrate.value = championData.value.core[c].winrate
      if (championData.value.core[c].winrate < minWinrate.value) minWinrate.value = championData.value.core[c].winrate
      organizedCore.value.push(championData.value.core[c])
   }
   organizedCore.value.sort((a, b) => b.games - a.games)
}

function lerpColors(wr) {
   const val = (wr - minWinrate.value) / (maxWinrate.value - minWinrate.value)
   const green = [79, 201, 79]
   const red = [201, 40, 0]

   const lerp = green.map((p, i) => p * val + red[i] * (1 - val))
   return `rgba(${lerp[0]},${lerp[1]},${lerp[2]})`
}

function coreItemImage(id) {
   return (id === '10010') ? '/images/boots.png' : `https://ddragon.leagueoflegends.com/cdn/${store.patches[0]}/img/item/${id}.png`
}

function itemSort(obj) {
   let arr = []
   for (const i in obj) {
      arr.push([i, obj[i].games, obj[i].wins])
   }

   if (config.winrateSort) {
      arr.sort((a, b) => (a[1] / a[2]) - (b[1] / b[2]))
      arr = arr.filter(v => (v[1] / organizedCore.value[coreFocus.value].games) > config.winrateThreshold)
   } else {
      arr.sort((a, b) => b[1] - a[1])
   }

   return arr
}

function masterSort(obj) {
   /* 
      Take any obj with games & wins value for Tldr section and return desired datum based off winrate configuration.
   */

   let peaches = [0, 0, 0] // [datum, games, wins]
   let roll = 0
   if (config.winrateSort) {
      for (const j in obj) {
         if (!obj[j] || (obj[j].games / organizedCore.value[coreFocus.value].games) < config.winrateThreshold) continue
         const potato = (obj[j].wins / obj[j].games)
         if (potato >= roll) {
            roll = potato
            peaches = [j, obj[j].games, obj[j].wins]
         }
      }
   } else {
      for (const j in obj) {
         if (!obj[j]) continue
         if (obj[j].games >= roll) {
            roll = obj[j].games
            peaches = [j, obj[j].games, obj[j].wins]
         }
      }
   }
   return peaches
}

function itemImage(id) {
   return `https://ddragon.leagueoflegends.com/cdn/${store.patches[0]}/img/item/${id}.png`
}

function filteredWinrate(wr) {
   return (wr * 100).toFixed(1) + '%'
}

function activeSkill(i, j) {
   const map = {
      1: 'Q',
      2: 'W',
      3: 'E',
      4: 'R'
   }

   if (levels.value[0][i - 1] == j) return map[j]
}

const startingItems = computed(() => {
   return masterSort(organizedCore.value[coreFocus.value].starting)
})

function romanNumerals(i) {
   switch (i) {
      case 1:
         return 'I'
      case 2:
         return 'II'
      case 3:
         return 'III'
      case 4:
         return 'IV'
      case 5:
         return 'V'
      case 6:
         return 'VI'
      default:
         break;
   }
}

const startingSpells = computed(() => {
   return masterSort(organizedCore.value[coreFocus.value].spells)
})

const activePrimaryRunes = computed(() => {
   let primary = []
   for (const c in _runes[primaryRunes.value[0]]) {
      const pre = _runes[primaryRunes.value[0]][c].reduce((a, b) => ({ ...a, [b]: organizedCore.value[coreFocus.value].runes.primary[b] }), {})
      primary.push(masterSort(pre)[0])
   }
   return primary
})

const activeSecondaryRunes = computed(() => {
   let filter
   let baguette = []
   const secondaries = _runes[secondaryRunes.value[0]].slice(1)

   for (const c in secondaries) {
      const pre = secondaries[c].reduce((a, b) => ({ ...a, [b]: organizedCore.value[coreFocus.value].runes.secondary[b] }), {})
      baguette.push(masterSort(pre))
   }

   (config.winrateSort) ? filter = baguette.map(x => (x[2] / x[1]) || 0) : filter = baguette.map(x => x[1])

   const j = filter.indexOf(Math.min(...filter))
   baguette.splice(j, 1)

   return baguette.map(x => parseInt(x[0]))
})

const activeFlexRunes = computed(() => {
   const flex = []

   flex.push(masterSort(organizedCore.value[coreFocus.value].runes.tertiary.offense)[0])
   flex.push(masterSort(organizedCore.value[coreFocus.value].runes.tertiary.flex)[0])
   flex.push(masterSort(organizedCore.value[coreFocus.value].runes.tertiary.defense)[0])

   return flex
})

const primaryRunes = computed(() => {
   return masterSort(organizedCore.value[coreFocus.value].runes.tree.primary)
})

const secondaryRunes = computed(() => {
   const x = Object.assign({}, organizedCore.value[coreFocus.value].runes.tree.secondary)
   delete x[primaryRunes[0]]
   return masterSort(x)
})

const levels = computed(() => {
   if (config.winrateSort) {
      let potato
      let roll = 0
      for (const i in organizedCore.value[coreFocus.value].levels) {
         if ((organizedCore.value[coreFocus.value].levels[i][1] / organizedCore.value[coreFocus.value].games) < config.winrateThreshold) break
         if ((organizedCore.value[coreFocus.value].levels[i][2] / organizedCore.value[coreFocus.value].levels[i][1]) > roll) {
            potato = organizedCore.value[coreFocus.value].levels[i]
            roll = (organizedCore.value[coreFocus.value].levels[i][2] / organizedCore.value[coreFocus.value].levels[i][1])
         }
      }

      return potato
   } else {
      return organizedCore.value[coreFocus.value].levels[0]
   }
})

</script>

<template>
   <div class="tldr-main">
      <div class="section-header">
         <h1>Overview</h1>
         <TldrModal />
         <UXTooltip :tip="'tldr'" :size="'big'" />
      </div>
      <div class="section">
         <div class="core-selection">
            <div class="combination-tooltip">
               <p>Select a <b>combination</b></p>
            </div>
            <div class="combinations">
               <div class="core" :class="{ 'core-focus': coreFocus === i }" @click="coreFocus = i"
                  v-for="(c, i) in organizedCore" :key="i">
                  <div class="core-numbers">
                     <div :style="{ 'color': lerpColors(c.winrate) }" class="winrate">{{
                        filteredWinrate(c.winrate) }}</div>
                     <div class="total">{{ c.games }}</div>
                  </div>
                  <div class="core-img">
                     <img :src="coreItemImage(i)" alt="" v-for="(i, j) in c.core.split('_')" :key="j">
                  </div>
               </div>
            </div>
         </div>
         <div class="tldr-wrapper">

            <div>
               <div class="items">
                  <div class="items-wrapper">
   
                     <div class="items-column" :class="{ 'column-bg': (i + 1) % 2 === 0 }" v-for="i in 6" :key="i">
                        <span>{{ i }}</span>
                        <div v-for="(j, k) in itemSort(organizedCore[coreFocus].items[i]).slice(0, 2)" :key="k">
                           <img @mouseenter="store.setTooltipData({ event: $event, key: j[0], mode: 'items' })"
                              @mouseleave="store.tooltip.active = false" :src="itemImage(j[0])" alt="">
                           <div class="winrate">{{ filteredWinrate(j[2] / j[1]) }}</div>
                           <div class="total">{{ j[1] }} games</div>
                        </div>
                     </div>
                  </div>
   
               </div>
               <div class="runes-wrapper">
                  <div class="tldr-primary">
                     <div class="misc">
                        <img :src="`/runes/${primaryRunes[0]}.png`" />
                        <div>
                           <h3>{{ filteredWinrate(primaryRunes[2] / primaryRunes[1]) }}</h3>
                           <h3>{{ primaryRunes[1] }} games</h3>
                        </div>
                     </div>
                     <div class="rune-row" alt="" v-for="(row, i) in _runes[primaryRunes[0]]" :key="i">
                        <img :class="{ 'active-rune': rune == activePrimaryRunes[i] }" v-for="(rune, j) in row"
                           :src="`/runes/${rune}.png`" alt=""
                           @mouseenter="store.setTooltipData({ event: $event, key: rune, mode: 'runes', runeTree: primaryRunes[0], runeRow: i })"
                           @mouseleave="store.tooltip.active = false" :key="j">
                     </div>
                  </div>
                  <div>
                     <div class="tldr-secondary">
                        <div class="misc">
                           <img :src="`/runes/${secondaryRunes[0]}.png`" />
                           <div>
                              <h3>{{ filteredWinrate(secondaryRunes[2] / secondaryRunes[1]) }}</h3>
                              <h3>{{ secondaryRunes[1] }} games</h3>
                           </div>
                        </div>
                        <div class="rune-row" v-for="(row, i) in _runes[secondaryRunes[0]].slice(1)" :key="i">
                           <img :class="{ 'active-rune': activeSecondaryRunes.includes(rune) }"
                              v-for="(rune, j) in row" :src="`/runes/${rune}.png`" alt=""
                              @mouseenter="store.setTooltipData({ event: $event, key: rune, mode: 'runes', runeTree: secondaryRunes[0], runeRow: i + 1 })"
                              @mouseleave="store.tooltip.active = false" :key="j">
                        </div>
                     </div>
                     <div class="tldr-flex">
                        <div class="rune-row" v-for="(row, i) in _flex" :key="i">
                           <img :class="{ 'active-rune': rune == activeFlexRunes[i] }" v-for="(rune, j) in row"
                              @mouseenter="store.setTooltipData({ event: $event, key: rune, mode: 'runes', runeTree: _flex, runeRow: i })"
                              @mouseleave="store.tooltip.active = false" :src="`/runes/flex/${rune}.png`" alt=""
                              :key="j">
                        </div>
                     </div>
                  </div>
               </div>
               
            </div>
            <div class="runes-leveling">
               <div class="leveling">
                  <div class="sub-section-header">
                     <a @click="$emit('scroll', 'spells')" class="title">Level Order</a>
                     <div class="misc">
                        <h3>{{ filteredWinrate(levels[2] / levels[1]) }}</h3>
                        <h3>{{ levels[1] }} games</h3>
                     </div>
                     <!-- <div class="sub-rhs">
                        <UXTooltip :align="'right'" :tip="'levels'" />
                     </div> -->
                  </div>
                  <div class="ylabels">
                     <span v-for="i in 18" :key="i">{{ i }}</span>
                  </div>
                  <div class="level-wrapper">
                     <div class="level-column" v-for="i in 18" :key="i">
                        <div class="level-row" :class="{ 'active-level': levels[0][i - 1] == j }" v-for="j in 4"
                           :key="j">
                           {{ activeSkill(i, j) }}
                        </div>
                     </div>
                  </div>
               </div>
              <div class="starting-spells">
                  <div class="starting">
                     <div class="sub-section-header">
                        <a @click="$emit('scroll', 'spells')" class="title">Starting</a>
                        <div class="misc">
                           <h3>{{ filteredWinrate(startingItems[2] / startingItems[1]) }}</h3>
                           <h3>{{ startingItems[1] }} games</h3>
                        </div>
                        <!-- <div class="sub-rhs">
                           <UXTooltip :tip="'starting'" />
                        </div> -->
                     </div>
                     <img v-if="(typeof startingItems[0] === 'string')" v-for="(i, j) in startingItems[0].split('_')"
                        :src="itemImage(i)" @mouseenter="store.setTooltipData({ event: $event, key: i, mode: 'items' })"
                        @mouseleave="store.tooltip.active = false" class="starting-image" alt="" :key="j">
                     <p class="no-data" v-else> Not enough data :(</p>
                  </div>
                  <div class="spells">
                     <div class="sub-section-header">
                        <a @click="$emit('scroll', 'spells')" class="title">Spells</a>
                        <div class="misc">
                           <h3>{{ filteredWinrate(startingSpells[2] / startingSpells[1]) }}</h3>
                           <h3>{{ startingSpells[1] }} games</h3>
                        </div>
                        <!-- <div class="sub-rhs">
                           <UXTooltip :tip="'spells'" />
                        </div> -->
                     </div>
                     <img class="starting-image" v-for="(id, i) in startingSpells[0].split('_')"
                        @mouseenter="store.setTooltipData({ event: $event, key: id, mode: 'spells' })"
                        @mouseleave="store.tooltip.active = false" :src="`/spells/${id}.webp`" alt="" :key="i">
                  </div>
               </div>
               
            </div>
         </div>
      </div>
   </div>
</template>

<style scoped>
@import url('@/assets/css/championComponent.css');

.no-data {
   color: var(--color-font-faded);
   font-style: italic;
   font-size: 0.8rem;
}

.section {
   display: flex;
   /* justify-content: space-evenly; */
   gap: 30px;
   height: 405px;
   color: var(--color-font);
}

/* .section > div { */
.tldr-wrapper > div {
   display: flex;
   flex-direction: row;
   gap: 40px;
   align-items: flex-end;
   /* justify-content: space-between; */
}

.tldr-wrapper {
   display: flex;
   min-width: 800px;
   flex-direction: column;
   justify-content: space-between;
}
.combination-tooltip {
   display: flex;
   align-items: center;
   justify-content: space-between;
   color: var(--color-font-faded);
   font-size: 0.75rem;
   font-style: italic;
   padding-bottom: 0.6rem;
   padding-right: 25px;
}

.combination-tooltip p {
   margin: 0;
   display: inline-block;
}

.core-selection {
   display: flex;
   flex-direction: column;
   border-right: 1px solid var(--outline);
}

.combinations {
   padding-right: 20px;
   overflow: scroll;
   overflow-x: hidden;
}

.combinations::after {
   position: absolute;
   bottom: 0;
   height: 100%;
   content: '';
   background: tomato;
}

.combinations::-webkit-scrollbar {
   width: 2px;
}

.combinations::-webkit-scrollbar-thumb {
   background: var(--outline);
}

.starting-spells {
   display: flex;
  flex-direction: column;
   justify-content: space-between;
   /* gap: 50px; */
   height: 160px;
}

.starting {
   min-width: 180px;
}

.spells {
   min-width: 180px;
   /* margin-top: 80px; */
}

div.runes-leveling {
   gap: 120px;
   /* width: 360px; */
}

.runes-wrapper {
   display: flex;
   gap: 20px;
   justify-content: space-between;
}

.runes-wrapper img {
   filter: saturate(0);
   opacity: 0.4;
}

img.active-rune {
   opacity: 1;
   filter: saturate(1.3);
}

.tldr-primary,
.tldr-secondary,
.tldr-flex {
   display: flex;
   flex-direction: column;
   align-items: center;
}

.tldr-primary .misc,
.tldr-secondary .misc {
   margin-bottom: 10px;
}

.tldr-primary .rune-row:nth-child(2) img {
   width: 40px;
}

.tldr-primary .rune-row img {
   width: 28px;
}

.tldr-primary .rune-row:not(:nth-child(2)) img {
   padding: 6px;
}

.tldr-secondary img:not(:first-child) {
   padding: 1px 2px;
}

.tldr-secondary img {
   width: 24px;
}

.tldr-flex img {
   width: 24px;
   margin: 0 3px;
   background: var(--surface-container);
   border-radius: 100%;
}

.rune-row {
   display: inline-block;
}

.level-wrapper {
   display: flex;
}

.ylabels {
   font-size: 0.7rem;
   color: var(--color-font-faded);
   margin-bottom: 2px;
}

.ylabels span {
   display: inline-block;
   text-align: center;
   width: 24px;
}

.level-row {
   width: 22px;
   height: 20px;
   margin: 2px 1px;
   /* border: 2px solid transparent; */
   border-radius: 2px;
   background: var(--surface-container);
   /* background: var(--surface-container); */
   text-align: center;
   font-size: 0.7rem;
   line-height: 20px;
}

.active-level {
   /* border: 1px solid var(--outline-variant); */
   color: var(--on-secondary-container);
   background: var(--secondary-container);
}

img.starting-image {
   width: 32px;
   border: 1px solid var(--outline-variant);

}

img.starting-image:not(:nth-child(2)) {
   margin-left: 5px;
}

.items-column span {
   /* font-weight: bold; */
   font-family: 'Thestral';
   font-size: 1rem;
}

.items {
   color: var(--color-font);
}

.column-bg {
   background: var(--surface-container);
}

.items-wrapper {
   display: flex;
   gap: 10px;
}

.items-column {
   display: flex;
   flex-direction: column;
   gap: 20px;
   align-items: center;
   padding: 15px 3px;
   width: 70px;
   border-radius: 3px;
}

.items-column img {
   display: block;
   margin: 0 auto;
   margin-bottom: 3px;
   width: 32px;
   border: 1px solid var(--outline-variant);
}

.core {
   display: flex;
   padding: 8px 10px;
   margin: 5px 0;
   gap: 10px;
   justify-content: space-between;
   color: var(--color-font);
   align-items: center;
   transition: 0.2s;
   border: 1px solid transparent;
   border-radius: 3px;
   cursor: pointer;
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

.core-focus {
   background: var(--surface-container);
   border: 1px solid var(--outline);
}

.core:hover {
   background: var(--surface-container);
}

.core-img {
   height: 34px;
}

.core-img img {
   width: 32px;
   border: 1px solid var(--outline-variant);
}

.core-numbers {
   width: px;
}

.winrate {
   text-align: center;
   font-size: 0.8rem;
}

.total {
   font-size: 0.70rem;
   text-align: center;
   color: var(--color-font-faded);
}

.core-img img:not(:first-child) {
   margin-left: 5px;
}
</style>