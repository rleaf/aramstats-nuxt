<script setup>
// import champions from '@/constants/champions.js'
import { championNames } from '~/constants/championNames';
import { summonerStore } from '@/stores/summonerStore'
// import { superStore } from '@/stores/superStore'

// const store = superStore()
const summStore = summonerStore()
const matchToggle = ref(false)
const patchCount = ref(1)

const props = defineProps(['data', 'patch'])

onMounted(() => {
   for (let i = 0; i < sortedMatches.value.length; i++) {
      if (!props.data.matches[i-1]) continue
      if (sortedMatches.value[i].gv.split('.').slice(0, 2).join('.') !== sortedMatches.value[i-1].gv.split('.').slice(0, 2).join('.')) {
         patchCount.value++
      }
   }
})


function newPatch(newPatch, oldPatch) {
   if (!oldPatch) return true

   const clean = j => {
      return j.split('.').slice(0, 2).join('.')
   }

   return (clean(newPatch) !== clean(oldPatch.gv)) ? true : false
}

function toggleChampion(id) {
   (summStore.championPool.has(id)) ? summStore.championPool.delete(id) : summStore.championPool.add(id)
}

function onBeforeEnter(el) {
   el.style.opacity = `0`
   el.style.maxHeight = `0`
   el.style.overflow = `hidden`
}

function onAfterEnter(el) {
   el.style.opacity = `1`
   el.style.transition = `all 200ms ease-in-out`
   el.style.maxHeight = `${props.data.matches.length * 39 + patchCount.value * 24}px`
}

function onBeforeLeave(el) {
   el.style.opacity = `0`
   el.style.maxHeight = `0`
}

function patchDividers(c, p) {
   if (!p) return true

   const c1 = c.split('.').slice(0, 2).join('.')
   const p1 = p.gv.split('.').slice(0, 2).join('.')
   
   if (c1 !== p1) {
      return true
   } else {
      return false
   }
}

const cssHeight = computed(() => {
   return props.data.matches.length * 39
})

const sortedMatches = computed(() => {
   return props.data.matches.sort((a, b) => (b.gc) - (a.gc))
})

const kdar = computed(() => {
   return 
})
</script>

<template>
   <div class="champion-main" ref="championMain"
      :class="{ 'active-champion': summStore.championPool.has(props.data.championId) }"
      @click="toggleChampion(props.data.championId)">

      <div class="lhs">
         <img class="dropdown" src="/svg/arrow3.svg" @click.stop="matchToggle = !matchToggle"
            :class="{ 'rotate': !matchToggle }">
         <div class="name-wrapper">
            <div class="icon-wrapper">
               <img class="icon"
                  :src="`https://ddragon.leagueoflegends.com/cdn/${props.patch}/img/champion/${championNames[props.data.championId][0]}.png`" alt="">
            </div>
            <!-- Champion Name -->
            {{ championNames[props.data.championId][1] }}
         </div>
         <div class="winrate">
            {{ Math.round((props.data.wins / props.data.games) * 100) }}%
            <div class="per-minute-sub">
               <!-- Wins / Losses -->
               {{ props.data.wins }}/{{ props.data.games }}
            </div>
         </div>

      </div>

      <div class="rhs">
         <div class="kda">
            {{ props.data.avg.k }}/{{ props.data.avg.d }}/{{ props.data.avg.a }}
            <div class="per-minute-sub">
               <!-- KDA ratio -->
               {{ `${((props.data.avg.k + props.data.avg.a) / props.data.avg.d).toFixed(2)}` }}
            </div>
         </div>
         <div class="kp">
            {{ props.data.avg.kp }}%
         </div>

         <!-- Damage -->
         <div class="primary-stat">
            {{ props.data.avg.tdd }}
            <div class="per-minute-sub">
               {{ props.data.avg.dpm }}
            </div>
         </div>

         <!-- Taken -->
         <div class="primary-stat">
            {{ props.data.avg.tdt }}
            <div class="per-minute-sub">
               {{ props.data.avg.dtpm }}
            </div>
         </div>

         <!-- Mitigated -->
         <div class="primary-stat">
            {{ props.data.avg.tsm }}
            <div class="per-minute-sub">
               {{ props.data.avg.smpm }}
            </div>
         </div>

         <!-- Healing -->
         <div class="primary-stat">
            {{ props.data.avg.th }}
            <div class="per-minute-sub">
               {{ props.data.avg.hpm }}
            </div>
         </div>

         <!-- Ally Healing -->
         <div class="primary-stat">
            {{ props.data.avg.ah }}
            <div class="per-minute-sub">
               {{ props.data.avg.ahpm }}
            </div>
         </div>

         <!-- Gold Earned -->
         <div class="primary-stat">
            {{ props.data.avg.ge }}
            <div class="per-minute-sub">
               {{ props.data.avg.gpm }}
            </div>
         </div>
      </div>
   </div>
   <Transition @before-enter="onBeforeEnter" @after-enter="onAfterEnter" @before-leave="onBeforeLeave">
      <div class="match-container" v-if="matchToggle">
         <div v-for="(m, i) in sortedMatches">
            <Match :patch="props.patch" :data="m" :newPatch="newPatch(m.gv, sortedMatches[i-1])" :key="i"/>
         </div>
      </div>
   </Transition>
</template>

<style scoped>
   .active-champion {
      background: var(--surface-container);
   }

   .icon-wrapper {
      height: 34px;
      width: 34px;
      overflow: hidden;
      border: 1px solid var(--outline-variant);
   }

   img.icon {
      width: 100%;
      transform: scale(1.1);
   }
   
   .champion-main {
      font-size: 0.8rem;
      display: flex;
      justify-content: space-between;
      margin-bottom: 1px;
      height: 38px;
      width: 100%;
      cursor: pointer;
      padding: 2px 0;
      border-radius: 3px;
      border: 1px solid transparent;
      transition: background .2s ease-in-out;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
   }

   .champion-main:hover {
      border: 1px solid var(--outline-variant);
   }

   .name-wrapper {
      display: flex;
      align-items: center;
   }

   .per-minute-sub {
      font-size: 0.72rem;
      color: var(--color-font-faded);
   }
   
   .rhs, .lhs {
      display: flex;
      gap: 5px;
      align-items: center;
   }

   .name-wrapper {
      width: 160px;
   }

   .icon-wrapper {
      margin-right: 8px;
   }

   .rhs {
      justify-content: flex-end;
   }
   
   .rhs div {
      width: 70px;
   }

   .rhs div:nth-child(1) {
      width: 65px; /* KP */
   }

   .rhs div:nth-child(2) {
      width: 40px; /* KP */
   }
   
   .rhs div:nth-child(4) {
      width: 60px; /* KP */
   }

   .rhs div:nth-child(6) {
      width: 55px; /* Healed */
   }

   .rhs div:nth-child(7) {
      width: 75px; /* Ally Healing */
   }

   .rhs div:nth-child(8) {
      margin-left: 5px;
      width: 40px; /* Gold */
   }

   .dropdown {
      margin-left: 7px;
      margin-right: 5px;
      padding: 10px 0;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
   }
   
   .rotate {
      transform: rotate(180deg);
   }
</style>