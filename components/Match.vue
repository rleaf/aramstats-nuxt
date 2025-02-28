<script setup>
const date = ref(Number)
const daysSince = ref(Number)
const props = defineProps(['data', 'patch', 'newPatch'])

onMounted(() => {
   computeTime()
})

function computeTime() {
   date.value = new Date(props.data.gc)
   const now = Date.now()
   const diffTime = Math.abs(date.value - now)
   daysSince.value = Math.round(diffTime / (1000 * 60 * 60 * 24))
   date.value = date.value.toLocaleString().split(/[ ,]+/)[0]
}

function perMinute(v) {
   return Math.round(v / props.data.gd)
}

const gameDuration = computed(() => {
   if (Number.isInteger(props.data.gd)) {
      return `${props.data.gd}m`
   } else {
      let x = props.data.gd.toString().split('.')
      x[1] = Math.floor((+`.${x[1]}` * 60))
      return `${x[0]}m ${x[1]}s`
   }
})
</script>

<template>
   <div class="match-main">
      <span v-if="props.newPatch">
         <p class="patch-change">
            {{ props.data.gv.split('.').slice(0, 2).join('.') }}
         </p>
      </span>
      <span v-else>
         <hr>
      </span>
      <div class="match-details" :class="(props.data.w ? 'win' : 'loss')">
         <div class="time">
            <div class="date">
               {{ date }}
            </div>
            <div class="delta">
               {{ gameDuration }}
            </div>
         </div>
         <div class="runes">
            <img :src="`/runes/${props.data.pr}.png`" alt="">
            <img :src="`/runes/${props.data.sr}.png`" alt="">
         </div>
         <div class="items">
            <div v-for="item in props.data.i"> 
               <img :src="`https://ddragon.leagueoflegends.com/cdn/${props.patch}/img/item/${item}.png`" alt="">
            </div>
         </div>
         <div class="match-rhs">
            <div> <!-------- KDA ratio ----------->
               {{ `${props.data.k}/${props.data.d}/${props.data.a}` }}
               <span class="sub">
                  {{ `${((props.data.k + props.data.a) / props.data.d).toFixed(2)}` }}
               </span>
            </div>
            <div> <!-------- KP ------------>
               {{ Math.round(props.data.kp * 100) }}%
            </div>
            <div> <!-------- Damage -------->
               {{ props.data.t.dtc }}
               <span class="sub">
                  {{ perMinute(props.data.t.dtc) }}
               </span>
            </div>
            <div> <!-------- Taken --------->
               {{ props.data.t.dt }}
               <span class="sub">
                  {{ perMinute(props.data.t.dt) }}
               </span>
            </div>
            <div> <!-------- Mitigated ----->
               {{ props.data.t.sm }}
               <span class="sub">
                  {{ perMinute(props.data.t.sm) }}
               </span>
            </div>
            <div> <!-------- Healed -------->
               {{ props.data.t.h }}
               <span class="sub">
                  {{ perMinute(props.data.t.h) }}
               </span>
            </div>
            <div> <!-------- Ally Healing -->
               {{ props.data.t.ah }}
               <span class="sub">
                  {{ perMinute(props.data.t.ah) }}
               </span>
            </div>
            <div> <!-------- Gold ---------->
               {{ props.data.t.g }}
               <span class="sub">
                  {{ perMinute(props.data.t.g) }}
               </span>
            </div>
         </div>
      </div>
   </div>
</template>

<style scoped>
   .match-main {
      display: flex;
      align-items: center;
      gap: 16px;
   }

   .match-main > span {
      width: 13px;
   }

   .patch-change {
      transform: rotate(-40deg);
      transform-origin: 100% 50%;
      font-size: 0.7rem;
      color: var(--color-font-faded);
      margin: 0;
   }

   hr {
      min-height: 39px;
      width: 1px;
      border: none;
      background-color: var(--outline-variant);
      margin: 0;
      margin-left: 12px;
   }

   .match-details {
      display: flex;
      margin-bottom: 2px;
      min-height: 37px;
      align-items: center;
      width: 100%;
      font-size: 0.75rem;
      border-radius: 3px;
   }

   .win {
      background: linear-gradient(to right, var(--win) 0%, transparent);
   }
   
   .loss {
      background: linear-gradient(to right, var(--loss) 0%, transparent);
   }

   .time {
      padding-left: 10px;
      width: 55px;
      font-size: 0.7rem;
   }

   .runes {
      width: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
      align-items: flex-end;
   }

   .runes img:first-child {
      width: 21px;
      filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.8));
   }

   .runes img:last-child {
      margin-left: -10px;
      filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 1)) saturate(1.5);
      width: 13px;
   }

   .time .delta {
      color: var(--color-font-faded);
   }

   .items {
      display: flex;
      height: 22px;
      min-width: 144px;
      padding-right: 15px;
   }

   .items div {
      width: 22px;
      height: 22px;
      background: rgba(122, 122, 122, 0.2);
      margin-left: 2px;
      border-radius: 3px;
      overflow: hidden;
   }

   .items img {
      width: 22px;
   }

   .match-rhs {
      display: flex;
      align-items: center;
      gap: 5px;
      justify-content: flex-end;
   }

   .match-rhs div span {
      display: block;
      font-size: 0.7rem;
      font-style: italic ;
      color: var(--color-font-faded);
   }

   .match-rhs div:nth-child(1) {
      width: 65px; /* KDA */
   }

   .match-rhs div:nth-child(2) {
      width: 40px; /* KP */
   }

   .match-rhs div:nth-child(3) {
      width: 70px; /* Damage */
   }

   .match-rhs div:nth-child(4) {
      width: 60px; /* Taken */
   }

   .match-rhs div:nth-child(5) {
      width: 70px; /* Mitigated */
   }

   .match-rhs div:nth-child(6) {
      width: 55px; /* Healed */
   }

   .match-rhs div:nth-child(7) {
      width: 75px; /* Ally Healing */
   }

   .match-rhs div:nth-child(8) {
      margin-left: 5px;
      width: 40px; /* Gold */
   }
</style>