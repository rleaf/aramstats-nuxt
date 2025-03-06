<script setup>
</script>

<template>
   <NuxtLoadingIndicator :height="2" :color="'var(--primary)'" />
   <Header />
   <SmallScreen />
   <Notification />
   <Nav />
   <slot />
</template>