<script setup>
import updates from '../constants/updates'
// const msg = ref(updates[0].title)
// const data = ref(null)
onMounted(async () => {
})
const url = 'https://raw.githubusercontent.com/rleaf/aramstats-nuxt/refs/heads/main/package.json'
const url3 = 'https://cdn.jsdelivr.net/gh/rleaf/aramstats-nuxt@latest/constants/updates.js'
const url2 = 'https://gist.github.com/rleaf/5cbd81793fa359837e9b41f89d4394be.js'
const { data } = await useFetch(url3)
console.log(data.value, 'header data')

</script>

<template>
   <div class="header-main red">
      {{ data.name }}
      <!-- <RouterLink to="/updates">{{ data.name }}</RouterLink> -->
   </div>
</template>

<style scoped>
   .header-main {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 30px;
      background: linear-gradient(90deg, rgba(94, 150, 167, 0.5), rgba(32, 107, 129, 0.5));
      background-size: 400% 400%;
      animation: gradient 5s ease infinite;
      color: var(--color-font);
      font-size: 0.85rem;
   }

   .red {
      background:linear-gradient(90deg, rgba(167, 94, 94, 0.25), rgba(129, 32, 32, 0.25));
   }
   
   a, p {
      color: var(--color-font);
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