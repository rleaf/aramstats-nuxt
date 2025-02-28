<script setup>

const props = defineProps(['data'])

const book = ref({
   101105: ['No hiding', 'Kill enemies near one of their own turrets in ARAM'],
   101204: ['Free Money', 'Kill minions in ARAM	'],
   101205: ['Free Ticket to Base', 'Successfully Execute to the outer tower before 10 minutes in ARAM'],
   101206: ['Pop Goes the Poro', 'Cause a Poro to explode in ARAM'],
   101306: [`Can't Touch This`, 'Win ARAM games without being killed by an enemy champion (you can still be executed)'],
   101201: ['Another Day, Another Bullseye', 'Hit skillshots (ranged untargeted abilities) on champions in ARAM'],
   101203: ['Snow Day', 'Hit snowballs on champions in ARAM'], 
   101000: ['Aram Authority', 'Earn points from challenges in the ARAM Warrior, ARAM Finesse, and ARAM Champion groups'],
   101100: ['Aram Warrior', 'Earn points from challenges in the ARAM Warrior group'],
   101200: ['Aram Finesse', 'Earn points from challenges in the ARAM Finesse group'],
   101300: ['Aram Champion', 'Earn points from challenges in the ARAM Champion group'],
   101103: ['Aram Legend', 'Go Legendary in ARAM games'],
   101106: ['ARAM Eradication', 'Get Pentakills in ARAM'],
   101301: [`All Random All Champions`, 'Earn an S- grade or higher on different champions in ARAM'],
   101305: ['Active Participant', 'Have over 90% Kill Participation in ARAM games'],
   101302: ['All Random All Flawless', 'Earn S grades or higher in ARAM'],
   101104: ['Bad Medicine', 'Kill opponents who recently received a health pack in ARAM'],
   101107: ['Farm Champs Not Minions', 'Get Takedowns in ARAM'],
   101303: ['Rapid Demolition', 'Take the first turret in ARAM before five minutes have passed'],
   101101: ['DPS Threat', 'Deal more than 1800 Damage Per Minute in ARAM games'],
   101102: ['Double Decimation', 'Get two Pentakills in a single ARAM game'],
   101304: ['Lightning Round', 'Win ARAM games before 10 minutes have passed'],
   101108: ['Solo Carry', `Deal 40% or more of your team's damage to champions in ARAM`],
   101307: ['NA-RAM', 'Win ARAM Games'],
   101202: ['It was a... Near-Hit', 'Dodge skillshots (ranged untargeted abilities) in ARAM']
})

</script>

<template>
   <div class="challenge-main" v-for="c, i in props.data" :key="i" :class="{ 'o': i % 2 === 0 }">
      <img :src="`/challenge_icons/${c.challengeId}-${c.level}.webp`" alt="">
      <div>
         <div class="challenge-header">
            <div>{{ book[c.challengeId][0] }}</div>
            <div class="date">
               {{ new Date(c.achievedTime).toLocaleString().split(/[ ,]+/)[0] }}
            </div>
         </div>
         <div class="body">
            {{ book[c.challengeId][1] }} <br>
            <i>You are in the top {{ Math.round((c.percentile * 1000)) / 10 }}%</i>
         </div>
      </div>
   </div>
</template>

<style scoped>
.challenge-main {
   display: flex;
   gap: 10px;
   align-items: center;
   border-radius: 3px;
   padding: 0.7rem 0.25rem;
   font-size: 0.8rem;
}

.o {
   background: var(--surface-container);
}

.challenge-main img {
   width: 34px;
}

.challenge-main > div {
   width: 100%;
}
.challenge-header {
   display: flex;
   width: 100%;
   justify-content: space-between;
   margin-bottom: 5px;
}

.body {
   display: block;
   margin-top: 0px;
   /* font-style: italic; */
   font-size: 0.75rem;
   color: var(--color-font-faded);
}
</style> 