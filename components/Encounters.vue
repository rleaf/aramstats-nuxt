<script setup>

const friendlies = ref({})
const enemies = ref({})
const props = defineProps(['data'])
const data = props.data

populate()

function populate() {
   const af = (prop, x, arr) => {
      if (!x.gn) return
      let o = `${x.gn}#${x.tl}`
      if (prop[o]) {
         prop[o][0] += arr[0]
         prop[o][1] += arr[1]
      } else {
         prop[o] = arr
      }
   }
   
   for (const champion of data) {
      for (const match of champion.matches) {
         if (match.w) {
            match.te.forEach(x => af(friendlies.value, x, [1, 1])) // times you've won with player
            match.ee.forEach(x => af(enemies.value, x, [1, 1]))    // times you've won against player
         } else {
            match.te.forEach(x => af(friendlies.value, x, [0, 1])) // times you've lost with player
            match.ee.forEach(x => af(enemies.value, x, [0, 1]))    // times you've lost against player
         }
      }
   }

}

const getFriendlies = computed(() => {
   return Object.entries(friendlies.value).sort((a, b) => b[1][1] - a[1][1]).slice(0, 50)
})

const getEnemies = computed(() => {
   return Object.entries(enemies.value).sort((a, b) => b[1][1] - a[1][1]).slice(0, 50)
})

</script>

<template>
   <StatDropdown
      :header="'Friendlies'"
      :stats="getFriendlies"
      :encounters="true"
      :tooltip="'friendlies'"/>
   <StatDropdown
      :header="'Enemies'"
      :stats="getEnemies"
      :encounters="true"
      :tooltip="'enemies'"/>
</template>

<style scoped>

</style>