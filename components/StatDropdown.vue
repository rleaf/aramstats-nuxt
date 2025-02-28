<script setup>
import { summonerStore } from '@/stores/summonerStore'
const summStore = summonerStore()
const state = ref(false)

const props = defineProps(['header', 'stats', 'persist', 'encounters', 'tooltip'])

const maxHeight = computed(() => {
   return (props.encounters) ? `max-height: ${props.stats.length * 35}px` : `max-height: ${props.stats.length * 25}px`
})

</script>

<template>
<div class="stat-main" :class="{ 'main-truncated': state }">
   <div class="stat-header">
      <div class="header-title" @click="state = !state" v-if="props.header">
         {{ props.header }}
         <img class="arrow"  src="/svg/arrow3.svg" :class="{ 'arrow-up': state }" alt="">
      </div>
      <UXTooltip v-if="!props.persist" :align="'left'" :tip="props.tooltip" />
   </div>
   <div class="stat-body" :class="{ 'truncated': state, 'bordered': !props.persist }" :style="maxHeight">
      
      <div v-if="props.encounters" class="encounters" v-for="(s, i) in props.stats" :class="{ 'o': i % 2 === 0 }" :key="i">
         <span>
            {{ s[0] }}
         </span>
         <div class="encounters-stat">
            {{ Math.round(s[1][0] / s[1][1] * 1000) / 10 }}%
            <div>
               {{ s[1][0] }}/{{ s[1][1] }}
            </div>
         </div>
      </div>

      <div v-else v-for="(s, j) in props.stats" :class="{ 'o': j % 2 === 0 }" :key="j">
         <span>{{ s[0] || '-' }}</span>
         <span v-if="persist">{{ s[1] }}</span>
         <span v-else-if="summStore.championPool.size > 0">{{ s[1] }}</span>
         <span v-else style="color: var(--color-font-faded);">-</span>
      </div>
   </div>
</div>
</template>

<style scoped>
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
   width: 20px;
}

.header-title:hover {
   background: var(--cold-blue-focus);
   /* font-size: 1.3rem; */
}

.stat-header {
   display: flex;
   font-size: 0.85rem;
   align-items: center;
   justify-content: space-between;
   margin-bottom: 5px;
}

.stat-header .header-title {
   color: var(--color-font-focus);
   font-weight: 600;
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

.stat-body div {
   font-size: 0.8rem;
   display: flex;
   margin-top: 1px;
   padding: 0.2rem 0.5rem;
   border-radius: 3px;
   justify-content: space-between;
   align-items: center;
}

.stat-body span {
   font-size: 0.8rem;
}

.encounters span:first-child {
   width: 60%;
   overflow-wrap: break-word;
}

.encounters div {
   padding: 0;
   margin: 0;
}

div.encounters-stat {
   padding: 1px 0;
}

.encounters-stat div {
   padding-left: 0.5rem;
   /* font-size: 0.75rem; */
   color: var(--color-font-faded);
}

/* .encounters span:last-child {
   width: 16%;
   text-align: right;
} */


.o {
   background: var(--surface-container);
}
</style>