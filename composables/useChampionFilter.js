import { superStore } from "@/stores/superStore";

export const useChampionFilter = (step, input) => {
   const store = superStore()
   const filteredChamps = computed(() => {
      if (!input.value) {
         step.value = -1
         return 0
      }
      return store.idToRoute.filter(champ => champ.front.toLowerCase().startsWith(input.value.toLowerCase())).slice(0, 5)
   })
   return filteredChamps
}