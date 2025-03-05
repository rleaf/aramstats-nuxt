/* 
   Move summoner search here from Search.vue & NavSearch.vue sometime
*/

// const store = superStore()

// export const useSummonerSearch = async (input, filteredChamps, step, inputRef, regionButtonRef, region) => {
//    if (!input) return
//    if (filteredChamps[step]) {
//       if (filteredChamps[step].back === 'monkeyking') {
//          await navigateTo({ name: 'champions-champion', params: { champion: 'wukong' } })
//       } else {
//          await navigateTo({ name: 'champions-champion', params: { champion: filteredChamps[step].back } })
//       }
//       store.navContainerFocus = false
//       input = ''
//       inputRef.blur()
//       return
//    }

//    if (region === 'RG') {
//       regionButtonRef.classList.add('shake')
//       setTimeout(() => {
//          regionButtonRef.classList.remove('shake')
//       }, 1000)
//       return
//    }

//    const identifiers = input.split('#')
//    let _gameName = identifiers[0]
//    let _tagLine = (identifiers.length === 2) ? identifiers[1] : store.searchRegions[region]
//    await navigateTo({
//       name: `summoner-region-gameName-tagLine`, params: {
//          region: region,
//          gameName: _gameName,
//          tagLine: _tagLine
//       }
//    })

//    store.navContainerFocus = false
//    input = ''
//    inputRef.blur()
// }
