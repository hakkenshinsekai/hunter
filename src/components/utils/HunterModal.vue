<script setup lang="ts">
import { ModalButons } from '@/core/database/model/ModalButons';
import { onMounted, ref, watch } from 'vue';

interface Props {
    title: string,
    message: string,
    visible: boolean,
    buttons?: ModalButons[] | any[]
}

const props = defineProps<Props>();

const emit = defineEmits(['update:visible', 'update:action']);

let visible = ref(false);
let title = ref("");
let message = ref("");

onMounted(async () => {
    await init();
});


async function init() {
    visible.value = props.visible;
    title.value = props.title;
    message.value = props.message;
}

async function close() {
    if (props.buttons && props.buttons.length > 0) {
        emit("update:action", false);
        emit("update:visible", false);
        visible.value = false;
    } else {
        visible.value = false;
        emit("update:visible", false);
    }
}

async function runButtonFn(fn) {
    emit("update:action", true);
    await fn();
    emit("update:visible", false);
}

watch(() => props.visible, async (newValue)=>{
    if (newValue !== undefined) {
        await init();
    }
})
</script>

<template>
    <div class="modal" :class="{ 'is-active': visible }">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">{{ title }}</p>
                <button class="delete" aria-label="close" @click="close"></button>
            </header>
            <section class="modal-card-body">
                <div class="box">
                    <p class="has-text-centered">{{ message }}</p>
                </div>
            </section>
            <footer class="modal-card-foot">
                <div class="buttons">
                    <button v-for="button in props.buttons" class="button is-success" @click="runButtonFn(button.fn)">{{button.title}}</button>
                    <button class="button" aria-label="close" @click="close"> Close </button>
                </div>
            </footer>
        </div>
    </div>
</template>