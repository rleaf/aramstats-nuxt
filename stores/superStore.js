import { defineStore } from 'pinia'
import { championNames } from '@/constants/championNames'
// import axios from 'axios'

export const superStore = defineStore('super', {
   state() {
      return {
         loading: false,         // Boolean to determine if loading component is active
         champions: [],          // Array of champions for search bars. Initialized in App.vue
         focus: false,           // Boolean to determine if nav search bar is focused.
         notification: '',       // Notifacation message
         patches: null,          // Array of 5 most recent patches
         championCDN: null,      // (CDN) Champion on most recent patch
         items: null,            // (CDN) Items on most recent patch
         runes: null,            // (CDN) Runes on most recent patch
         spells: null,           // (CDN) Summoner Spells on most recent patch
         tooltip: {
            active: false,
            mode: null,
            x: 0,
            y: 0,
            key: null,
            index: null,
            runeTree: null,
            runeRow: null,
         },
         navContainerFocus: false, // Boolean to determine if nav search bar is focused.
         searchRegions: {          // Regions for search bar
            'na': 'NA1',
            'euw': 'EUW',
            'eune': 'EUNE',
            'kr': 'KR1',
            'lan': 'LAN',
            'las': 'LAS',
            'oce': 'OCE',
            'sea': 'SG2',
            'tr': 'TR1',
            'ru': 'RU1',
            'jp': 'JP1',
            'br': 'BR1',
            'vn': 'VN2',
            'tw': 'TW2',
         },
      }
   },
   actions: {
      // Items
      async initItems() {
         if (this.items) return
         if (!this.patches) await this.initPatches()
         try {
            const url = `https://ddragon.leagueoflegends.com/cdn/${this.patches[0]}/data/en_US/item.json`;
            this.items = (await useFetch(url)).data
            this.items = this.items.data // reactivity funk
         } catch (e) {
            if (e instanceof Error) console.log(e)
         }
      },

      // Summoner Spells
      async initSpells() {
         if (this.spells) return
         try {
            // const url = `https://ddragon.leagueoflegends.com/cdn/${this.patches[0]}/data/en_US/summoner.json`
            const url = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-spells.json`
            this.spells = (await useFetch(url)).data
         } catch (e) {
            if (e instanceof Error) console.log(e)
         }
      },

      async getDataDragonChampion(champ) {
         if (this.championCDN) return
         if (!this.patches) await this.initPatches()
         try {
            const url = `https://cdn.communitydragon.org/${this.patches[0]}/champion/${champ}/data.json`;
            ({ data: this.championCDN } = await useFetch(url))
         } catch (e) {
            if (e instanceof Error) console.log(e)
         }
         // return this.championCDN
      },

      async initPatches() {
         if (!this.patches) {
            try {
               const url = 'https://ddragon.leagueoflegends.com/api/versions.json'
               this.patches = (await $fetch(url)).slice(0, 5)
            } catch (e) {
               if (e instanceof Error) console.log(e)
            }
         }
      },

      // Runes
      async initRunes() {
         if (this.runes) return
         if (!this.patches) await this.initPatches()
         try {
            // const url = `https://ddragon.leagueoflegends.com/cdn/${this.patches[0]}/data/en_US/runesReforged.json`
            const url = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perks.json`;
            ({ data: this.runes} = await useFetch(url))
         } catch (e) {
            if (e instanceof Error) console.log(e)
         }
      },

      setNotification(notification, duration) {
         this.notification = notification
         setTimeout(() => this.notification = '', duration || 2000)
      },
      
      setTooltipData(params) {
         this.tooltip.active = true
         this.tooltip.mode = params.mode
         this.tooltip.x = params.event.target.offsetLeft + (params.event.target.offsetWidth / 2)
         this.tooltip.y = params.event.target.offsetTop - (params.event.target.offsetHeight)
         this.tooltip.key = params.key
         this.tooltip.skillIndex = params.skillIndex
         this.tooltip.runeTree = params.runeTree
         this.tooltip.runeRow = params.runeRow
      }
   },

   getters: {
      recentCleanPatch: (state) => {
         if (!state.patches) return
         return state.patches[0].split('.').slice(0, 2).join('.')
      },

      nameToId: () => {
         const ret = {}
         Object.keys(championNames).forEach(k => ret[championNames[k][0].toLowerCase()] = k)
         return ret
      },

      idToRoute: () => {
         const o = []
         for (const champion of Object.values(championNames)) {
            o.push({
               back: (champion === 62) ? 'wukong' : champion[0].toLowerCase(),
               front: champion[1],
               image: champion[0].toLowerCase()
            })
         }
         return o
      }
   }
})