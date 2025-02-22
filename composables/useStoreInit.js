import { superStore } from '@/stores/superStore'

export const useStoreInit = async () => {
   const store = superStore()
   store.initPatches()
   store.initItems()
   store.initRunes()
   store.initSpells()
   // await useAsyncData('patches', () => store.initPatches().then(() => true))
   // await useAsyncData('items', () => store.initItems().then(() => true))
   // return await useAsyncData('champions', () => store.initChampion().then(() => true))
   
}
