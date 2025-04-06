<script setup>
// import Champion from '../Champion.vue'
import { championNames } from '~/constants/championNames'
import { superStore } from '@/stores/superStore'
import { summonerStore } from '@/stores/summonerStore'

const store = superStore()                   // Store for global settings
const summStore = summonerStore()            // Store for summoner settings
const route = useRoute()
const props = defineProps(['data']) 
const data = ref(null)                       // Maintain reactivity for updating
data.value = props.data
const championFilter = ref('')               // Filter for table champion search
const sortFilter = ref(0)                    // Determine if sort is active
const sortMod = ref(false)                   // Determine if sort by PER MINUTE variant
const toggleState = ref(false)               // Determine if toggle all button has been clicked
const descending = ref(false)                // Determine if sort is in descending
const moduleStats = ref(false)               // Determine if module stats window is active
const statsSelection = ref('Champion Stats') // Stats window to be rendered on lhs.
const update = ref(false)                    // Bool to help UX for update button
const updateKey = ref(0)                     // For re-rendering post summoner update                       

const updateButton = useTemplateRef('updateButton')
const championSearch = useTemplateRef('championSearch')
await store.initPatches()

useSeoMeta({
   title: `${data.value.gameName}#${data.value.tagLine} - ARAM Stats`
})

onMounted(() => {
   window.addEventListener('keypress', championSearchFocus)
})

onBeforeUnmount(() => {
   window.removeEventListener('keypress', championSearchFocus)
})

function headerSort(i) {
   (sortFilter.value === i) ? descending.value = !descending.value : sortFilter.value = i
   sortMod.value = false
}

function championSearchFocus(e) {
   if (e.key !== 's' || document.activeElement === championSearch.value || store.focus || store.navContainerFocus) return

   e.preventDefault()
   championSearch.value.focus()
}

function toggleAll() {
   toggleState.value = !toggleState.value

   if (toggleState.value) {
      for (const c of data.value.championData) {
         summStore.championPool.add(c.championId)
      }
   } else {
      summStore.championPool.clear()
   }

}

// function del() {
//    $fetch(`/api/summoner/delete`,{
//       method: 'DELETE',
//       params: {
//          region: route.params.region,
//          gameName: route.params.gameName,
//          tagLine: route.params.tagLine,
//       }
//    })
// }

async function updateProfile() {
   update.value = true
   updateButton.value.innerHTML = 'Updating...'
   const { payload, status } = await $fetch('/api/summoner/update', {
      method: 'PUT',
      params: {
         region: route.params.region,
         gameName: route.params.gameName,
         tagLine: route.params.tagLine
      }
   })

   update.value = false
   updateButton.value.innerHTML = 'Update'

   if (status === 200) {
      data.value = payload
      store.setNotification('Summoner updated')
      updateKey.value++
   }

   if (status === 204) {
      store.setNotification('Summoner already up to date')
   }
}

const sortTable = computed(() => {
   return ['Games', ...lhsHeaders.value, ...rhsHeaders.value]
})

const filteredChampions = computed(() => {
   return data.value.championData.filter(c => championNames[c.championId][1].toLowerCase().includes(championFilter.value.toLowerCase()))
})

const sortedChampions = computed(() => {
   if (sortMod.value) {
      switch (sortFilter.value) {
         case 5:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.avg.dpm) - (b.avg.dpm)) :
               filteredChampions.value.sort((a, b) => (b.avg.dpm) - (a.avg.dpm))
         case 6:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.avg.dtpm) - (b.avg.dtpm)) :
               filteredChampions.value.sort((a, b) => (b.avg.dtpm) - (a.avg.dtpm))
         case 7:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.avg.smpm) - (b.avg.smpm)) :
               filteredChampions.value.sort((a, b) => (b.avg.smpm) - (a.avg.smpm))
         case 8:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.avg.hpm) - (b.avg.hpm)) :
               filteredChampions.value.sort((a, b) => (b.avg.hpm) - (a.avg.hpm))
         case 9:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.avg.ahpm) - (b.avg.ahpm)) :
               filteredChampions.value.sort((a, b) => (b.avg.ahpm) - (a.avg.ahpm))
         case 10:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.avg.gpm) - (b.avg.gpm)) :
               filteredChampions.value.sort((a, b) => (b.avg.gpm) - (a.avg.gpm))
         default:
            return filteredChampions.value.sort((a, b) => (b.games) - (a.games))
      }
   } else {
      switch (sortFilter.value) {
         case 0:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.games) - (b.games)) :
               filteredChampions.value.sort((a, b) => (b.games) - (a.games))
         case 1:
            return (descending.value) ? filteredChampions.value.sort((a, b) => championNames[b.championId][1].localeCompare(championNames[a.championId][1])) :
               filteredChampions.value.sort((a, b) => championNames[a.championId][1].localeCompare(championNames[b.championId][1]))
         case 2:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.wins / a.games) - (b.wins / b.games)) :
               filteredChampions.value.sort((a, b) => (b.wins / b.games) - (a.wins / a.games))
         case 3:
            return (descending.value) ? filteredChampions.value.sort((a, b) => ((a.avg.k + a.avg.a) / a.avg.d) - ((b.avg.k + b.avg.a) / b.avg.d)) :
               filteredChampions.value.sort((a, b) => ((b.avg.k + b.avg.a) / b.avg.d) - ((a.avg.k + a.avg.a) / a.avg.d))
         case 4:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.avg.kp) - (b.avg.kp)) :
               filteredChampions.value.sort((a, b) => (b.avg.kp) - (a.avg.kp))
         case 5:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.avg.tdd) - (b.avg.tdd)) :
               filteredChampions.value.sort((a, b) => (b.avg.tdd) - (a.avg.tdd))
         case 6:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.avg.tdt) - (b.avg.tdt)) :
               filteredChampions.value.sort((a, b) => (b.avg.tdt) - (a.avg.tdt))
         case 7:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.avg.tsm) - (b.avg.tsm)) :
               filteredChampions.value.sort((a, b) => (b.avg.tsm) - (a.avg.tsm))
         case 8:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.avg.th) - (b.avg.th)) :
               filteredChampions.value.sort((a, b) => (b.avg.th) - (a.avg.th))
         case 9:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.avg.ah) - (b.avg.ah)) :
               filteredChampions.value.sort((a, b) => (b.avg.ah) - (a.avg.ah))
         case 10:
            return (descending.value) ? filteredChampions.value.sort((a, b) => (a.avg.ge) - (b.avg.ge)) :
               filteredChampions.value.sort((a, b) => (b.avg.ge) - (a.avg.ge))
         default:
            return filteredChampions.value.sort((a, b) => (b.games) - (a.games))
      }
   }
})

const profileIcon = computed(() => {
   return `https://ddragon.leagueoflegends.com/cdn/${store.patches[0]}/img/profileicon/${data.value.profileIcon}.png`
})

const lhsHeaders = computed(() => {
   return ['Champion', 'Winrate']
})

const rhsHeaders = computed(() => {
   return ['KDA', 'KP', 'Damage', 'Taken', 'Mitigated', 'Healed', 'Ally Healing', 'Gold']
})

const convertChampionData = computed(() => {
   return data.value.championData.reduce((o, c) => {
      o[c.championId] = c
      return o
   }, {})
})

const computeAccountStats = computed(() => {
   let a_g = 0, a_w = 0, a_tp = 0
   let rsg = 0, rw = 0, bw = 0

   for (const c of data.value.championData) {
      a_g += c.games
      a_w += c.wins
      rsg += c.rsg
      bw += c.bw
      rw += c.rw

      for (const m of c.matches) {
         a_tp += m.gd
      }
   }

   return {
      'champs': `${data.value.championData.length}`,
      'winrate': `${(a_w / a_g * 100).toFixed(2)}%`,
      'time': `${Math.round(a_tp / 1440 * 100) / 100} days`,
      'games': `${a_g}`,
      'bsg': `${a_g - rsg}`,
      'rsg': `${rsg}`,
      'bw': `${(bw / a_w * 100).toFixed(2)}%`,
      'rw': `${(rw / a_w * 100).toFixed(2)}%`,
      'fs': `${data.fountainSitter}`
   }
})

const aggregatedStats = computed(() => {
   let c_kda = [0, 0, 0]
   let stats = {
      // Generals
      'kda': '',
      'matches': 0,
      'fbk': 0,
      'gameLength': 0,
      'deathTime': 0,
      'damage': 0,
      'damageTaken': 0,
      'damageMitigated': 0,
      'healed': 0,
      'allyShielded': 0,
      'allyHealed': 0,
      'gold': 0,
      'killParticipation': 0,
      // Multikills
      'triples': 0,
      'quadras': 0,
      'pentas': 0,
      // Structures
      'towersDestroyed': 0,
      'damageDealtToTowers': 0,
      'towersLost': 0,
      // Teamfights
      'expectation': 0,
      'capitalization': 0,
      'usefulness': 0,
      'participation': 0,
      'frequency': 0,
      'death': 0,
      // Spell casts
      'q': 0,
      'w': 0,
      'e': 0,
      'r': 0,
      // Summoner Spells
      '1': [0, 0],
      '3': [0, 0],
      '4': [0, 0],
      '6': [0, 0],
      '7': [0, 0],
      '13': [0, 0],
      '14': [0, 0],
      '21': [0, 0],
      '32': [0, 0],
      // Runes
      'primaryRunes': {},
      'secondaryRunes': {},
      // Pings
      'allIn': 0,
      'missing': 0,
      'basic': 0,
      'command': 0,
      'danger': 0,
      'enMiss': 0,
      'enVis': 0,
      'back': 0,
      'hold': 0,
      'vis': 0,
      'omw': 0,
      'push': 0,
      'visClear': 0,
      // Items
      'slotUnus': 0,
      'slotDuo': 0,
      'slotTres': 0,
      'slotQuattuor': 0,
      'slotQuinque': 0,
      'slotSex': 0,
   }

   let championAveragedStats = [
      'killParticipation',
      'damage',
      'damageTaken',
      'damageMitigated',
      'healed',
      'allyHealed',
      'allyShielded',
      'gold',
   ]

   let matchAveragedStats = [
      'deathTime',
      'gameLength',
      'damageDealtToTowers',
   ]

   let itemSlots = [
      'slotUnus',
      'slotDuo',
      'slotTres',
      'slotQuattuor',
      'slotQuinque',
      'slotSex',
   ]

   let summonerSpells = [
      '1',
      '3',
      '4',
      '6',
      '7',
      '13',
      '14',
      '21',
      '32',
   ]

   const formatTime = (o) => {
      // Prettify time to MM:SS. 5.2 --> 05:12
      const af = n => (n.length === 1) ? '0' + n : n

      if (!o) return '-'
      const i = o.toString().split('.')
      let one = af(i[0])
      let two = Math.floor(Number(`.${i[1]}`) * 60).toString()
      two = af(two)

      return `${one}:${two}`
   }

   let itemArrayHelper = [0, 0, 0, 0, 0, 0]

   for (const c of summStore.championPool) {
      const o = convertChampionData.value[c]

      c_kda[0] += o.avg.k
      c_kda[1] += o.avg.d
      c_kda[2] += o.avg.a
      stats.fbk += o.fbk

      stats.killParticipation += o.avg.kp
      stats.damage += o.avg.tdd
      stats.damageTaken += o.avg.tdt
      stats.damageMitigated += o.avg.tsm
      stats.healed += o.avg.th
      stats.allyShielded += o.avg.as
      stats.allyHealed += o.avg.ah
      stats.gold += o.avg.ge
      stats.triples += o.mk.t
      stats.quadras += o.mk.q
      stats.pentas += o.mk.p
      stats.towersLost += o.tl
      stats.towersDestroyed += o.tg
      stats.damageDealtToTowers += o.ddtt
      stats.expectation += o.tf.exp
      stats.capitalization += o.tf.cap
      stats.usefulness += o.tf.use
      stats.participation += o.tf.part
      stats.frequency += o.tf.freq
      stats.death += o.tf.death

      for (const ss of summonerSpells) {
         stats[ss][0] += o.ss[ss].games
         stats[ss][1] += o.ss[ss].casts
      }

      stats.q += o.sc.q
      stats.w += o.sc.w
      stats.e += o.sc.e
      stats.r += o.sc.r
      stats.allIn += o.p.all
      stats.missing += o.p.assist
      stats.basic += o.p.back
      stats.command += o.p.comm
      stats.danger += o.p.danger
      stats.enMiss += o.p.enMiss
      stats.enVis += o.p.enVis
      stats.back += o.p.hold
      stats.hold += o.p.omw
      stats.vis += o.p.vis
      stats.omw += o.p.omw
      stats.push += o.p.push
      stats.visClear += o.p.visClr

      stats.matches += o.matches.length

      for (const m of o.matches) {
         stats.gameLength += m.gd
         stats.deathTime += m.tsd

         if (stats.primaryRunes[m.pr]) {
            stats.primaryRunes[m.pr][0]++
            stats.primaryRunes[m.pr][1] += (m.w) ? 1 : 0
         } else {
            stats.primaryRunes[m.pr] = [1, (m.w) ? 1 : 0]
         }

         if (stats.secondaryRunes[m.sr]) {
            stats.secondaryRunes[m.sr][0]++
            stats.secondaryRunes[m.sr][1] += (m.w) ? 1 : 0
         } else {
            stats.secondaryRunes[m.sr] = [1, (m.w) ? 1 : 0]
         }

         for (let i = 0; i < 6; i++) {
            if (m.ic[i] > 0) itemArrayHelper[i]++
         }

         itemSlots.forEach((o, i) => stats[o] += m.ic[i])
      }
   }

   itemSlots.forEach((o, i) => {
      stats[o] = Math.round(stats[o] / itemArrayHelper[i] * 100) / 100
      stats[o] = formatTime(stats[o])
   })

   /**
    * CHAMPION AVERAGE STATS
    * Stats that are already averaged for the champion on the backend and need to be divided against the amount of champions selected.
    */
   const divByChamps = (o) => Math.round(o / summStore.championPool.size)
   c_kda = c_kda.map(x => divByChamps(x))

   championAveragedStats.forEach(o => stats[o] = Math.round(stats[o] / summStore.championPool.size))
   stats.kda = `${c_kda[0]}/${c_kda[1]}/${c_kda[2]}`



   /**
    * MATCH AVERAGE STATS
    * Match stats that need to be summed, then divided by the match count. These are stats that are not precomputed on the backend.
   */
   matchAveragedStats.forEach(o => stats[o] = (stats[o] / stats.matches).toFixed(1))

   const af = (n, d) => (Math.round(n / d * 1000) / 1000)
   stats.capitalization = af(stats.capitalization, stats.frequency)
   stats.expectation = af(stats.expectation, stats.participation)
   stats.usefulness = af(stats.usefulness, stats.participation)
   stats.death = af(stats.death, stats.participation)

   stats.gameLength = formatTime(stats.gameLength) // Game duration
   stats.deathTime = formatTime(stats.deathTime / 60) // Death time (/=60 cause tsd is in seconds)

   return stats
})

const getAccountStats = computed(() => {
   return [
      ['Champions Played', computeAccountStats.value['champs']],
      ['Winrate', computeAccountStats.value['winrate']],
      ['Time Played', computeAccountStats.value['time']],
      ['Games', computeAccountStats.value['games']],
   ]
})

const getGeneralStats = computed(() => {
   return [
      ['KDA', aggregatedStats.value['kda']],
      ['Matches', aggregatedStats.value['matches']],
      ['First Blood', aggregatedStats.value['fbk']],
      ['Kill Participation', aggregatedStats.value['killParticipation'] + '%'],
      ['Game Length', aggregatedStats.value['gameLength']],
      ['Death Time', aggregatedStats.value['deathTime']],
      ['Damage', aggregatedStats.value['damage']],
      ['Damage Taken', aggregatedStats.value['damageTaken']],
      ['Damage Mitigated', aggregatedStats.value['damageMitigated']],
      ['Healing', aggregatedStats.value['healed']],
      ['Ally Healing', aggregatedStats.value['allyHealed']],
      ['Ally Shielding', aggregatedStats.value['allyShielded']],
      ['Gold', aggregatedStats.value['gold']],
   ]
})

const getItemSlots = computed(() => {
   return [
      ['Slot 1', aggregatedStats.value['slotUnus']],
      ['Slot 2', aggregatedStats.value['slotDuo']],
      ['Slot 3', aggregatedStats.value['slotTres']],
      ['Slot 4', aggregatedStats.value['slotQuattuor']],
      ['Slot 5', aggregatedStats.value['slotQuinque']],
      ['Slot 6', aggregatedStats.value['slotSex']],
   ]
})

const getMultiKills = computed(() => {
   return [
      ['Triples', aggregatedStats.value['triples']],
      ['Quadras', aggregatedStats.value['quadras']],
      ['Pentas', aggregatedStats.value['pentas']],
   ]
})

const getStructures = computed(() => {
   return [
      ['Towers Destroyed', aggregatedStats.value['towersDestroyed']],
      ['Towers Lost', aggregatedStats.value['towersLost']],
      ['Tower Damage Dealt', Math.round(aggregatedStats.value['damageDealtToTowers'])],
   ]
})

const getTeamfights = computed(() => {
   return [
      ['Frequency', aggregatedStats.value['frequency']],
      ['Expectation', aggregatedStats.value['expectation'].toFixed(2)],
      ['Longevity', aggregatedStats.value['usefulness'].toFixed(2)],
      ['Participation', (aggregatedStats.value['participation'] / aggregatedStats.value['frequency'] * 100).toFixed(2) + '%'],
      ['Death', (aggregatedStats.value['death'] * 100).toFixed(1) + '%'],
      ['Capitalization', (aggregatedStats.value['capitalization'] * 100).toFixed(1) + '%'],
   ]
})

const getSummonerSpells = computed(() => {
   return [
      ['1', aggregatedStats.value['1']],
      ['3', aggregatedStats.value['3']],
      ['4', aggregatedStats.value['4']],
      ['6', aggregatedStats.value['6']],
      ['7', aggregatedStats.value['7']],
      ['13', aggregatedStats.value['13']],
      ['14', aggregatedStats.value['14']],
      ['21', aggregatedStats.value['21']],
      ['32', aggregatedStats.value['32']],
   ]
})

const getSpellCasts = computed(() => {
   return [
      ['Q', aggregatedStats.value['q']],
      ['W', aggregatedStats.value['w']],
      ['E', aggregatedStats.value['e']],
      ['R', aggregatedStats.value['r']],
   ]
})

const getKeystoneRunes = computed(() => {
   return Object.entries(aggregatedStats.value.primaryRunes)
})

const getSecondaryTree = computed(() => {
   return Object.entries(aggregatedStats.value.secondaryRunes)
})

const getPings = computed(() => {
   return [
      ['All In', aggregatedStats.value['allIn']],
      ['Missing', aggregatedStats.value['missing']],
      ['Basic', aggregatedStats.value['basic']],
      ['Command', aggregatedStats.value['command']],
      ['Danger', aggregatedStats.value['danger']],
      ['Enemy Missing', aggregatedStats.value['enMiss']],
      ['Enemy Vision', aggregatedStats.value['enVis']],
      ['Back', aggregatedStats.value['back']],
      ['Hold', aggregatedStats.value['hold']],
      ['Need Vision', aggregatedStats.value['vis']],
      ['On My Way', aggregatedStats.value['omw']],
      ['Push', aggregatedStats.value['push']],
      ['Vision Clear', aggregatedStats.value['visClear']],
   ]
})

const updatedDate = computed(() => {
   return new Date(data.value.updated).toLocaleDateString()
})

</script>

<template>
   <div class="summoner-ready-main" :key="updateKey">
      <div class="gradient-bg" />
      <div ref="header" class="header">
         <img v-if="update" class="bongo" src="/images/bongo-cat.gif" alt="">
         <div class="header-lhs">
            <div class="header-summoner-icon">
               <img :src="profileIcon" alt="">
            </div>
            <div class="header-lhs-one">
               <div class="summoner-name">
                  {{ data.gameName }}
                  <div class="tagLine">{{ data.tagLine }}</div>
               </div>
               <div class="buttons">
                  <button :class="{ 'active-update': update }" ref="updateButton" :disabled="update"
                     @click="updateProfile()">Update</button>
               </div>
               <div class="last-updated">
                  Last updated: {{ updatedDate }}
               </div>
            </div>
         </div>

         <div class="header-rhs">
            <RadarChart :data="data.championData" />
         </div>
      </div>
      <div class="body">

         <div class="lhs-body">
            <div class="section">
               <div class="section-header">
                  <h2>Account</h2>
                  <UXTooltip :align="'left'" :tip="'account'" />
               </div>
               <StatDropdown :stats="getAccountStats" :persist="true" :tooltip="'implement'" />

               <div class="side-stats" style="padding-bottom: 30px;">
                  <h3>Side Winrate</h3>
                  <div class="visual">
                     <span :style="{ 'width': parseInt(computeAccountStats['rw']) + '%' }"></span>
                     <span :style="{ 'width': parseInt(computeAccountStats['bw']) + '%' }"></span>
                  </div>
                  <div class="details">
                     <div>
                        <svg width="10" height="10">
                           <circle fill="var(--red-side)" cx="5" cy="5" r="5" />
                        </svg>
                        {{ computeAccountStats['rw'] }}
                        <span class="game-count">{{ computeAccountStats[4] }}</span>
                     </div>
                     <div>
                        <svg width="10" height="10">
                           <circle fill="var(--blue-side)" cx="5" cy="5" r="5" />
                        </svg>
                        {{ computeAccountStats['bw'] }}
                        <span class="game-count">{{ computeAccountStats[3] }}</span>
                     </div>
                  </div>
               </div>
               <div class="side-stats">
                  <h3>Side Playrate</h3>
                  <div class="visual">
                     <span
                        :style="{ 'width': (computeAccountStats['rsg'] / computeAccountStats['games'] * 100 - 0.5) + '%' }"></span>
                     <span
                        :style="{ 'width': (computeAccountStats['bsg'] / computeAccountStats['games'] * 100 - 0.5) + '%' }"></span>
                  </div>
                  <div class="details">
                     <div>
                        <svg width="10" height="10">
                           <circle fill="var(--red-side)" cx="5" cy="5" r="5" />
                        </svg>
                        {{ Math.round(computeAccountStats['rsg'] / computeAccountStats['games'] * 100) }}%
                        <span class="game-count">{{ computeAccountStats[4] }}</span>
                     </div>
                     <div>
                        <svg width="10" height="10">
                           <circle fill="var(--blue-side)" cx="5" cy="5" r="5" />
                        </svg>
                        {{ Math.round(computeAccountStats['bsg'] / computeAccountStats['games'] * 100) }}%
                        <span class="game-count">{{ computeAccountStats[3] }}</span>
                     </div>
                  </div>
               </div>

            </div>
            <div class="section">
               <div class="section-header">
                  <div class="module">
                     <div class="burger" @click="moduleStats = !moduleStats"
                        :class="{ 'module-menu-active': moduleStats }">
                        <span v-for="i in 4" :key="i"></span>
                     </div>
                     <h2>{{ statsSelection }}</h2>
                  </div>
               </div>
               <Transition name="module">
                  <div v-if="moduleStats" class="module-menu">
                     <div class="selections">
                        <div @click="statsSelection = 'Champion Stats'; moduleStats = false">Champion Stats
                        </div>
                        <div @click="statsSelection = 'Challenges'; moduleStats = false">Challenges</div>
                        <div @click="statsSelection = 'Encounters'; moduleStats = false">Encounters</div>
                     </div>
                  </div>
               </Transition>
               <div v-if="moduleStats" class="outer-click" @click="moduleStats = false"></div>

               <div v-if="statsSelection == 'Champion Stats'">
                  <StatDropdown :header="'General'" :stats="getGeneralStats" :tooltip="'general'" />

                  <StatDropdown :header="'Item Completion'" :stats="getItemSlots" :tooltip="'itemSlots'" />

                  <StatDropdown :header="'Multikills'" :stats="getMultiKills" :tooltip="'multikills'" />

                  <StatDropdown :header="'Structures'" :stats="getStructures" :tooltip="'structures'" />

                  <StatDropdown :header="'Teamfights'" :stats="getTeamfights" :tooltip="'teamfights'" />

                  <ImageStatDropdown :header="'Summoner Spells'" :stats="getSummonerSpells"
                     :tooltip="'summonerSpells'" />

                  <ImageStatDropdown :header="'Keystone Runes'" :stats="getKeystoneRunes" :tooltip="'keystoneRunes'" />

                  <ImageStatDropdown :header="'Secondary Trees'" :stats="getSecondaryTree" :tooltip="'secondaryTree'" />

                  <StatDropdown :header="'Spellcasts'" :stats="getSpellCasts" :tooltip="'spellcasts'" />

                  <StatDropdown :header="'Pings'" :stats="getPings" :tooltip="'pings'" />
               </div>

               <div v-if="statsSelection == 'Challenges'">
                  <Challenges :data="data.challenges" />
               </div>

               <div v-if="statsSelection == 'Encounters'">
                  <Encounters :data="data.championData" />
               </div>

            </div>
         </div>

         <div class="rhs-body">
            <Heatmap :data="data.championData" />
            <div class="utility">
               <div>
                  <input ref="championSearch" @keyup.escape="championSearch.blur()" @click="championFilter = ''"
                     type="text" v-model="championFilter" spellcheck="false">
                  <span v-show="!championFilter.length" class="keyboard-shortcut">
                     Press <kbd>s</kbd> to search
                  </span>
               </div>
               <div class="rhs-utility" style="margin-left: auto;">
                  <div class="champion-sort">
                     <span class="superscript">Sorting by{{ sortMod ? ' per minute:' : ':' }}</span>
                     <div>
                        <button>{{ sortTable[sortFilter] }}</button>
                        <div class="champion-sort-options">
                           <div v-for="(o, i) in sortTable" :key="i">
                              <span @click="sortFilter = i; sortMod = false">{{ o }}</span>
                              <span v-if="i > 4" @click="sortFilter = i; sortMod = true">/m</span>
                           </div>
                        </div>
                     </div>
                  </div>
                  <button class="asc-des-button" @click="descending = !descending">
                     <svg width="18" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect class="asc-des" x="2" y="8" :width="descending ? '6' : '18'" height="2" />
                        <rect class="asc-des" x="2" y="13" width="11" height="2" />
                        <rect class="asc-des" x="2" y="18" :width="descending ? '18' : '6'" height="2" />
                     </svg>
                  </button>
                  <button :class="{ 'active': toggleState }" @click="toggleAll()">Toggle All</button>
               </div>
               <UXTooltip :align="'right'" :tip="'championsTable'" />
            </div>
            <div class="table-headers">
               <div class="lhs">
                  <div @click="headerSort(i + 1)" :class="{ 'sort-focus': sortFilter === i + 1 }"
                     v-for="(h, i) in lhsHeaders" :key="i">
                     {{ h }}
                  </div>
               </div>
               <div class="rhs">
                  <div @click="headerSort(i + 3)" :class="{ 'sort-focus': sortFilter === i + 3 }"
                     v-for="(h, i) in rhsHeaders" :key="i">
                     {{ h }}
                  </div>
               </div>
            </div>
            <div class="champions">
               <Champion :data="c" v-for="c in sortedChampions" :patch="store.patches[0]" :key="c.championId" />
            </div>
         </div>
      </div>
   </div>
</template>

<style scoped>
.summoner-ready-main {
   display: flex;
   flex-direction: column;
   margin: 0 auto;
   width: 1100px;
   color: var(--color-font-focus);
}

.header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   width: 100%;
   margin-top: 5vh;
   padding-top: 4vh;
   padding-bottom: 6vh;
   border-top: 1px solid var(--outline);
   /* background: radial-gradient(ellipse at top, var(--cell-panel), var(--cell-panel-rgb) 25%); */
}

.header-lhs {
   display: flex;
}

.header-summoner-icon {
   width: 100px;
   height: 100px;
   overflow: hidden;
   border-radius: 100%;
   border: 1px solid var(--outline-variant);
}

.header-summoner-icon img {
   width: 100%;
}

.header-lhs-one {
   padding-left: 1.5rem;
}

.last-updated {
   font-size: 0.75rem;
   color: var(--color-font-faded);
   padding: 0.35rem 0rem;
}

.bongo {
   position: absolute;
   left: calc(50% - 100px);
   width: 300px;
   transform: rotate(-13deg) translate(-130px, 127px);
}

.update-message {
   position: absolute;
   left: 50%;
   top: 17vh;
   transform: translateX(-50%);
   font-size: 0.9rem;
   background: var(--update);
   border-radius: 3px;
   padding: 0.6rem 1.5rem;
}

.buttons {
   display: flex;
   gap: 8px;
   padding-top: 10px;
}

.buttons button {
   padding: 0.5rem 0.8rem;
   min-width: 45px;
   cursor: pointer;
   border-radius: 3px;
   border: 1px solid var(--outline-variant);
   /* border: none; */
   background: var(--surface);
   color: var(--color-font);
   font-size: 0.9rem;
   transition: 150ms ease-in-out;
   -webkit-touch-callout: none;
   -webkit-user-select: none;
   -khtml-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   user-select: none;
}

button.active-update {
   opacity: 0.7;
   cursor: default;
}

.buttons button:hover:not(.active-update) {
   border: 1px solid var(--outline);
}

/* .buttons button:last-child:hover {
   background: var(--danger);
   color: var(--color-font-focus);
} */

.buttons div:hover {
   background: var(--cold-blue-focus);
}

.summoner-name {
   display: inline-block;
   font-size: 2.8rem;
   margin: 0;
   font-family: var(--header-font);
}

.summoner-name .tagLine {
   display: inline-block;
   margin: 0;
   font-size: 1.3rem;
   color: var(--color-font-faded);
}

.gradient-bg {
   background: radial-gradient(ellipse at top, rgba(var(--surface-rgb), 0.4), rgba(var(--surface-rgb), 1) 73%), no-repeat -10% 25%/100% url('/public/images/backdrop.webp');
   position: absolute;
   z-index: -5;
   margin-top: 5vh;
   width: inherit;
   height: 400px;
}

.body {
   display: flex;
   justify-content: space-between;
   padding-bottom: 10vh;
}

.section-header {
   border-bottom: 1px solid var(--outline-variant);
   margin-bottom: 20px;
   display: flex;
   align-items: center;
   justify-content: space-between;
}

.section-header .module {
   display: flex;
   gap: 10px;
   /* align-items: baseline; */
   /* border-radius: 3px;
   padding: 0.1rem 0.25rem;
   margin: 0.21rem 0;
   transition: 200ms ease-in-out; */
}

.lhs-body {
   /* width: 260px; */
   flex: 0 0 260px;
}

.section {
   padding-bottom: 5vh;
}

.burger {
   cursor: pointer;
   border-radius: 3px;
   padding: 4px;
   position: relative;
   width: 22px;
   height: 18px;
   transition: all 200ms ease-in-out;
   -webkit-touch-callout: none;
   -webkit-user-select: none;
   -khtml-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   user-select: none;
   transition: background 200ms ease-in-out;
}

.burger:hover {
   background: var(--cold-blue-focus);
}

.burger span {
   position: absolute;
   width: 22px;
   height: 1px;
   background-color: var(--color-font);
   transition: all 100ms ease-in-out;
}

.burger span:nth-child(1) {
   top: 8px;
}

.burger span:nth-child(2),
.burger span:nth-child(3) {
   top: 13px;
}

.burger span:nth-child(4) {
   top: 18px;
}

.section-header .burger:hover {
   background: var(--cold-blue-focus);
}

.module-menu-active span:nth-child(1),
.module-menu-active span:nth-child(4) {
   transform: scale(0);
   top: 13px;
}

.module-menu-active span:nth-child(2) {
   transform: rotate(45deg);
}

.module-menu-active span:nth-child(3) {
   transform: rotate(-45deg);
}

/* .stats-selection {
   width: 300px;
} */

.module-enter-active,
.module-leave-active {
   transition: all 200ms ease-in-out;
   /* transition: max-height 200ms ease-in-out, opacity 300ms; */
}

.module-enter-from,
.module-leave-to {
   /* opacity: 0; */
   max-height: 0px;
}

.module-enter-to,
.module-leave-from {
   /* opacity: 1; */
   max-height: 106px;
}

.module-menu {
   position: absolute;
   z-index: 2;
   overflow: hidden;
   transform: translateY(-21px);
}

.selections {
   width: 242px;
   z-index: 2;
   background: var(--surface-container);
   padding: 0.25rem 0.5rem;
   border-radius: 0 0 3px 3px;
   border: 1px solid var(--outline-variant);
}

.selections div {
   cursor: pointer;
   font-size: 0.9rem;
   margin: 3px 0;
   padding: 0.25rem 0.5rem;
   border-radius: 3px;
   font-weight: 600;
   transition: 200ms ease-in-out;
   -webkit-touch-callout: none;
   -webkit-user-select: none;
   -khtml-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   user-select: none;
}

.selections div:hover {
   background: var(--surface-container-highest);
}

.outer-click {
   position: fixed;
   z-index: 1;
   top: 0;
   left: 0;
   width: 100%;
   height: 100vh;
}

.side-stats h3 {
   margin: 0;
   margin-bottom: 8px;
   padding-left: 0.5rem;
   font-size: 0.8rem;
   font-weight: normal;
}

.side-stats .visual {
   display: flex;
   justify-content: space-between;
   height: 10px;
   width: 100%;
}

.side-stats .details {
   display: flex;
   justify-content: space-between;
   width: 100%;
   font-size: 0.8rem;
   padding-top: 10px;
}

.details .game-count {
   color: var(--color-font-faded);
   padding-left: 3px;
   font-style: italic;
}

.visual span:first-child {
   border-radius: 5px 0 0 5px;
   background: var(--red-side);
}

.visual span:last-child {
   border-radius: 0 5px 5px 0;
   background: var(--blue-side);
}

.rhs-body {
   flex: 0 0 800px;
}

.table-headers {
   position: sticky;
   padding-top: 2vh;
   background: var(--surface);
   top: 0;
   display: flex;
   font-size: 0.8rem;
   z-index: 2;
   align-items: center;
   justify-content: space-between;
   height: 30px;
   border-bottom: 1px solid var(--outline-variant);
   -webkit-touch-callout: none;
   -webkit-user-select: none;
   -khtml-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   user-select: none;
}

.table-headers hr {
   margin-top: -4px;
}

.descending {
   transform: translateY(8px);
}

.champions {
   margin-top: 5px;
}

.utility {
   display: flex;
   align-items: center;
   margin-top: 10px;
}

.utility>*:not(.rhs-utility) {
   margin-bottom: 5px;
}

.utility div:first-child {
   position: relative;
}

.utility .keyboard-shortcut {
   position: absolute;
   z-index: 0;
   left: 8px;
   top: 6px;
   font-size: 0.8rem;
   padding: 0;
   color: var(--color-font-faded);
   pointer-events: none;
}

.keyboard-shortcut kbd {
   display: inline-flex;
   border: 1px solid var(--outline-variant);
   border-radius: 5px;
   font-family: var(--font-main);
   justify-content: center;
   line-height: 0.3rem;
   padding: 6px 5px;
}

.utility input {
   background: var(--surface-container);
   border: 1px solid var(--outline-variant);
   color: var(--color-font);
   padding: .4rem .45rem;
   border-radius: 3px;
   transition: .2s;
}

.utility input:focus {
   outline: none;
   border: 1px solid var(--outline);
}

.utility button {
   padding: 0 1rem;
   margin: 0;
   cursor: pointer;
   border-radius: 3px;
   border: 0;
   margin-right: 10px;
   height: 30px;
   border: 1px solid var(--outline-variant);
   background: var(--surface);
   color: var(--color-font);
   font-size: 0.75rem;
   transition: 150ms ease-in-out;
}

button.active {
   border: 1px solid var(--outline);
   background: var(--surface-container);
}

.utility button:hover {
   border: 1px solid var(--outline);
}

.lhs div,
.rhs div {
   line-height: 30px;
   cursor: pointer;
}

div.ascending {
   border-bottom: 2px solid var(--outline-variant);
}

div.descending {
   line-height: 50px;
}

.table-headers .lhs,
.table-headers .rhs {
   display: flex;
   font-weight: 600;
   gap: 5px;
   justify-content: flex-end;
   height: 100%;
}

.table-headers .rhs div {
   width: 70px;
}

.table-headers .lhs div:first-child {
   margin-left: 29px;
   width: 160px;
}

.table-headers .lhs div:nth-child(2) {
   width: 50px;
}

.table-headers .rhs div:nth-child(1) {
   width: 65px;
   /* KP */
}

.table-headers .rhs div:nth-child(2) {
   width: 40px;
   /* KP */
}

.table-headers .rhs div:nth-child(4) {
   width: 60px;
   /* Taken */
   /* margin-right: 20px; */
}

.table-headers .rhs div:nth-child(6) {
   width: 55px;
   /* Healed */
}

.table-headers .rhs div:nth-child(7) {
   width: 75px;
   /* Ally Healing */
}

.table-headers .rhs div:nth-child(8) {
   margin-left: 5px;
   width: 40px;
   /* Gold */
}

.section-header h2 {
   font-family: 'Thestral';
   font-size: 1.6rem;
   margin: 0;
}

/* circle {
   fill: var(--alpha-07);
   transition: 0.2s cubic-bezier(.25, .52, .64, .84);
}

circle.toggle-all {
   transform: translateX(42%);
   fill: var(--color-font);
} */

.rhs-utility {
   display: flex;
   align-items: center;
   -webkit-touch-callout: none;
   -webkit-user-select: none;
   -khtml-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   user-select: none;
}

.rhs-utility>*:not(.champion-sort) {
   margin-bottom: 5px;
}

.champion-sort {
   font-size: 0.8rem;
   color: var(--color-font-faded);
}

.rhs-utility span {
   font-size: 0.8rem;
   color: var(--color-font-faded);
   transition: color 0.3s cubic-bezier(.25, .52, .64, .84);
}

.champion-sort .superscript {
   text-wrap: nowrap;
   position: absolute;
   transform: translateY(-1.1rem);
   font-size: 0.75rem;
}

.champion-sort button {
   min-width: 100px;
   /* padding: 0; */
   margin-bottom: 5px;
}

.champion-sort-options {
   display: none;
   z-index: 3;
   position: absolute;
   flex-direction: column;
   background: var(--surface);
   padding: 4px 5px;
   border-radius: 3px;
   border: 1px solid var(--outline-variant);
}

.champion-sort-options div {
   display: flex;
   gap: 5px;
}

.champion-sort-options span:first-child {
   width: 85px;
}

.champion-sort-options span:last-child {
   font-size: 0.8rem;
}

.champion-sort-options span {
   padding: 5px 8px;
   cursor: pointer;
   transition: 100ms ease-in-out;
   border-radius: 3px;
   color: var(--color-font);
}

.champion-sort>div:hover .champion-sort-options {
   display: flex;
}

.champion-sort-options span:hover {
   background: var(--surface-container-highest);
   /* padding: 6px 10px;
   cursor: pointer; */
}

.sort-focus {
   color: var(--primary);
}

.asc-des {
   fill: var(--color-font);
   transition: 500ms ease-out;
}

button.asc-des-button {
   padding: 0 5px;
}

span.toggled {
   color: var(--color-font);
}
</style>