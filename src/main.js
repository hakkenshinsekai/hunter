import './assets/bulma.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import HunterPopup from './components/popup/HunterPopup.vue';
import HunterManager from './components/manager/HunterManager.vue';
import LogsManager from './components/manager/LogsManager.vue';
import HuntManager from './components/manager/HuntManager.vue';
import XpathManager from './components/manager/XpathManager.vue';

const routes = [
    {
        'path': "/", component: HunterPopup
    },
    {
        'path': "/manager", component: HunterManager,
        'children': [
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
        ]
    }
];

const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })

createApp(App).use(router).mount('#app')
