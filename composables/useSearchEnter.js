import { superStore } from "@/stores/superStore";

export const useSearchEnter = async (input, inputRef, region, filteredChamps, step, regionButtonRef) => {
   const store = superStore()
   
   if (!input) return
   if (filteredChamps[step]) {
      await navigateTo({ name: 'champions-champion', params: { champion: filteredChamps[step].back } })
      store.navContainerFocus = false
      input = ''
      inputRef.blur()
      return
   }
   
   if (region === 'RG') {
      regionButtonRef.classList.add('shake')
      setTimeout(() => {
         regionButtonRef.classList.remove('shake')
      }, 1000)
      return
   }

   const identifiers = input.split('#')
   let _gameName = identifiers[0]
   let _tagLine = (identifiers.length === 2) ? identifiers[1] : store.searchRegions[region]
   await navigateTo({
      name: `summoner-region-gameName-tagLine`, params: {
         region: region,
         gameName: _gameName,
         tagLine: _tagLine
      }
   })

   store.navContainerFocus = false
   input = ''
   inputRef.blur()
}