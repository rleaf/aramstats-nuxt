<script setup>
import { championStore } from '@/stores/championStore'
const store = championStore()
const showModal = ref(false)

</script>

<template>
   <img @click="showModal = true" class="settings" src="/svg/ellipses.svg" alt="">
   <div v-if="showModal" class="modal-main">
      <div class="modal">
         <div class="head">
            <h1>Runes</h1>
            The Runes section displays individual rune observations & winrate.
         </div>
         <!-- <div class="setting">
            <div class="setting-head">
               <h2>Heatmap</h2>
               <div class="options">
                  <div :class="{ 'active-option': store.runes.heatmap == 0 }" @click="store.runes.heatmap = 0">Off</div>
                  <div :class="{ 'active-option': store.runes.heatmap == 1 }" @click="store.runes.heatmap = 1">Popularity</div>
                  <div :class="{ 'active-option': store.runes.heatmap == 2 }" @click="store.runes.heatmap = 2">Winrate</div>
               </div>
            </div>
            <p>
               Toggle heatmap to help visually discern rune data.
            </p>
         </div>
         <div class="setting">
            <div class="setting-head">
               <h2>Desaturate colors</h2>
               <svg @click="store.runes.clarity = !store.runes.clarity" fill="none">
                  <rect x="0.5" y="0.5" rx="13" :class="{ 'active': store.runes.clarity }"/>
                  <circle :class="{ 'storage-active': store.runes.clarity }" cx="25%" cy="50%" r="22%" rx="12"/>
               </svg>
            </div>
            <p>
               To help with visual clarity.
            </p>
         </div> -->
      </div>
      <div class="modal-back" @click ="showModal = false" />
   </div>
</template>

<style scoped>
@import url('@/assets/css/modalStyles.css');
</style>