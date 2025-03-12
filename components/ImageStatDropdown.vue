<script setup>
import { summonerStore } from '@/stores/summonerStore'
const summStore = summonerStore()
const state = ref(false)

const props = defineProps(['header', 'stats', 'tooltip'])

function assetImage(id) {
   return (props.header === 'Summoner Spells') ? `/spells/${id}.webp` :
      `/runes/${id}.png`
}

const imageSize = computed(() => {
   switch (props.header) {
      case 'Summoner Spells':
         return 'spell-images'
      case 'Keystone Runes':
         return 'rune-images'
      case 'Secondary Trees':
         return 'tree-images'
      default:
         return 'spell-images'
   }
})

const maxHeight = computed(() => {
   if (props.header !== 'Summoner Spells' && summStore.championPool.size === 0) {
      return 'max-height: 25px'
   }
   return `max-height: ${Math.round(props.stats.length / 2) * 45}px`
})

const getStats = computed(() => {
   if (props.header === 'Secondary Trees' || props.header === 'Keystone Runes') {
      // some matches don't properly save runeId data, so void it if the value is 0. Lux secondary tree @ EUW1_7001355483 = { ... "style": 0 }
      return props.stats.filter(o => Number(o[0]) !== 0)
   } else {
      return props.stats
   }
})

</script>

<template>
<div class="stat-main" :class="{ 'main-truncated': state }">
   <div class="stat-header">
      <div class="header-title" @click="state = !state" v-if="props.header">
         {{ props.header }}
         <img class="arrow"  src="/svg/arrow3.svg" :class="{ 'arrow-up': state }" alt="">
      </div>
      <UXTooltip :align="'left'" :tip="props.tooltip" />
   </div>
   <div class="stat-body bordered"  :class="{ 'truncated': state }" :style="maxHeight">
      <div v-if="header !== 'Summoner Spells' && summStore.championPool.size === 0" class="helper">Click on some champions to see this stat</div>
      <div class="loop" v-for="(s, j) in getStats" :class="{ 'o': Math.round(j/2) % 2 === 0 }" :key="j">
         <div class="stat-wrapper">
            <img :class="imageSize" :src="assetImage(s[0])" alt="">
            <div>
               <span>
                  <span v-if="props.header === 'Summoner Spells'">Casts: </span>
                  <span v-else="props.header === 'Summoner Spells'">Wins: </span>

                  <span v-if="summStore.championPool.size > 0" style="color: var(--color-font);">{{ s[1][1] }}</span>
                  <span v-else style="color: var(--color-font);">-</span>
               </span>
               <span>
                  Games:
                  <span v-if="summStore.championPool.size > 0" style="color: var(--color-font);">{{ s[1][0] }}</span>
                  <span v-else style="color: var(--color-font);">-</span>
               </span>
            </div>
         </div>

      </div>
   </div>
</div>
</template>

<style scoped>

.helper {
   font-size: 0.75rem;
   line-height: 2;
   font-style: italic;
   color: var(--color-font-faded);
}
.stat-main {
   padding-bottom: 25px;
}

.header-title {
   padding: 0.2rem 0.4rem;
   border-radius: 3px;
   transition: all 200ms ease-in-out;
}

.spell-images {
   border-radius: 3px;
   width: 32px;
   height: 32px;
}

.rune-images {
   width: 34px;
   filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.5));
   height: 34px;
}

.tree-images {
   filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));
   width: 24px;
   height: 24px;
}

.stat-header {
   display: flex;
   font-size: 0.85rem;
   align-items: center;
   justify-content: space-between;
   margin-bottom: 5px;
}

.stat-header .header-title {
   font-weight: 600;
   color: var(--color-font-focus);
   cursor: pointer;
   -webkit-touch-callout: none;
   -webkit-user-select: none;
   -khtml-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   user-select: none;
}

.stat-body {
   overflow: hidden;
   display: flex;
   flex-wrap: wrap;
   justify-content: space-between;
   transition: max-height 200ms ease-in-out;
}

.bordered {
   border-left: 1px solid var(--outline-variant);
   padding-left: 0.4rem;
}

.main-truncated {
   padding-bottom: 5px;
}

div.truncated {
   max-height: 0 !important;
   opacity: 1;
}

.arrow {
   margin-left: 5px;
}

.arrow-up {
   transform: rotate(180deg);
}

.stat-wrapper {
   display: flex;
   justify-content: space-between;
   align-items: center;
}

.loop {
   font-size: 0.8rem;
   flex: 0 0 44%;
   margin-top: 1px;
   padding: 0.25rem 0.35rem;
   border-radius: 3px;
}

.loop div > span {
   text-align: right;
   display: block;
   color: var(--color-font-faded);
   line-height: 1.5;
   font-size: 0.72rem;
}

.o {
   background: var(--surface-container);
}
</style>