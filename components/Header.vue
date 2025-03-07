<script setup>
import updates from '~/public/js/updates'
</script>

<template>
   <div v-if="updates[0].header" class="header-main">
      <NuxtLink to="/updates">{{ updates[0].title }}</NuxtLink>
   </div>
</template>

<style scoped>
   .header-main {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 30px;
      background: rgba(var(--tertiary-container-rgb), 0.5);
      font-size: 0.85rem;
   }

   .red {
      background:linear-gradient(90deg, rgba(167, 94, 94, 0.25), rgba(129, 32, 32, 0.25));
   }
   
   a, p {
      color: var(--tertiary);
   }

   @keyframes gradient {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}
</style>