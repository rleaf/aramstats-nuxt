<script setup>
import * as echarts from 'echarts'

const selectedYear = ref(new Date().getFullYear())
const chart = ref(null)
const years = ref([])         // the years a user has played through up to the current year
const epochDates = ref([])    // cleaned array containing gameCreation dates of all games
const ceiling = ref(0)        // ceiling for visualMap options
const heatMapData = ref([])

const props = defineProps(['data'])
const chartRef = useTemplateRef('chart-ref')
preprocessData()
generateHeatmapData()

onMounted(() => {
   chart.value = echarts.init(chartRef.value, null, { renderer: 'svg' })
   chart.value.setOption(options.value);
})
   
function selectYear(y) {
   selectedYear.value = y
   chart.value.setOption(options.value)
}

function preprocessData() {
   /**
    * get prerequisite data from this.data to be fed into the chart and component UX.  
   */
   for (const c of props.data) {
      for (const m of c.matches) {
         epochDates.value.push(m.gc)
      }
   }

   epochDates.value.sort((a, b) => a - b)

   const currYear = new Date().getFullYear()
   const oldestYear = new Date(epochDates.value[0]).getFullYear()
   for (let i = oldestYear; i <= currYear; i++) {
      years.value.unshift(i)
   } 

}

function generateHeatmapData() {
   const start = +echarts.time.parse(years.value[years.value.length - 1] + '-01-01')
   const end = +echarts.time.parse(new Date().getFullYear() + 1 + '-01-01')

   for (let time = start; time <= end; time += 86400000) {
      const games = epochDates.value.filter(e => e >= time && e < (time + 86400000)).length
      if (games > ceiling.value) ceiling.value = games
      heatMapData.value.push([
         echarts.time.format(time, '{yyyy}-{MM}-{dd}', false),
         games
      ])
   }
}

const options = computed(() => {
   return {
      textStyle: {
         fontFamily: "var(--font-main), sans-serif",
         fontSize: '0.75rem',
      },
      tooltip: {
         show: true,
         renderMode: 'html',
         transitionDuration: 0,
         padding: [5, 10],
         position: (point, params, dom, rect, size) => {
            return ([point[0] - (dom.offsetWidth / 2), point[1] - dom.offsetHeight - 5])
         },
         formatter: (params) => {
            let o = (params.data[1] === 1) ? `${params.data[1]} game` : `${params.data[1]} games`
            return `${o} on ${new Date(params.data[0]).toDateString()}`
         },
         backgroundColor: 'var(--surface-container)',
         borderWidth: 1,
         borderColor: 'var(--outline-variant)',
         textStyle: {
            fontFamily: 'var(--font-main)',
            fontWeight: 'normal',
            fontSize: 12,
            width: 500,
            color: 'var(--color-font)'
         },
         
      },
      visualMap: {
         min: 0,
         max: ceiling.value,
         inRange: {
            color: [
               'rgba(122, 122, 122, 0.2)', // hmm
               '#adc6ff'
            ]
         },
         show: false
      },
      calendar: {
         top: 20,
         left: 0,
         right: 0,
         cellSize: 'auto',
         range: selectedYear.value,
         itemStyle: {
            borderWidth: 2,
            opacity: 0,
         },
         splitLine: {
            show: false
         },
         yearLabel: { show: false },
         monthLabel: {
            show: true,
            color: 'var(--color-font)',
         },
         dayLabel: { show: false },
      },
      series: {
         type: 'heatmap',
         itemStyle: {
            borderRadius: 2,
         },
         coordinateSystem: 'calendar',
         data: heatMapData.value
      }
   }
})
</script>

<template>
   <div class="heatmap-main">
      <div ref="chart-ref" class="chart">
      </div>
      <div class="chart-util">
         <UXTooltip :align="'right'" :tip="'heatmap'" />
         <div class="year-selection">
            <button
               v-for="year in years"
               :key="year" @click="selectYear(year)"
               :class="{ 'selected-year': year === selectedYear }">{{ year }}</button>
         </div>
      </div>
   </div>
</template>

<style>
   /* Unscoped styles for echarts heatmap */
   .heatmap-main {
      display: flex;
      justify-content: space-between;
      padding-bottom: 6vh;
      height: 120px;
   }
   
   .heatmap-main .chart {
      width: 90%;
      color: var(--color-font);
   }

   .heatmap-main .chart-util {
      display: flex;
      flex-direction: column;
      height: auto;
      flex: 0 0 60px;
      justify-content: space-between;
      align-items: flex-end;
   }
   
   .heatmap-main .year-selection {
      height: 90px;
      overflow-y: scroll;
      overflow-x: hidden;
   }

   .heatmap-main .year-selection button {
      width: 80%;
      padding: 0 0.5rem;
      margin-bottom: 5px;
      cursor: pointer;
      border-radius: 3px;
      border: 0;
      height: 25px;
      background: var(--surface);
      color: var(--color-font);
      font-size: 0.75rem;
      transition: background 150ms ease-in-out;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
   }

   
   .heatmap-main .year-selection button:hover {
      background: var(--surface-container);
   }

   .heatmap-main button.selected-year {
      background: var(--surface-container);
      border: 1px solid var(--outline);
   }

   .heatmap-main .year-selection::-webkit-scrollbar {
      width: 4px;
      background: var(--alpha-01);
      border-radius: 3px;
   }

   .heatmap-main .year-selection::-webkit-scrollbar-thumb {
      background-color: var(--alpha-06);
      border-radius: 3px;
   }
   .heatmap-main .year-selection::-webkit-scrollbar-thumb:hover {
      background-color: var(--light-12);;
   }
</style>