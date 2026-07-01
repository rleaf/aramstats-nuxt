<script setup>
import tooltips from '@/constants/tooltips'

const props = defineProps(['tip', 'align', 'size'])
</script>

<template>
   <div class="tooltip">
      <img :class="props.size" src="/svg/questionping.svg" alt="help">
      <div :class="props.align" class="tip">
         <ul>
            <li v-for="(t, i) in tooltips[props.tip]" :key="i">
               <span v-html="t"></span>
            </li>
         </ul>
      </div>
   </div>
</template>

<style scoped>
.tooltip img {
   cursor: pointer;
   filter: saturate(0.3);
   transition: 200ms;
   z-index: 1;
   -webkit-touch-callout: none; /* iOS Safari */
   -webkit-user-select: none; /* Safari */
   -khtml-user-select: none; /* Konqueror HTML */
   -moz-user-select: none; /* Old versions of Firefox */
   -ms-user-select: none; /* Internet Explorer/Edge */
   user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}

.tooltip img:hover {
   filter: saturate(1);
}

.tooltip {
   position: relative;
   display: inline-block;
   /* height: 16px; */
}

.tooltip:hover .tip {
   visibility: visible;
}

.tip {
   visibility: hidden;
   position: absolute;
   z-index: 10;
   font-size: 0.85rem;
   /* line-height: .85rem; */
   font-style: normal;
   color: var(--color-font);
   /* background: var(--surface-container); */
   background: var(--surface);
   border: 1px solid var(--outline-variant);
   border-radius: 3px;
   padding: 0.2rem 1.5rem;
   width: 400px;
   top: 130%;
   left: 50%;
   margin-left: -150px;
}

.right {
   left: 50%;
   margin-left: -360px;
}

.left {
   left: 50%;
   margin-left: 0;
}

.tip ul {
   padding-left: 1rem;
   list-style-type: none;
   padding: 0;
}

.tip ul li:not(:last-child) { 
   margin-bottom: 0.7rem;  
}

.big {
   /* margin-top: 5px; */
   width: 25px;
   /* height: 25px; */
}
</style>