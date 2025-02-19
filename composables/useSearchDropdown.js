import { superStore } from "@/stores/superStore";
export const useSearchDropdown = (step, filteredChamps, input, inputRef, championsRef) => {
   const store = superStore()

   window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'k') {
         e.preventDefault()
         input.value = ''
         inputRef.value.focus()
         return
      }

      if (!(e.key === 'ArrowDown' || e.key === 'ArrowUp') || !store.navContainerFocus) return
      e.preventDefault()
      if (filteredChamps.value.length) {
         if (!championsRef.value.children || !championsRef.value.children[step.value]) step.value = -1
         if (step.value !== -1) championsRef.value.children[step.value].classList.remove('active')

         if (e.key === 'ArrowDown') {
            if (championsRef.value.children[step.value + 1]) {
               step.value++
            } else {
               step.value = 0
               championsRef.value.children[step.value]
            }
         }

         if (e.key === 'ArrowUp') {
            if (championsRef.value.children[step.value - 1]) {
               step.value--
            } else {
               step.value = filteredChamps.value.length - 1
               championsRef.value.children[filteredChamps.value.length - 1]
            }
         }

         if (step.value !== -1) championsRef.value.children[step.value].classList.add('active')
      }
   })

   return step.value

}