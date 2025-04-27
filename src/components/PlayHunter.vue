<script setup>
import { onMounted, ref } from 'vue';
import { getHunterState } from '@/core/database/singleton/singletons.js';

const hunterState = getHunterState();

const currentState = ref(false);
const statusState = ref('Stopped');
const loading = ref(true);

try {
    if (chrome && chrome.runtime) {
        chrome.runtime.onMessage.addListener(async (message, sender, response) => {
            if (message.type === "hunt-stop") {
                statusState.value = 'Stopped';
                currentState.value = false;
            }
        });
    }
} catch (error) { }

onMounted(async () => {
    loading.value = true;
    try {
        if (chrome && chrome.runtime) {
            await chrome.runtime.sendMessage({
                type: "autohunt",
                payload: true,
            });
        }
    } catch (error) { }

    const savedState = await hunterState.getStatus();
    if (savedState?.state === 'Running') {
        statusState.value = 'Running';
        currentState.value = true;
    } else {
        statusState.value = 'Stopped';
        currentState.value = false;
    }

    loading.value = false;
});

async function changeState() {
    const isStarting = statusState.value === 'Stopped';

    statusState.value = isStarting ? 'Running' : 'Stopped';
    currentState.value = isStarting;

    await hunterState.changeState(statusState.value);
    await chrome.runtime.sendMessage({
        type: "autohunt-message",
        payload: isStarting
    });
}
</script>

<template>
    <div v-if="loading" class="skeleton-block">
    </div>
    <div v-else class="container is-flex is-justify-content-center is-align-items-center">
        <button class="button is-white is-large is-centered is-block" @click="changeState">
            {{ statusState }}
        </button>
    </div>
</template>
