<script setup>
import { superStore } from '@/stores/superStore'

const store = superStore()

function onBeforeEnter(el) {
   el.style.opacity = `0`
   el.style.transform = `translate(-50%, 0%)`
}

function onAfterEnter(el) {
   el.style.opacity = `1`
   el.style.transition = `all 200ms ease-in-out`
   el.style.transform = `translate(-50%, 150%)`
}

function onBeforeLeave(el) {
   el.style.transform = `translate(-50%, 150%)`
   el.style.opacity = `0`
}   
</script>

<template>

   <Transition name="fade"
      @before-enter="onBeforeEnter"
      @after-enter="onAfterEnter"
      @before-leave="onBeforeLeave">
      <div class="notification-main">
         {{ store.notification }}
      </div>
   </Transition>
   <!-- <div class="notification-main two">
      Summoner up to date
   </div> -->
</template>

<style scoped>
.notification-main {
   position: fixed;
   z-index: 10;
   color: var(--color-font);
   left: 50%;
   font-size: 0.9rem;
   background: var(--cold-blue-focus);
   border: 1px solid var(--update);
   /* background: var(--update); */
   border-radius: 3px;
   padding: 0.6rem 1.5rem;
}

.two {
   /* for testing */
   transform: translate(-50%, 150%);
}
</style>