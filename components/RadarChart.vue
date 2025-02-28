<script setup>
import * as echarts from 'echarts'
import { championNames } from '~/constants/championNames';

const tally = reactive({ //reactive()?
      'Mage': 0,
      'Marksman': 0,
      'Specialist': 0,
      'Controller': 0,
      'Tank': 0,
      'Fighter': 0,
      'Slayer': 0,
})
const option = reactive({})
const ceiling = ref(0)

const props = defineProps(['data'])
const { data } = toRefs(props) //maybe don't neeed?
const chart = useTemplateRef('chart')

onMounted(() => {
   processData()
   initChart()
})

function processData() {
   for (const c of data.value) {
      for (const v of championNames[c.championId][2]) {
         switch (v) {
            case 'Enchanter':
            case 'Catcher':
               tally['Controller']++
               break
            case 'Juggernaut':
            case 'Diver':
               tally['Fighter']++
               break
            case 'Mage':
            case 'Burst':
            case 'Battlemage':
            case 'Artillery':
               tally['Mage']++
               break
            case 'Marksman':
               tally['Marksman']++
               break
            case 'Assassin':
            case 'Skirmisher':
               tally['Slayer']++
               break
            case 'Vanguard':
            case 'Warden':
               tally['Tank']++
               break
            case 'Specialist':
               tally['Specialist']++
               break
         }
      }
   }

   ceiling.value = Math.max(...Object.values(tally)) + 1
}

function initChart() {
   const myChart = echarts.init(chart.value, null, { renderer: 'svg' });
   const option = {
      tooltip: {
         show: false,
         formatter: () => { 
            return 'tooltip here'
         },
         textStyle: {
            fontSize: 12
         }
      },
      radar: {
         center: ['50%', '55%'],
         indicator: [
            { name: 'Mage', max: ceiling.value },
            { name: 'Marksman', max: ceiling.value },
            { name: 'Specialist', max: ceiling.value },
            { name: 'Controller', max: ceiling.value },
            { name: 'Tank', max: ceiling.value },
            { name: 'Fighter', max: ceiling.value },
            { name: 'Slayer', max: ceiling.value },
         ],
         // shape: 'circle',
         splitNumber: 5,
         axisName: {
            color: 'var(--color-font)',
            formatter: (value) => `{${value}|}\n${value}`,
            rich: {
               'Controller': {
                  height: 25,
                  width: 25,
                  lineHeight: 22,
                  align: 'center',
                  backgroundColor: {
                     image: '/class_images/Controller_icon.webp'
                  },
               },
               'Fighter': {
                  height: 22,
                  width: 22,
                  lineHeight: 30,
                  align: 'center',
                  backgroundColor: {
                     image: '/class_images/Fighter_icon.webp'
                  },
               },
               'Mage': {
                  height: 22,
                  width: 22,
                  align: 'center',
                  lineHeight: 30,
                  backgroundColor: {
                     image: '/class_images/Mage_icon.webp'
                  },
               },
               'Marksman': {
                  height: 22,
                  width: 22,
                  align: 'center',
                  lineHeight: 30,
                  backgroundColor: {
                     image: '/class_images/Marksman_icon.webp'
                  },
               },
               'Slayer': {
                  height: 22,
                  width: 22,
                  align: 'center',
                  lineHeight: 30,
                  backgroundColor: {
                     image: '/class_images/Slayer_icon.webp'
                  },
               },
               'Tank': {
                  height: 20,
                  width: 20,
                  lineHeight: 23,
                  align: 'center',
                  backgroundColor: {
                     image: '/class_images/Tank_icon.webp'
                  },
               },
               'Specialist': {
                  height: 22,
                  width: 22,
                  lineHeight: 30,
                  align: 'center',
                  backgroundColor: {
                     image: '/class_images/Specialist_icon.webp'
                  },
               },
            },
         },
         splitLine: {
            lineStyle: {
               color: [
                  'rgba(var(--secondary-rgb), 0.3)',
               ]
            }
         },
         splitArea: {
            show: false
         },
         axisLine: {
            lineStyle: {
            color: 'rgba(var(--secondary-rgb), 0.3)'
            }
         }
      },
      series: [
         {
            name: 'Roles',
            type: 'radar',
            lineStyle: { width: 1, opacity: 1},
            data: [Object.values(tally)],
            symbol: 'none',
            itemStyle: {
            color: 'var(--primary)' // ice blue
            },
            areaStyle: {
               opacity: 0.25
            },
            tooltip: {}
         },
      ]
   }

   myChart.setOption(option);
}

</script>

<template>
   <div ref="chart" class="radar-chart-main"></div>
</template>

<style scoped>
   .radar-chart-main {
      width: 370px;
      height: 280px;
   }
</style>