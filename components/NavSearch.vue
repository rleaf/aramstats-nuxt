<script setup>
const store = superStore()
const input = ref('')
const region = ref('RG')

const inputRef = useTemplateRef('inputBind')
const regionButtonRef = useTemplateRef('regionButton')
const championsRef = useTemplateRef('champions')
const step = ref(-1)
const filteredChamps = useChampionFilter(step, input)

onMounted(() => {
   if (localStorage.getItem('region')) region.value = localStorage.getItem('region')
   window.addEventListener('keydown', eventHandler)
})

onUnmounted(() => {
   window.removeEventListener('keydown', eventHandler)
})

function blurInput() {
   inputRef.value.blur()
   input.value = ''
   store.navContainerFocus = false
}

function regionSelect() {
   localStorage.setItem('region', region.value)
   inputRef.value.focus()
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

async function summonerSearch() {
   if (!input.value) return
   if (filteredChamps.value[step.value]) {
      if (filteredChamps.value[step.value].back === 'monkeyking') {
         await navigateTo({ name: 'champions-champion', params: { champion: 'wukong' } })
      } else {
         await navigateTo({ name: 'champions-champion', params: { champion: filteredChamps.value[step.value].back } })
      }
      store.navContainerFocus = false
      input.value = ''
      inputRef.value.blur()
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
</script>

<template>
   <div>
      <div class="nav-search" :class="{ focus: store.navContainerFocus }">
         <div>
            <input ref="inputBind" type="text" spellcheck="false" autocomplete="off"
               @focus="store.navContainerFocus = true" @keyup.enter="summonerSearch" @keyup.esc="blurInput()"
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
      <div class="champion-search" v-show="store.navContainerFocus && filteredChamps.length">
         <div class="search-ux">
            <div>
               <kbd>↑</kbd> up <kbd>↓</kbd> down <kbd>Enter</kbd> search
            </div>
            <div>
               <kbd>Ctrl+K</kbd> focus <kbd>Esc</kbd> close
            </div>
         </div>
         <div ref="champions">
            <NuxtLink :to="{ name: 'champions-champion', params: { champion: champ.back } }" @click="blurInput()"
               v-for="champ in filteredChamps">
               <div class="img-wrapper">
                  <img :src="`/champion_icons/${champ.image}.png`" alt="" srcset="" rel="preload">
               </div>
               {{ champ.front }}
            </NuxtLink>
         </div>
      </div>
      <div class="back" @click="store.navContainerFocus = false" v-if="store.navContainerFocus"></div>
   </div>
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

.champion-search {
   z-index: 3;
   display: flex;
   position: relative;
   width: 380px;
   margin-top: 5px;
   transform: translateX(calc(203px - 50%));
   flex-direction: column;
   position: absolute;
   background: var(--surface-container);
   border: 1px solid var(--outline-variant);
   border-radius: 5px;
}

.champion-search a {
   display: flex;
   align-items: center;
   text-decoration: none;
   color: var(--color-font);
   gap: 10px;
   /* border-radius: 5px; */
   font-size: 0.85rem;
   padding: 3px;
   transition: 0.15s ease-in-out;
}

.champion-search a:hover,
.champion-search a.active {
   background: var(--surface-container-high);
   color: var(--color-font-focus)
}

.img-wrapper {
   width: 24px;
   height: 24px;
   border: 1px solid var(--outline-variant);
   overflow: hidden;
}

.champion-search img {
   width: 100%;
   transform: scale(1.1);
}

.nav-search {
   display: flex;
   position: relative;
   justify-content: space-between;
   align-items: center;
   z-index: 1;
   background-color: var(--surface-container);
   height: 25px;
   width: 400px;
   color: var(--color-font);
   border-radius: 50px;
   border: 1px solid var(--outline-variant);
   padding: 3px 2px;
   transition: 0.25s ease-in-out;
   opacity: 0.8;
   overflow: hidden;
}

.focus {
   border-color: var(--outline);
}

.nav-search input {
   width: 260px;
   color: var(--color-font);
   font-family: var(--font-main);
   ;
   background: none;
   border: none;
   font-size: 0.8rem;
   padding: 5px 12px;
}

span.placeholder {
   z-index: 0;
   pointer-events: none;
   position: absolute;
   top: 6px;
   left: 14px;
   font-size: 0.8rem;
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

.shadow {
   position: absolute;
   width: inherit;
   z-index: -4;
   left: 14px;
   top: calc(50% - 1px);
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
   font-size: 0.8rem;
   opacity: 0.3;
   margin: 0;
}

.shadow p:first-child {
   opacity: 0;
   white-space: nowrap;
   max-width: 260px;
   padding-right: 2px;
}

::placeholder {
   color: var(--color-font-faded);
   opacity: 1;
   /* Firefox */
}

.nav-search input:focus {
   outline: none;
}

.shake {
   background-color: var(--error);
   color: var(--on-error);
   animation: shake 0.82s cubic-bezier(.36, .07, .19, .97) both;
}

select {
   /* border: 1px solid transparent; */
   padding: 0 11px;
   margin-right: 5px;
   border-radius: 15px;
   cursor: pointer;
   height: 20px;
   appearance: none;
   width: 75px;
   display: inline-block;
   color: var(--color-font);
   font-family: var(--font-main);
   font-size: 0.7rem;
   line-height: 0.7rem;
   background: transparent;
   background: var(--surface-container-highest);
   background-image: url('/svg/arrow3.svg');
   background-repeat: no-repeat;
   background-position: right 10px center;
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

select:hover {
   background-color: var(--surface-container-highest-hover);
   transition: 0.1s ease-in-out;
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