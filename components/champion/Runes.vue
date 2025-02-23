<script setup>
import { _runes, _flex } from '@/constants/runes'
import { championStore } from '@/stores/championStore'

const store = championStore()
const props = defineProps(['championData'])
const { championData } = toRefs(props)

function primaryRuneWinrate(id) {
   if (championData.value.runes.primary[id]) {
      return (championData.value.runes.primary[id].wins / championData.value.runes.primary[id].games * 100).toFixed(1) + '%'
   } else {
      return 0
   }
}

function primaryRuneGames(id) {
   return (championData.value.runes.primary[id]) ? championData.value.runes.primary[id].games : 0
}

function secondaryRuneGames(id) {
   return (championData.value.runes.secondary[id]) ? championData.value.runes.secondary[id].games : 0
}

function secondaryRuneWinrate(id) {
   if (championData.value.runes.secondary[id]) {
      return (championData.value.runes.secondary[id].wins / championData.value.runes.secondary[id].games * 100).toFixed(1) + '%'
   } else {
      return 0
   }
}

function flexRuneWinrate(id, i) {
   const table = ['offense', 'flex', 'defense']
   if (championData.value.runes.tertiary[table[i]][id]) {
      return (championData.value.runes.tertiary[table[i]][id].wins / championData.value.runes.tertiary[table[i]][id].games * 100).toFixed(1) + '%'
   } else {
      return 0
   }
}

function flexRuneGames(id, i) {
   const table = ['offense', 'flex', 'defense']
   return (championData.value.runes.tertiary[table[i]][id]) ? championData.value.runes.tertiary[table[i]][id].games : 0
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
   const rune = (typeof flex === 'number') ? championData.value.runes[i][tertiaryTable[flex]][id] : championData.value.runes[i][id]
   let colorValue = colorTable[tree]

   if (store.runes.heatmap === 1) {
      // Popularity
      if (!rune) return '0'
      const runeGames = rune.games
      return `rgba(${colorValue}, ${runeGames / championData.value.games / 4})`
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
                     <div :style="{ 'background': heatmap(k, 'primary', tree) }" class="rune-wrapper" v-for="k in j" :key="k">
                        <img :class="{ 'inactive': !championData.runes.primary[k] || championData.runes.primary[k].games === 0 }" :src="`/runes/${k}.png`" alt="">
                        <div class="winrate">{{ primaryRuneWinrate(k) }}</div>
                        <div class="games">{{ primaryRuneGames(k) }}</div>
                     </div>
                  </div>
               </div>
               <div class="secondary">
                  <div class="row" v-for="(j, j2) in i.slice(1)" :key="j2">
                     <div :style="{'background' : heatmap(k, 'secondary', tree) }" class="rune-wrapper" v-for="k in j" :key="k">
                        <img :class="{ 'inactive': !championData.runes.secondary[k] || championData.runes.secondary[k].games === 0 }" :src="`/runes/${k}.png`" alt="">
                        <div class="winrate">{{ secondaryRuneWinrate(k) }}</div>
                        <div class="games">{{ secondaryRuneGames(k) }}</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div class="flex" :class="{ 'active-heatmap': clarity }">
            <div class="row" v-for="(i, i2) in _flex" :key="i2">
               <div :style="{ 'background': heatmap(j, 'tertiary', 'flex', i2) }" class="rune-wrapper" v-for="(j, j2) in i" :key="j2">
                  <img :src="`/runes/flex/${j}.png`" alt="">
                  <div class="winrate">{{ flexRuneWinrate(j, i2) }}</div>
                  <div class="games">{{ flexRuneGames(j, i2) }}</div>
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