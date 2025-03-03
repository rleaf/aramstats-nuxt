<script setup>

</script>

<template>
   <NuxtLoadingIndicator :height="2" :color="'var(--primary)'" />
   <Notification />
   <Nav />
   <slot />
</template>