<script setup>
const width = ref(null)

onMounted(() => {
   width.value = window.innerWidth
   window.addEventListener('resize', fire)
})

onBeforeUnmount(() => {

   window.removeEventListener('resize', fire)
})

function fire() {
   width.value = window.innerWidth
}

function toads() {
   width.value = 1200
   window.removeEventListener('resize', fire)
}
</script>

<template>
   <div v-if="width < 1150" @click="toads()" class="screen-width-main">
      <p>
         Sorry, Aramstats is not designed for smaller screen sizes; user experience will be unpleasant. <br> Click for me to go away.
      </p>
   </div>
</template>

<style scoped>
   .screen-width-main {
      position: fixed;
      cursor: pointer;
      bottom: 10px;
      left: 50%;
      transform: translate(-50%, 0);
      border-radius: 5px;
      width: 95%;
      display: flex;
      justify-content: center;
      font-size: 0.9rem;
      background-color: var(--tertiary-container);
      border: 1px solid var(--on-tertiary-container);
      z-index: 5;
   }
   
   p {
      color: var(--color-font);
      text-align: center;
      margin: 0;
      padding: 0.5rem 1rem;
   }
</style>