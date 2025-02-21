import { superStore } from '@/stores/superStore'

export const useStoreInit = async () => {
   const store = superStore()
   return await useAsyncData('patches', () => store.initPatches().then(() => true))
   // await useAsyncData('items', () => store.initItems().then(() => true))
   // onMounted(async () => {

   // })
}
