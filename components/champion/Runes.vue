<script setup>
import { _runes, _flex } from '@/constants/runes'
import { championStore } from '@/stores/championStore'

const store = championStore()
const { data: runes } = defineProps(['data'])

function primaryRuneWinrate(id) {
   if (runes.primary[id]) {
      return (runes.primary[id].wins / runes.primary[id].games * 100).toFixed(1)
   } else {
      return 0
   }
}

function primaryRuneGames(id) {
   return (runes.primary[id]) ? runes.primary[id].games : 0
}

function secondaryRuneGames(id) {
   return (runes.secondary[id]) ? runes.secondary[id].games : 0
}

function lerpWinrate(wr) {
   // simple 3-step gradient for clarity. Using a smooth lerp as in TLDR is visually detrimental.
   const val = Math.round(wr)
   if (val < 40) return `rgba(201, 40, 0, 1)`
   if (val < 45) return `rgba(160.4, 93.6, 26.3, 1)`
   if (val < 55) return `rgba(119.8, 147.2, 26.3, 1)`
   return `rgba(79, 201, 79, 1)`
}

function findMax(str) {
   let roll = 0
   for (const k in runes[str]) {
      if (runes[str][k].games > roll) {
         roll = runes[str][k].games
      }
   }

   return roll
}

function lerpGames(g, max) {
   // const val = (g - 0) / max
   // const green = [255, 255, 255]
   // const white = [226, 226, 233]
   // const lerp = green.map((p, i) => p * val + white[i] * (1 - val))
   // return `rgba(${lerp[0]},${lerp[1]},${lerp[2]}, 0.6)`

   const opacity = (Math.round(g / max) * 0.4) + 0.6
   return `rgba(var(--on-surface-rgb), ${opacity})`
}

function secondaryRuneWinrate(id) {
   if (runes.secondary[id]) {
      return (runes.secondary[id].wins / runes.secondary[id].games * 100).toFixed(1)
   } else {
      return 0
   }
}

function flexRuneWinrate(id, i) {
   const table = ['offense', 'flex', 'defense']
   if (runes.tertiary[table[i]][id]) {
      return (runes.tertiary[table[i]][id].wins / runes.tertiary[table[i]][id].games * 100).toFixed(1)
   } else {
      return 0
   }
}

function flexRuneGames(id, i) {
   const table = ['offense', 'flex', 'defense']
   return (runes.tertiary[table[i]][id]) ? runes.tertiary[table[i]][id].games : 0
}

function heatmap(id, i, tree, flex) {
   if (!store.runes.heatmap) return

   const tertiaryTable = ['offense', 'flex', 'defense']
   const colorTable = {
      '8000': '231, 216, 145',
      '8100': '231, 145, 145',
      '8200': '145, 147, 231',
      '8300': '145, 189, 231',
      '8400': '145, 231, 149',
      'flex': '192, 192, 192',
   }
   const rune = (typeof flex === 'number') ? runes[i][tertiaryTable[flex]][id] : runes[i][id]
   let colorValue = colorTable[tree]

   if (store.runes.heatmap === 1) {
      // Popularity
      if (!rune) return '0'
      const runeGames = rune.games
      return `rgba(${colorValue}, ${runeGames / games / 4})`
   }

   if (store.runes.heatmap === 2) {
      // Winrate
      if (!rune) return '0'
      const games = rune.games
      const wins = rune.wins
      const val = (wins / games)
      return `rgba(${colorValue}, ${val / 4})`
   }
}

const clarity = computed(() => {
   if (store.runes.heatmap && store.runes.clarity) return true
})

</script>

<template>
   <div class="runes-main" id="runes">
      <div class="section-header">
         <h1>Runes</h1>
         <RunesModal />
      </div>
      <div class="section">
         <div class="main-runes" :class="{ 'active-heatmap': clarity }">

            <div class="tree" v-for="[tree, i] of Object.entries(_runes)" :key="tree">
               <div class="rune-wrapper">
                  <div class="winrate"></div>
                  <div class="games"></div>
               </div>
               <div class="primary">
                  <div :class="{'keystone' : j2 === 0}" class="row" v-for="(j, j2) in i" :key="j2">
                     <div :style="{ 'background': heatmap(k, 'primary', tree) }" class="rune-wrapper" v-for="k in j"
                        :key="k">
                        <img
                           :class="{ 'inactive': !runes.primary[k] || runes.primary[k].games === 0 }"
                           :src="`/runes/${k}.png`" alt="">
                        <div :style="{ 'color': lerpWinrate(primaryRuneWinrate(k)) }" class="winrate">{{
                           primaryRuneWinrate(k) }}%</div>
                        <div :style="{ 'color': lerpGames(primaryRuneGames(k), findMax('primary')) }" class="games">{{
                           primaryRuneGames(k)
                           }}</div>
                     </div>
                  </div>
               </div>
               <div class="secondary">
                  <div class="row" v-for="(j, j2) in i.slice(1)" :key="j2">
                     <div :style="{'background' : heatmap(k, 'secondary', tree) }" class="rune-wrapper" v-for="k in j"
                        :key="k">
                        <img
                           :class="{ 'inactive': !runes.secondary[k] || runes.secondary[k].games === 0 }"
                           :src="`/runes/${k}.png`" alt="">
                        <div :style="{ 'color': lerpWinrate(secondaryRuneWinrate(k)) }" class="winrate">{{
                           secondaryRuneWinrate(k) }}%</div>
                        <div :style="{ 'color': lerpGames(secondaryRuneGames(k), findMax('secondary')) }" class="games">{{
                           secondaryRuneGames(k) }}</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div class="flex" :class="{ 'active-heatmap': clarity }">
            <div class="row" v-for="(i, i2) in _flex" :key="i2">
               <div :style="{ 'background': heatmap(j, 'tertiary', 'flex', i2) }" class="rune-wrapper"
                  v-for="(j, j2) in i" :key="j2">
                  <img :src="`/runes/flex/${j}.png`" alt="">
                  <div :style="{ 'color': lerpWinrate(flexRuneWinrate(j, i2)) }" class="winrate">{{ flexRuneWinrate(j,
                     i2) }}%</div>
                  <div :style="{ 'color': lerpGames(flexRuneWinrate(j, i2), findMax('tertiary')) }" class="games">{{
                     flexRuneGames(j, i2) }}</div>
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
}

.main-runes {
   display: flex;
   padding-top: 10px;
   justify-content: space-around;
   padding-bottom: 50px;
}

.flex {
   display: flex;
   flex-direction: column;
   align-items: center;
}

.flex img {
   background: var(--surface-container-high);
   border-radius: 100%;
}

.tree, .primary, .secondary {
   display: flex;
   flex-direction: column;
   align-items: center;
}

.primary {
   padding-bottom: 30px;
}


img.tree-image {
   margin-bottom: 18px;
}
.main-runes img {
   width: 33px;
}

.active-heatmap {
   filter: saturate(0.1);
}

.rune-wrapper {
   display: inline-block;
   text-align: center;
   margin: 1px;
   padding: 2px 1px;
   width: 45px;
   border-radius: 3px;
   transition: 0.25s ease-in-out;
}

.inactive {
   filter: saturate(0);
}

.winrate {
   color: var(--color-font);
   font-size: 0.8rem;
}

.games {
   color: var(--color-font-faded);
   font-size: 0.75rem;
}

.keystone img {
   width: 45px;
}
</style>