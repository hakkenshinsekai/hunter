import './assets/bulma.min.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import HunterManager from './components/manager/HunterManager.vue';
import LogsManager from './components/manager/LogsManager.vue';
import HuntManager from './components/manager/HuntManager.vue';
import XpathManager from './components/manager/XpathManager.vue';

const routes = [
    {
        'path': "/logs",
        component: LogsManager
    },
    {
        'path': '/hunt',
        component: HuntManager
    },
    {
        'name': 'xpath',
        'path': '/xpath/:id',
        component: XpathManager
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })


createApp(HunterManager).use(router).mount('#app')
