<script setup>
import MessageService from '@/core/background/MessageService';
import { getInspectorState } from '@/core/database/singleton/singletons';
import { onBeforeMount, ref } from 'vue';

const inspectorState = getInspectorState()
const inspector = ref(false);

onBeforeMount(async () => {
    let obj = await inspectorState.getStatus();
    if (obj != null) {
        inspector.value = obj.state
    } else {
        await inspectorState.changeState(inspector.value)
    }
});

async function inspectorChange(e) {
    if (inspector.value) {
        await inspectorState.changeState(inspector.value)
        MessageService.sendMessage({type: 'inspect', value: true});
    } else {
        await inspectorState.changeState(inspector.value)
        MessageService.sendMessage({type: 'inspect', value: false});
    }
}
</script>

<template>
    <div class="container is-flex is-justify-content-center is-align-items-center">
        <div class="checkboxes m-6">
            <label class="checkbox is-size-4">
                <input id="inspectorHunterShinSekai" type="checkbox" v-model="inspector"  @change="inspectorChange" />
                Inspector
            </label>
        </div>
    </div>
</template>