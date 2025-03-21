<script setup>
import { superStore } from '@/stores/superStore'
import { computed, onMounted, ref } from 'vue'

const store = superStore()
const tip = ref(null)

onMounted(() => {
   tip.value.style.left = store.tooltip.x + 'px'
   tip.value.style.top = store.tooltip.y + 'px'

   const height = (store.tooltip.mode === 'skills') ? `120px` : `-${tip.value.offsetHeight - 30}px`
   tip.value.style.transform = `translate(-50%, ${height})`
})

/* 
   Computed
*/
const data = computed(() => store.items[store.tooltip.key])
const skills = computed(() => 
   [
      store.championCDN['passive'],
      store.championCDN.spells[0],
      store.championCDN.spells[1],
      store.championCDN.spells[2],
      store.championCDN.spells[3],
   ]
)
const skill = computed(() => skills.value[store.tooltip.skillIndex])
const spell = computed(() => store.spells.find(r => r.id == store.tooltip.key))
const rune = computed(() => store.runes.find(r => r.id == store.tooltip.key))

/* 
   Methods
*/
const reg = (str) => {
   return str.replaceAll(/<font[^>]*>/g, "")
}
</script>

<template>
   <div ref="tip" class="item-tooltip-main">

      <div v-if="store.tooltip.mode === 'items'">
         <div class="header">
            <h1>{{ data.name }}</h1>
            <h2>{{ data.gold.total }}g</h2>
         </div>
         <div class="plain-text">{{ data.plaintext }}</div>
         <div class="description" v-html="data.description" />
      </div>

      <div v-else-if="store.tooltip.mode === 'skills'">
         <div class="header">
            <h1>{{ skill.name }}</h1>
            <h2 v-if="skill.cooldownCoefficients">
               <span v-if="store.tooltip.skillIndex !== 4">{{ skill.cooldownCoefficients.slice(0, 5).join('/') }}s</span>
               <span v-else>{{ skill.cooldownCoefficients.slice(0, 3).join('/') }}s</span>
            </h2>
         </div>
         <div v-html="skill.description"></div>
      </div>

      <div v-else-if="store.tooltip.mode === 'spells'">
         <div class="header">
            <h1>{{ spell.name }}</h1>
            <h2>{{ spell.cooldown }}s</h2>
         </div>
         <div class="description">{{ spell.description }}</div>
      </div>

      <div v-else-if="store.tooltip.mode === 'runes'">
         <div class="header">
            <h1>{{ rune.name }}</h1>
         </div>
         <div v-html="reg(rune.longDesc)" class="description" />
      </div>
      
   </div>
</template>

<style scoped>
.item-tooltip-main {
   position: absolute;
   z-index: 5;
   color: var(--color-font);
   background: var(--surface-container);
   border: 1px solid var(--outline);
   padding: 0.5rem 1rem;
   font-size: 0.8rem;
   border-radius: 3px;
   max-width: 300px;
}

.header {
   display: flex;
   gap: 10px;
   align-items: baseline;
   margin-bottom: 0.8rem;
}

h1 {
   color: var(--color-font-focus);
   font-size: 0.9rem;
   font-weight: bold;
   margin: 0;
}

h2 { 
   font-size: 0.8rem;
   font-weight: normal;
   margin: 0;
}

.plain-text {
   padding-bottom: 0.5rem;
}
</style>