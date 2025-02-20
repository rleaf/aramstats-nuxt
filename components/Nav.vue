<script setup>
const dayBool = ref(false)
const route = useRoute()


onMounted(() => {
   if (JSON.parse(localStorage.getItem('dayMode'))) toggleTheme()   
})

function toggleTheme() {
   dayBool.value = !dayBool.value
   document.querySelector('body').classList.toggle('day')
   localStorage.setItem('dayMode', JSON.stringify(dayBool.value))
}
</script>

<template>
   <nav>
      <div class="left">
         <NuxtLink class="nav-route" to="/">Home</NuxtLink>
         <NuxtLink class="nav-route" to="/champions">Champions</NuxtLink>
      </div>

      <NavSearch v-if="route.path !== '/'" />

      <div class=" right">
         <button @click="toggleTheme" :class="{ day: dayBool }">
            <div class="theme"></div>
         </button>
         <NuxtLink class="nav-route" to="/updates">Updates</NuxtLink>
         <NuxtLink class="nav-route" to="/about">About</NuxtLink>
         </div>
   </nav>
</template>

<style scoped>
.bg {
   position: fixed;
   top: 0;
   left: 0;
   z-index: 0;
   width: 100%;
   height: 100vh;
}

nav {
   display: flex;
   justify-content: space-between;
   height: 9vh;
   width: 100%;
   align-items: center;
}

.toad {
   overflow: hidden;
}

svg {
   margin: 0 0.5rem;
}

.right svg rect {
   fill: tomato;
}

nav .left,
nav .right {
   flex-grow: 1;
   flex-basis: 0;
}

nav .left {
   display: flex;
   padding-left: 2rem;
}

nav .right {
   display: flex;
   justify-content: flex-end;
   align-items: center;
   padding-right: 2rem;
}

.text,
.theme {
   display: inline-block;
   vertical-align: middle;
}

a.nav-route {
   margin: 0 0.5rem;
   padding: 5px 12px;
   line-height: 0.9rem;
   font-size: 0.9rem;
   text-decoration: none;
   color: var(--color-font);
   border-radius: 20px;
   transition: 0.2s ease-in-out;
}

a:hover {
   background: var(--secondary-container);
   color: var(--on-secondary-container);
}

button {
   background: none;
   outline: none;
   border: none;
   cursor: pointer;
   padding: 0;
   margin-right: 0.5rem;
}

.theme {
   background-color: var(--color-font);
   width: 24px;
   height: 24px;
   mask-image: var(--theme-icon);
   mask-position: center;
   mask-size: var(--theme-mask-size);
   mask-repeat: no-repeat;
   transition: 0.25s ease-in-out;
   -webkit-mask-image: var(--theme-icon);
   -webkit-mask-position: center;
   -webkit-mask-size: var(--theme-mask-size);
   -webkit-mask-repeat: no-repeat;
}

@keyframes shake {

   10%,
   90% {
      transform: translate3d(-1px, 0, 0);
   }

   20%,
   80% {
      transform: translate3d(2px, 0, 0);
   }

   30%,
   50%,
   70% {
      transform: translate3d(-3px, 0, 0);
   }

   40%,
   60% {
      transform: translate3d(3px, 0, 0);
   }
}
</style>