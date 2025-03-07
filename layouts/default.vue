<script setup>
</script>

<template>
   <NuxtLoadingIndicator :height="2" :color="'var(--primary)'" />
   <Header />
   <ClientOnly>
      <SmallScreen />
   </ClientOnly>
   <Notification />
   <Nav />
   <slot />
</template>