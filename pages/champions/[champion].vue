<script setup>
import { championNames, nameToId } from '~/constants/championNames';

const route = useRoute()
const store = superStore()
const { start, finish } = useLoadingIndicator()
await store.initPatches() // Prereq for the other store inits
await Promise.all([
   store.initRunes(),
   store.initItems(),
   store.initSpells(),
   store.getChampionDragon(route.params.champion.toLowerCase())
])

const queryPatch = ref(route.query.patch || store.recentCleanPatch)
const championId = ref(nameToId[route.params.champion.toLowerCase()])
const { data: championData, error } = await useAsyncData(
   () => $fetch(`/api/champion/${route.params.champion}`, {
      params: {
         patch: queryPatch.value,
         champId: championId.value
      }
   }))

if (error.value) {
   throw createError({ statusCode: error.value.statusCode, fatal: true })
}

useSeoMeta({
   title: `${championNames[championId.value][1]} | ARAM Stats`,
   ogTitle: `${championNames[championId.value][1]} | ARAM Stats`,
   description: `${championNames[championId.value][1]} builds and stats for ARAM on patch ${store.recentCleanPatch}. View data tailored to the most popular core builds.`,
   ogDescription: `${championNames[championId.value][1]} builds and stats for ARAM on patch ${store.recentCleanPatch}. View data tailored to the most popular core builds.`,
   ogImage: `https://ddragon.leagueoflegends.com/cdn/${store.patches[0]}/img/champion/${championNames[championId.value][0]}.png`
})

function scrollTo(el) {
   return
}

async function patchChange(patch) {
   start()
   queryPatch.value = cleanPatch(patch)
   const res = await $fetch(`/api/champion/${route.params.champion}`, {
      params: {
         patch: queryPatch.value,
         champId: championId.value,
      }
   })

   if (res) {
      championData.value = res
      useRouter().push({ query: { patch: queryPatch.value } })
   } else {
         store.setNotification('Patch data unavailable.')      
   }
   finish()
}

function cleanPatch(patch) {
   return patch.split('.').slice(0, 2).join('.')
}

const background = computed(() => {
   return `radial-gradient(ellipse at top, rgba(var(--surface-rgb), 0.8), rgba(var(--surface-rgb), 1) 73%), no-repeat -10% 25%/100% url('/champion_splash/${championNames[championId.value][0].toLowerCase()}.webp')` 
   
})

const champIcon = computed(() => {
   return `https://ddragon.leagueoflegends.com/cdn/${store.patches[0]}/img/champion/${championNames[championId.value][0]}.png`
})

const aramModifiers = computed(() => {
   return false
   if (!this.store.store.championCDN) return

   const statMods = {
      'Ability Haste': this.store.store.championCDN.stats['aramAbilityHaste'],
      'Attack Speed': this.store.store.championCDN.stats['aramAttackSpeed'],
      'Damage Dealt': this.store.store.championCDN.stats['aramDamageDealt'],
      'Damage Taken': this.store.store.championCDN.stats['aramDamageTaken'],
      'Energy Regen': this.store.store.championCDN.stats['aramEnergyRegen'],
      'Healing': this.store.store.championCDN.stats['aramHealing'],
      'Shielding': this.store.store.championCDN.stats['aramShielding'],
      'Tenacity': this.store.store.championCDN.stats['aramTenacity']
   }

   for (const x of Object.entries(statMods)) {
      if (!x[1] || x[1].flat === 1) {
         delete statMods[x[0]]
         continue
      }
      if (x[1].flat % 1 != 0) {
         const v = Math.round((x[1].flat - 1) * 1000) / 10
         statMods[x[0]] = (x[1].flat - 1 > 0) ? `+${v}%` : `${v}%`
      } else {
         statMods[x[0]] = `${x[1].flat}`
      }
   }

   return statMods
})
</script>

<template>
   <Transition name="tooltip-fade">
      <DataTooltip v-if="store.tooltip.active" />
   </Transition>

   <div class="champion-ready-main">
      <Transition name="fade">
         <div v-if="error && error.statusCode === 404" class="alert">
            Patch data unavailable. Defaulting to {{ store.recentCleanPatch }}.
         </div>
      </Transition>
      <div class="gradient-bg" :style="{ background: background }"></div>
      <div class="header">
         <div class="header-titles">

            <div class="header-lhs">
               <div class="header-lhs-image">
                  <img :src="champIcon" alt="">
               </div>
               <div class="header-lhs-one">
                  <div class="name">{{ championNames[championId][1] }}</div>
                  <div class="title">{{ store.championCDN.title }}</div>
                  <div class="champion-abilities">
                     <div v-if="store.championCDN" v-for="(id, i) of 'PQWER'"
                        @mouseenter="store.setTooltipData({ event: $event, key: id, mode: 'skills', skillIndex: i })"
                        @mouseleave="store.tooltip.active = false" :key="i">
                        <img
                           :src="`https://cdn.communitydragon.org/${store.patches[0]}/champion/${store.championCDN.id}/ability-icon/${id.toLowerCase()}`"
                           rel="preload">
                        <div class="spell-letter">
                           {{ id }}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="header-rhs">
               <div class="main-stats">
                  <div>
                     <span>Rank</span>
                     {{ championData.rank }}
                  </div>
                  <div>
                     <span>Pickrate</span>
                     {{ championData.pickRate }}%
                  </div>
                  <div>
                     <span>Winrate</span>
                     {{ `${Math.round((championData.wins / championData.games) * 1000) / 10}%` }}
                  </div>
                  <div>
                     <span>Games</span>
                     {{ championData.games }}
                  </div>
               </div>

               <!-- <div class="aram-mods" v-if="aramModifiers">
                  <div v-for="(s, i) in Object.entries(aramModifiers)" :key="i">
                     <span>{{ s[0] }}</span>
                     {{ s[1] }}
                  </div>
               </div> -->
            </div>

         </div>

         <div class="settings">
            <div>
               <div class="setting-header">{{ championData.patch }}</div>
               <div class="setting-content">
                  <a @click="patchChange(p)" v-for="p in store.patches" :key="p">{{ cleanPatch(p) }}</a>
               </div>
            </div>
            <div>
               <div class="setting-header">Global</div>
               <div class="setting-content">
                  <div class="message">
                     Currently, only global is available. Check <router-link class="about"
                        :to="{ name: 'about' }">about</router-link>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div class="champion-body">
         <Tldr @scroll="scrollTo" :champion-data="championData" />
         <Items :champion-data="championData" :patch="store.patches[0]" />
         <Runes :champion-data="championData" />
         <StartingSpells :champion-data="championData" />
      </div>
   </div>
</template>

   <style scoped>
      .tooltip-fade-enter-active,
      .tooltip-fade-leave-active {
         transition: opacity 200ms ease-in-out;
      }

      .tooltip-fade-leave-to,
      .tooltip-fade-enter-from {
         opacity: 0;
      }

      .fade-leave-active {
         transition: opacity 1000ms ease-in-out;
      }

      .fade-leave-to {
         opacity: 0;
      }

      .alert {
         font-size: 0.9rem;
         color: var(--on-error);
         position: absolute;
         text-align: center;
         left: 50%;
         margin-top: 10vh;
         transform: translateX(-50%);
         padding: 0.6rem 0.8rem;
         background: var(--error);
         border-radius: 3px;
         z-index: 5;
         max-width: 150px;
      }

      .gradient-bg {
         position: absolute;
         z-index: -5;
         margin-top: 5vh;
         width: inherit;
         height: 400px;
      }

      .champion-ready-main {
         display: flex;
         flex-direction: column;
         margin: 0 auto;
         width: 1100px;
      }

      .header {
         margin-bottom: 5vh;
      }

      .header-titles {
         margin-top: 5vh;
         padding-top: 5vh;
         display: flex;
         justify-content: space-between;
         align-items: center;
         width: 100%;
         color: var(--color-font);
         border-top: 1px solid var(--outline);
         background: radial-gradient(ellipse at top, var(--surface), var(--surface-rgb) 25%);
      }

      .main-stats {
         display: flex;
         margin-bottom: 20px;
         gap: 40px;
         font-size: 1.1rem;
      }

      .main-stats div {
         font-weight: bold;
         color: var(--color-font-focus);
      }

      .header-rhs span {
         font-size: 0.9rem;
         display: block;
         padding-bottom: 5px;
         color: var(--color-font-faded);
         font-weight: normal;
      }

      .aram-mods {
         display: flex;
         gap: 10px;
      }

      .aram-mods div {
         font-size: 0.95rem;
         font-weight: bold;
      }

      .settings {
         display: flex;
         gap: 20px;
         font-size: 0.9rem;
         color: var(--color-font);
         margin-top: 5vh;
      }

      .settings>div {
         display: block;
         width: auto;
      }

      .header-lhs {
         display: flex;
      }

      .settings .setting-content {
         display: none;
         position: absolute;
         flex-direction: column;
         background: var(--surface);
         border: 1px solid var(--outline-variant);
         border-radius: 3px;
         overflow: hidden;
         z-index: 1;
         padding: 4px 5px;
      }

      .setting-content>a {
         display: inline-block;
         cursor: pointer;
         border-radius: 3px;
         min-width: 45px;
         padding: 6px 10px;
      }

      .setting-content>a:hover {
         background: var(--surface-container-highest);
      }

      .setting-content .message {
         padding: 0.4rem 0.8rem;
         font-size: 0.8rem;
      }

      a.about {
         color: var(--color-font);

      }

      .settings>div:hover .setting-content {
         display: flex;
      }

      .settings>div .setting-header {
         display: block;
         text-align: center;
         background: var(--surface);
         border: 1px solid var(--outline-variant);
         color: var(--color-font);
         cursor: pointer;
         min-width: 45px;
         border-radius: 3px;
         padding: 6px 10px;
         margin-bottom: 5px;
         transition: 100ms ease-in-out;
      }

      .settings>div .setting-header:hover {
         border: 1px solid var(--outline);
      }

      .header-lhs-one {
         padding-left: 1.5rem;
      }

      .name {
         display: inline-block;
         font-size: 2.8rem;
         margin: 0;
         font-family: var(--header-font);
         color: var(--color-font-focus);
      }

      .title {
         display: inline-block;
         margin: 0;
         padding-left: 0.7rem;
         font-size: 1.2rem;
         font-family: var(--header-font);
         /* font-style: italic; */
         color: var(--color-font-faded);
      }

      .champion-abilities {
         padding-top: 5px;
         height: 38px;
      }

      .champion-abilities img {
         width: 36px;
         border: 1px solid var(--outline-variant);
      }

      .champion-abilities>div {
         display: inline-block;
      }

      .champion-abilities div:not(:first-child) {
         margin-left: 10px;
      }

      .spell-letter {
         position: relative;
         top: -24px;
         left: -9px;
         font-size: 0.85rem;
         background: var(--surface);
         border-top: 1px solid var(--outline-variant);
         border-right: 1px solid var(--outline-variant);
         text-align: center;
         width: 1rem;
      }

      .header-lhs-image {
         width: 100px;
         height: 100px;
         overflow: hidden;
         border: 1px solid var(--outline-variant);
      }

      .header-lhs-image img {
         width: 100%;
         transform: scale(1.2);
      }
   </style>
