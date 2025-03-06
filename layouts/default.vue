<script setup>
</script>

<template>
   <NuxtLoadingIndicator :height="2" :color="'var(--primary)'" />
   <SmallScreen />
   <Notification />
   <Nav />
   <slot />
</template>