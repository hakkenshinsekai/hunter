<script setup>
import { getHunterLogger } from '@/core/database/singleton/singletons';
import { onMounted, ref } from 'vue';

const notifications = ref([]);
const loading = ref(true);
const logService = getHunterLogger();

async function loadLogs() {
    let logs = await logService.paginate(0, 10);
    notifications.value = logs;
    if (notifications.value.length > 10) {
        notifications.value.splice(0, notifications.value.length - 10);
    }
}

onMounted(async () => {
    loading.value = false;
    await loadLogs();

    setInterval(async () => {
        await loadLogs();
    }, 1000)
});

</script>

<template>
    <div class="container">
        <div class="notification">
            <div class="scroll-box container limit-width">
                <ul :class="{ 'skeleton-block': loading, 'content': !loading }">
                    <li class="pb-2 pt-2" v-for="(notification, i) in notifications" :key="i" v-show="!loading">
                        <span>{{ notification.log }}</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style scoped>
ul {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}
.limit-width {
    max-width: 100%;
}
.scroll-box {
    width: 100%;
    max-height: 230px;
    overflow-y: auto;
    padding-right: 8px;
    border: 1px solid #dbdbdb;
    border-radius: 6px;
    background-color: #f9f9f9;
}

.scroll-box::-webkit-scrollbar {
    width: 6px;
}

.scroll-box::-webkit-scrollbar-track {
    background: transparent;
}

.scroll-box::-webkit-scrollbar-thumb {
    background-color: rgba(176, 176, 176, 0.4);
    border-radius: 6px;
}

.scroll-box::-webkit-scrollbar-thumb:hover {
    background-color: rgba(136, 136, 136, 0.5);
}


.scroll-box::-webkit-scrollbar-button {
    display: none;
    height: 0;
    width: 0;
}

.scroll-box {
    scrollbar-width: thin;
    scrollbar-color: rgba(176, 176, 176, 0.4) transparent;
}
</style>
