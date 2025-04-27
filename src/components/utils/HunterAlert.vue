<script setup lang="ts">
interface Props {
  title: string,
  message: string,
  visible: boolean,
}

const props = defineProps<Props>();

const emit = defineEmits(['update:visible']);

async function closeAlert() {
  emit('update:visible', false);
}
</script>

<template>
  <transition name="fade">
    <div v-show="props.visible" class="floating-alert">
      <article class="message">
        <div class="message-header">
          <p class="has-text-centered">{{ props.title }}</p>
          <button class="delete" aria-label="delete" @click="closeAlert"></button>
        </div>
        <div class="message-body has-text-centered">
          {{ props.message }}
        </div>
      </article>
    </div>
  </transition>
</template>

<style scoped>
.floating-alert {
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  z-index: 9999;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>