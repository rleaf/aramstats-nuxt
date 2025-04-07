<script setup>
import { championStore } from '@/stores/championStore'
const store = championStore()
const showModal = ref(false)

onBeforeMount(() => {
   checkStorage()
   closeModal()
})

function checkStorage() {
   if (!localStorage.getItem('localStorage')) return

   store.localStorage = localStorage.getItem('localStorage') === 'true'
   store.visibleCore = localStorage.getItem('visibleCore') === 'true'
   store.winrateSort = localStorage.getItem('winrateSort') === 'true'
   store.winrateThreshold = Number(localStorage.getItem('winrateThreshold'))
}

function closeModal() {
   showModal.value = false

   if (store.localStorage) {
      localStorage.setItem('localStorage', store.localStorage)
      localStorage.setItem('winrateSort', store.winrateSort)
      localStorage.setItem('winrateThreshold', store.winrateThreshold)
   } else {
      localStorage.removeItem('localStorage')
      localStorage.removeItem('winrateSort')
      localStorage.removeItem('winrateThreshold')
   }
}
</script>

<template>
   <img @click="showModal = true" class="settings" src="/svg/ellipses.svg" alt="">
   <div v-if="showModal" class="modal-main">
      <div class="modal">
         <div class="head">
            <h1>Overview</h1>
            The Overview section is designed to show what you want to see when you're in champ select. Data shown in this section is particular to the selected core build and may look different from the sections below.
         </div>
         <div class="setting">
            <div class="setting-head">
               <h2>Local Storage</h2>
               <svg @click="store.localStorage = !store.localStorage" fill="none">
                  <rect x="0.5" y="0.5" rx="13" :class="{ 'active': store.localStorage }" />
                  <circle :class="{ 'storage-active': store.localStorage }" cx="25%" cy="50%" r="22%" rx="12"/>
               </svg>
            </div>
            <p>
               Save Tldr settings to local storage? Data auto-purges when toggled off.
            </p>
         </div>
         <div class="setting">
            <div class="setting-head">
               <h2>Sort by winrate</h2>
               <svg @click="store.winrateSort = !store.winrateSort" fill="none">
                  <rect x="0.5" y="0.5" rx="13" :class="{ 'active': store.winrateSort }"/>
                  <circle :class="{ 'storage-active': store.winrateSort }" cx="25%" cy="50%" r="22%" rx="12"/>
               </svg>
            </div>
            <p>
               Data defaults to ordering by popularity. Instead, sort information by highest winrate. Note that there may be low/no observations for certain data.
            </p>
         </div>
         <div class="setting">
            <div class="setting-head">
               <h2>Winrate threshold</h2>
               <div class="options">
                  <div :class="{ 'active-option': store.winrateThreshold == 0.05 }" @click="store.winrateThreshold = 0.05">5%</div>
                  <div :class="{ 'active-option': store.winrateThreshold == 0.08 }" @click="store.winrateThreshold = 0.08">8%</div>
                  <div :class="{ 'active-option': store.winrateThreshold == 0.1 }" @click="store.winrateThreshold = 0.1">10%</div>
               </div>
            </div>
            <p>
               Set the lower bound of observed data when sorting by winrate. This is to exclude games with too little sample size.
            </p>
         </div>
      </div>
      <div class="modal-back" @click ="closeModal()" />
   </div>
</template>

<style scoped>
@import url('@/assets/css/modalStyles.css');
</style>