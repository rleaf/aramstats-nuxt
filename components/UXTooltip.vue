<script setup>
import tooltips from '@/constants/tooltips'

const props = defineProps(['tip', 'align'])
</script>

<template>
   <div class="tooltip">
      <img src="/svg/information.svg" alt="">
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
   z-index: 1;
   -webkit-touch-callout: none; /* iOS Safari */
   -webkit-user-select: none; /* Safari */
   -khtml-user-select: none; /* Konqueror HTML */
   -moz-user-select: none; /* Old versions of Firefox */
   -ms-user-select: none; /* Internet Explorer/Edge */
   user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}

.tooltip {
   position: relative;
   display: inline-block;
   height: 16px;
}

.tooltip:hover .tip {
   visibility: visible;
}

.tip {
   visibility: hidden;
   position: absolute;
   z-index: 10;
   font-size: 0.8rem;
   line-height: 1.35;
   font-style: normal;
   color: var(--color-font);
   background: var(--surface-container);
   border: 1px solid var(--outline);
   border-radius: 8px;
   padding: 0.2rem 1.5rem;
   width: 300px;
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
</style>