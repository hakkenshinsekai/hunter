<script setup>
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const currentActiveMenu = ref("");
const isRunningAsExtension = ref(false);

function currentMenu(e) {
    currentActiveMenu.value = e;
}

function isExtension() {
    isRunningAsExtension.value = typeof chrome !== 'undefined' && !!chrome.runtime;
}
</script>

<template>
    <aside class="menu menu-limit pl-2">
        <p class="menu-label has-background-black-bis">General</p>
        <ul class="menu-list">
            <li class="has-background-black-ter"><RouterLink to="/logs" class="has-text-centered is-uppercase" :class="{'is-active': currentActiveMenu == 'logs'}"  @click="currentMenu('logs')">Logs</RouterLink></li>
        </ul>
        <p class="menu-label has-background-black-bis">Xpath</p>
        <ul class="menu-list">
            <li class="has-background-black-ter"><RouterLink to="/hunt" class="has-text-centered is-uppercase" :class="{'is-active': currentActiveMenu == 'hunt'}"  @click="currentMenu('hunt')">Hunt</RouterLink></li>
        </ul>
        <!-- <p class="menu-label has-background-black-bis">Automation</p>
        <ul class="menu-list disabled">
            <li class="has-background-black-ter"><a class="has-text-centered is-uppercase">Auto</a></li>
        </ul> -->
    </aside>
</template>

<style scoped>
.menu-limit {
    width: auto;
}
</style>
