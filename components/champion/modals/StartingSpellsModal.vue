<script setup>
const showModal = ref(false)
</script>

<template>
   <img @click="showModal = true" class="settings" src="/svg/ellipses.svg" alt="">
   <div v-if="showModal" class="modal-main">
      <div class="modal">
         <div class="head">
            <h1>Starting Items / Spells / Skill Priority</h1>
            This section displays general data from all observed games of a champion. Most fields are limited to ~10 entries.
         </div>
      </div>
      <div class="modal-back" @click="showModal = false" />
   </div>
</template>

<style scoped>
@import url('@/assets/css/modalStyles.css');
</style>