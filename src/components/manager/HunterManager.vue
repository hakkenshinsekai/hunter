<script setup>
import { RouterView } from 'vue-router';
import AsideHuntMenu from './AsideHuntMenu.vue';
import NavHunter from '../NavHunter.vue';
</script>

<template>
    <header>
        <NavHunter :showSettings="false"/>
    </header>
    <div class="columns is-fullheight pt-2">
        <div class="column is-1 is-sidebar-menu is-hidden-mobile">
            <AsideHuntMenu />
        </div>
        <main class="column m-3 is-four-fifths">
            <div class="box">
                <RouterView />
            </div>
        </main>
    </div>
</template>
