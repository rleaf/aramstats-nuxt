<script setup>
import updates from '~/constants/js/updates'
import version from '~/constants/js/version'
const tab = ref(0)

useSeoMeta({
   title: 'Updates - ARAM Stats',
})

function getImage(fileName) {
   return fileName.includes('imgur.com') ? fileName :
   `/images/${fileName}.webp`
}

</script>

<template>
   <div class="update-main">
      <div class="update-tabs">
         <div @click="tab = 0" :class="{ active: !tab }">Updates</div>
         <div @click="tab = 1" :class="{ active: tab }">Versioning</div>
      </div>
      <div class="updates" v-show="tab === 0">
         <div class="block" v-for="u in updates">
            <div class="header">
               <div>
                  <h2>{{ u.title }}</h2>
                  <h3 v-if="u.version">v{{ u.version }}</h3>
               </div>
               <h3>{{ u.date }}</h3>
            </div>
            <div class="body">

               <p v-for="p in u.body">{{ p }}</p>
               <div class="update-links" v-if="u.links && u.links.length">
                  <h4>Links</h4>
                  <ul>
                     <li v-for="a in u.links"><a :href="a[1]" target="_blank">{{ a[0] }}</a></li>
                  </ul>
               </div>
               <img :src="getImage(u)" alt="" v-for="u in u.img">
               <p class="sub" v-if="u.imgCaption">{{ u.imgCaption }}</p>
            </div>
         </div>
      </div>
      <div class="versioning" v-show="tab === 1">
         <div class="block" v-for="v in version">
            <div class="header">
               <h2>{{ v.version }}</h2>
               <h3>{{ v.date }}</h3>
            </div>
            <div class="body">
               <div class="notes" v-if="v.notes && v.notes.length">
                  <p>
                     {{ v.notes }}
                  </p>
               </div>
               <div v-if="v.add && v.add.length">
                  <h4>Added</h4>
                  <ul>
                     <li v-for="a in v.add">{{ a }}</li>
                  </ul>
               </div>
               <div v-if="v.remove && v.remove.length">
                  <h4>Removed</h4>
                  <ul>
                     <li v-for="r in v.remove">{{ r }}</li>
                  </ul>
               </div>
               <div v-if="v.fix && v.fix.length">
                  <h4>Fixed</h4>
                  <ul>
                     <li v-for="f in v.fix">{{ f }}</li>
                  </ul>
               </div>
               <div v-if="v.adjust && v.adjust.length">
                  <h4>Adjusted</h4>
                  <ul>
                     <li v-for="a in v.adjust">{{ a }}</li>
                  </ul>
               </div>
               <div v-if="v.known && v.known.length">
                  <h4>Known Issues</h4>
                  <ul>
                     <li v-for="a in v.known">{{ a }}</li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<style scoped>
.notes p {
   color: var(--color-font-faded);
   font-size: 0.93rem;
   line-height: 1.4;
   margin-bottom: 2rem;
}

.body {
   font-size: 0.95rem;
   /* padding-bottom: 6rem; */
}

.body ul {
   color: var(--color-font);
   font-size: 0.9rem;
   margin-top: 0.3rem;
   margin-bottom: 1rem;
   padding-left: 1.8rem;
   list-style-type: disc;
}

h4 {
   color: var(--color-font-focus);
   font-weight: normal;
   margin: 0;
}

.version-header {
   display: flex;
   justify-content: space-between;
   align-items: flex-end;
}

.versioning {
   width: 800px;
}

.update-links {
   text-align: left;
}

.update-links li {
   display: block;
   text-decoration: none;
}

.update-links h4 {
   font-size: 1rem;
}

.update-tabs div {
   padding: 6px 10px;
   font-size: 0.9rem;
   border-radius: 4px;
   border: 1px solid transparent;
   /* background: var(--surface-container); */
   cursor: pointer;
   transition: 0.2s;
   -webkit-touch-callout: none;
   /* iOS Safari */
   -webkit-user-select: none;
   /* Safari */
   -khtml-user-select: none;
   /* Konqueror HTML */
   -moz-user-select: none;
   /* Old versions of Firefox */
   -ms-user-select: none;
   /* Internet Explorer/Edge */
   user-select: none;
   /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}

.update-tabs>div:hover {
   background: var(--surface-container);
}

div.active {
   background: var(--surface-container);
   border: 1px solid var(--outline);
}

.update-tabs {
   display: flex;
   width: 800px;
   gap: 20px;
   padding-bottom: 6vh;
   color: var(--color-font);
}

.update-main {
   display: flex;
   width: 100%;
   flex-direction: column;
   align-items: center;
   padding: 10vh 0;
}

.block {
   width: 800px;
   margin-bottom: 6rem;
}

.block img {
   max-width: 80%;
   display: block;
   margin: 0 auto;
   padding-top: 2rem;
   max-height: 400px;
}

.header {
   display: flex;
   width: 100%;
   justify-content: space-between;
   align-items: flex-end;
   padding-bottom: 0.3rem;
   margin-bottom: 1.25rem;
   border-bottom: 1px solid var(--outline);
}

.header>div {
   display: flex;
   gap: 1rem;
   align-items: flex-end;
}

a {
   color: var(--color-font);
}

h2 {
   font-weight: normal;
   line-height: 1;
   font-size: 1.5rem;
   font-family: var(--header-font);
   text-align: left;
   color: var(--color-font-focus);
   margin-bottom: 0;

}

h3 {
   font-weight: normal;
   font-size: 0.9rem;
   color: var(--color-font-faded);
   margin-bottom: 0;
   font-style: italic;
}

p {
   color: var(--color-font);
   line-height: 1.4;
   text-align: left;
   margin-top: 0rem;
}

p.sub {
   text-align: center;
   font-size: 0.8rem;
   color: var(--color-font-faded);
   margin-top: 10px;
}
</style>
