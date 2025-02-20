<script setup>
const store = superStore()
const step = ref(-1)
const input = ref('')
const region = ref('RG')
const inputRef = useTemplateRef('inputBind')
const championsRef = useTemplateRef('champions')
const filteredChamps = useChampionFilter(step, input)

onBeforeMount(() => {
   if (!localStorage.getItem('experience')) {
      localStorage.setItem('experience', 1)
   }
})

onMounted(() => {
   localStorage.setItem('region', 'na')
   window.addEventListener('keydown', eventHandler)
})

onUnmounted(() => {
   window.removeEventListener('keydown', eventHandler)
})

function regionSelect() {
   localStorage.setItem('region', region.value)
   inputRef.value.focus()
}

function getImage(name) {
   const path = `/assets/champion_icons/${name}.png`
   const modules = import.meta.glob("@/assets/champion_icons/**", { eager: true })
   const mod = modules[path]
   return mod.default
}

function blurInput() {
   inputRef.value.blur()
   input.value = ''
   store.navContainerFocus = false
}

async function summonerSearch() {
   if (!input.value) return
   if (filteredChamps.value[step.value]) {
      await navigateTo({ name: 'champions-champion', params: { champion: filteredChamps.value[step.value].back } })
      store.navContainerFocus = false
      return
   }

   if (region.value === 'RG') {
      regionButtonRef.value.classList.add('shake')
      setTimeout(() => {
         regionButtonRef.value.classList.remove('shake')
      }, 1000)
      return
   }

   const identifiers = input.value.split('#')
   let _gameName = identifiers[0]
   let _tagLine = (identifiers.length === 2) ? identifiers[1] : store.searchRegions[region.value]
   await navigateTo({
      name: `summoner-region-gameName-tagLine`, params: {
         region: region.value,
         gameName: _gameName,
         tagLine: _tagLine
      }
   })

   store.navContainerFocus = false
   input.value = ''
   inputRef.value.blur()
}

function eventHandler(e) {
   if (e.ctrlKey && e.key === 'k') {
      e.preventDefault()
      inputRef.value.focus()
      return
   }
   if (!(e.key === 'ArrowDown' || e.key === 'ArrowUp') || !store.navContainerFocus) return
   e.preventDefault()
   if (filteredChamps.value.length) {
      if (!championsRef.value.children || !championsRef.value.children[step.value]) step.value = -1
      if (step.value !== -1) championsRef.value.children[step.value].classList.remove('active')

      if (e.key === 'ArrowDown') {
         if (championsRef.value.children[step.value + 1]) {
            step.value++
         } else {
            step.value = 0
            championsRef.value.children[step.value]
         }
      }

      if (e.key === 'ArrowUp') {
         if (championsRef.value.children[step.value - 1]) {
            step.value--
         } else {
            step.value = filteredChamps.value.length - 1
            championsRef.value.children[filteredChamps.value.length - 1]
         }
      }

      if (step.value !== -1) championsRef.value.children[step.value].classList.add('active')
   }
}

</script>

<template>
   <div class="search-main">
      <img src="../assets/svg/logo.svg" class="logo" alt="">
      <div ref="container" class="container" :class="{ focus: store.navContainerFocus }">
         <div>
            <input class="main-input" ref="inputBind" type="text" spellcheck="false" autocomplete="off"
               @focus="store.navContainerFocus = true" @keyup.esc="blurInput()" @keyup.enter="summonerSearch"
               v-model="input">
            <span class="placeholder" v-show="!input">
               Summoner or Champion
               <kbd>Ctrl + K</kbd>
            </span>
            <div class="shadow" v-show="input && region !== 'RG' && !input.includes('#')">
               <p>{{ `${input}` }}</p>
               <p>#{{ store.searchRegions[region] }}</p>
            </div>
         </div>
         <select ref="regionButton" v-model="region" @change="regionSelect()">
            <option value="RG" hidden disabled>Region</option>
            <option v-for="region in Object.keys(store.searchRegions)" :value="region" :key="region">{{
               region.toUpperCase() }}</option>
         </select>
      </div>
      <div class="champion-search" v-show="store.navContainerFocus && filteredChamps.length > 0">
         <div class="search-ux">
            <div>
               <kbd>↑</kbd> up <kbd>↓</kbd> down <kbd>Enter</kbd> search
            </div>
            <div>
               <kbd>Ctrl+K</kbd> focus <kbd>Esc</kbd> close
            </div>
         </div>
         <div ref="champions">
            <NuxtLink :to="{ name: 'champions-champion', params: { champion: champ.back } }" v-for="champ in filteredChamps" :key="champ">
               <div class="img-wrapper">
                  <img :src="getImage(champ.image)" alt="" srcset="" rel="preload">
                  <!-- <img src="@/assets/champion_icons/ahri.png" alt="" srcset="" rel="preload"> -->
               </div>
               {{ champ.front }}
            </NuxtLink>
         </div>
      </div>
   </div>
   <div class="back" @click="store.navContainerFocus = false" v-if="store.navContainerFocus"></div>
</template>

<style scoped>
.back {
   position: fixed;
   top: 0;
   left: 0;
   z-index: 1;
   width: 100%;
   height: 100vh;
}

.testo {
   width: 100%;
   height: 100%;
}

.transition-wrapper {
   overflow: hidden;
}

.champion-search {
   position: relative;
   background: var(--surface-container);
   font-size: 0.85rem;
   margin-top: 5px;
   width: calc(380px);
   border-radius: 3px;
   overflow: hidden;
   border: 1px solid var(--outline-variant);
}

.search-ux {
   display: flex;
   justify-content: space-between;
   color: var(--color-font);
   font-size: 0.75rem;
   padding: 2px 5px;
   padding-bottom: 4px;
   opacity: 0.5;
   border-bottom: 1px solid var(--outline-variant);
}

.search-ux kbd {
   border: 1px solid var(--outline-variant);
   border-radius: 5px;
   padding: 0px 3px;
}


.champion-search a {
   display: flex;
   align-items: center;
   gap: 10px;
   position: relative;
   z-index: 2;
   color: var(--color-font);
   text-decoration: none;
   padding: 3px;
   padding-left: 1.5rem;
   transition: 0.15s ease-in-out;
}

.champion-search a:hover,
.champion-search a.active {
   background: var(--surface-container-high);
   color: var(--color-font-focus)
}


.img-wrapper {
   width: 30px;
   height: 30px;
   border: 1px solid var(--outline-variant);
   overflow: hidden;
}

.champion-search img {
   width: 100%;
   transform: scale(1.1);
}

.region-selection {
   margin-top: 1rem;
}

.region-selection>div {
   color: var(--panel-two-text);
   text-align: center;
   font-size: 0.85rem;
   margin: 0 .2rem;
   padding: 2px 6px;
   display: inline-block;
   background: var(--panel-two);
   border-radius: 5px;
   cursor: pointer;
   transition: 250ms ease-in-out;
}

.region-selection>div:hover {
   background: var(--panel-two-hover);
}

select {
   /* border: 1px solid transparent; */
   padding: 0 11px;
   margin-right: 10px;
   cursor: pointer;
   height: 30px;
   appearance: none;
   width: 80px;
   display: inline-block;
   color: var(--color-font);
   font-family: var(--font-main);
   font-size: 0.75rem;
   background: transparent;
   background: var(--surface-container-highest);
   background-image: url('../assets/svg/arrow3.svg');
   background-repeat: no-repeat;
   background-position: right 10px center;
   border-radius: 15px;
   cursor: pointer;
   font-weight: bold;
   border: none;
   transition: 250ms ease-in-out;
}

select:focus {
   outline: none;
}

select>option {
   font-weight: bold;
}

button.region {
   height: 30px;
   display: inline-block;
   color: var(--color-font);
   font-family: var(--font-main);
   font-size: 0.75rem;
   /* background: var(--surface-container-highest); */
   background: var(--surface-container-highest);
   border-radius: 15px;
   cursor: pointer;
   font-weight: bold;
   border: none;
   margin: 0;
   margin-right: 10px;
   padding: 3px 15px;
   transition: 250ms ease-in-out;
}

.shake {
   background-color: var(--error);
   color: var(--on-error);
   animation: shake 0.82s cubic-bezier(.36, .07, .19, .97) both;
}

select:hover {
   background-color: var(--surface-container-highest-hover);
   transition: 0.1s ease-in-out;
}

img.logo {
   width: 250px;
   padding-bottom: 4rem;
   filter: var(--logo-filter);
}

.search-main {
   display: flex;
   flex-direction: column;
   margin-top: 20vh;
   width: 100%;
   align-items: center;
}

.container {
   position: relative;
   z-index: 2;
   background: var(--surface-container);
   display: flex;
   justify-content: space-between;
   align-items: center;
   /* padding: 0.7rem 2rem; */
   border: 1px solid var(--outline-variant);
   border-radius: 50px;
   width: 420px;
   height: 45px;
   transition: 0.25s;
}

.shadow {
   position: absolute;
   width: inherit;
   z-index: -4;
   left: calc(2.5rem);
   top: 50%;
   transform: translateY(-50%);
   -webkit-user-select: none;
   /* Safari */
   -moz-user-select: none;
   /* Firefox */
   -ms-user-select: none;
   /* IE10+/Edge */
   user-select: none;
   /* Standard */
}

.shadow p {
   display: inline-block;
   color: var(--on-surface);
   font-size: 0.95rem;
   opacity: 0.3;
   margin: 0;
}

.shadow p:first-child {
   white-space: nowrap;
   opacity: 0;
   max-width: 240px;
   padding-right: 2px;
}

.focus {
   /* background: var(--surface-container-low); */
   border-color: var(--outline);
}

input {
   display: inline-block;
   background: transparent;
   border: none;
   padding: 0;
   font-family: var(--font-main);
   font-size: 0.95rem;
   color: var(--on-surface);
   width: 240px;
   /* flex-grow: 3; */
   padding-left: 2.5rem;
}

input:focus {
   outline: none;
   color: var(--on-surface);
   transition: 0.4s;
}

span.placeholder {
   z-index: 0;
   pointer-events: none;
   position: absolute;
   left: 2.5rem;
   font-size: 0.9rem;
   font-family: var(--font-main);
   color: var(--color-font-faded);

}

span.placeholder kbd {
   display: inline-flex;
   border: 1px solid var(--outline-variant);
   border-radius: 5px;
   font-family: var(--font-main);
   padding: 0px 5px;
}

button {
   height: 3rem;
   margin: 2px;
}

.notif {
   color: var(--color-font);
   text-align: center;
   padding: 0.5rem 1rem;
   border-radius: 5px;
   margin-top: 2rem;
   border: 1px var(--tint100) solid;
   font-size: 0.9rem;
}

.region-alert {
   background-color: #ffd4d4;
   margin-top: 0.5rem;
   padding: 0.2rem 0.5rem;
   font-size: 0.95rem;
   border: #f50d0d 1px solid;
   border-radius: 10px;
}

.fade-leave-active {
   transition: opacity 0.3s cubic-bezier(.25, .1, .25, 1);
}

.fade-leave-to {
   opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
   transition: 0.5s cubic-bezier(.25, .1, .25, 1);
}

.slide-enter {
   transform: translate(0, 100%)
}

.slide-leave-to {
   transform: translate(0, -100%)
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