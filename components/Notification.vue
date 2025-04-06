<script setup>
import { superStore } from '@/stores/superStore'

const store = superStore()
</script>

<template>
   <Transition name="slide">
      <div v-if="store.notification" @click="store.notification = null" class="notification-main">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960">
            <path d="M480-280q17 0 28.5-11.5T520-320t-11.5-28.5T480-360t-28.5 11.5T440-320t11.5 28.5T480-280m-40-160h80v-240h-80zm40 360q-83 0-156-31.5T197-197t-85.5-127T80-480t31.5-156T197-763t127-85.5T480-880t156 31.5T763-763t85.5 127T880-480t-31.5 156T763-197t-127 85.5T480-80m0-80q134 0 227-93t93-227-93-227-227-93-227 93-93 227 93 227 227 93m0-320" />
         </svg>
         {{ store.notification }}
         <span ref="progress"></span>
      </div>
   </Transition>
</template>

<style scoped>

h2 {
   font-size: 0.9rem;
   margin: 0;
}

.header {
   display: flex;
   gap: 3px;
   align-items: center;
   margin-bottom: 1rem;
}

span {
   position: absolute;
   height: 2px;
   bottom: 0;
   border-radius: 0 3px 3px 3px;
   background-color: var(--on-tertiary-container);
   left: 0;
   opacity: 0.8;
   animation: animate 2500ms linear;
}

@keyframes animate {
   0% { width: 100%; }
   100% { width: 0; }
}

svg {
   fill: var(--on-tertiary-container);
}
.notification-main {
   cursor: pointer;
   font-family: var(--font-main);
   display: flex;
   justify-content: center;
   align-items: center;
   gap: 10px;
   box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
   position: fixed;
   top: 8vh;
   left: 50%;
   transform: translateX(-50%);
   z-index: 10;
   color: var(--on-tertiary-container);
   font-size: 0.85rem;
   background: var(--tertiary-container);
   border-radius: 3px;
   padding: 0.75rem 1.5rem;
}

.slide-enter-active {
   animation: slide-fade 500ms linear;
}

.slide-leave-active {
   animation: slide-fade 500ms reverse;
}

@keyframes slide-fade {
   0% {
      opacity: 0;
      transform: translate(-50%, -100%);
   }
      
   100% {
      opacity: 1;
      transform: translate(-50%, 0);
   }
}
</style>