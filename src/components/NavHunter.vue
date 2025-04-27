<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({showSettings: Boolean = true});

let canUseRoute = ref(true);

onMounted(async () => {
  if (chrome.runtime) {
    canUseRoute.value = false;
  }
});

function goToManager() {
  if (chrome.runtime) {
    chrome.runtime.openOptionsPage();
  }
}

</script>

<template>
    <nav class="navbar lightgrey" role="navigation" aria-label="main navigation" id="nav-template">
      <div class="navbar-brand">
        <RouterLink class="navbar-item" to="/" v-show="canUseRoute">
          HUNTER
        </RouterLink>
        <button class="navbar-item" v-show="!canUseRoute">
          HUNTER
        </button>
      </div>
  
      <div id="navbarMenu" class="navbar-menu is-active">
        <div class="navbar-start">
        </div>
  
        <div class="navbar-end">
          <div class="navbar-item">
            <RouterLink id="gearBtn" to="/manager" class="button" role="button" aria-label="Abrir configurações" v-show="canUseRoute && props.showSettings">
              <span class="icon gear-button">⚙️</span>
            </RouterLink>
            <button id="gearBtn" to="/manager" class="button" role="button" aria-label="Abrir configurações" v-show="!canUseRoute && props.showSettings" @click="goToManager">
              <span class="icon gear-button">⚙️</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  </template>
  


<style scoped>
.gear-button {
    transition: transform 0.3s ease-in-out;
}

.gear-rotate {
    animation: spin 0.5s ease-in-out;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>