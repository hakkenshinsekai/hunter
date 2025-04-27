<script setup lang="ts">
import { ModalButons } from '@/core/database/model/ModalButons';
import { onMounted, ref, watch } from 'vue';

interface Props {
    obj: any
    visible: boolean,
    buttons?: ModalButons[] | any[]
}

const props = defineProps<Props>();

const emit = defineEmits(['update:visible']);

let visible = ref(false);

onMounted(async () => {
    await init();
});


async function init() {
    visible.value = props.visible;
}

async function close() {
    visible.value = false;
    emit("update:visible", false);
}

watch(() => props.visible, async (newValue) => {
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
                <p class="modal-card-title">Detail</p>
                <button class="delete" aria-label="close" @click="close"></button>
            </header>
            <section class="modal-card-body">
                <div class="box">
                    <div class="field" v-for="([k, value], index) in Object.entries(obj)">
                        <label class="label">{{ k }}</label>
                        <div class="control">
                            <textarea class="textarea" placeholder="No content">{{ value }}</textarea>
                        </div>
                    </div>
                </div>
            </section>
            <footer class="modal-card-foot">
                <div class="buttons">
                    <button class="button" aria-label="close" @click="close"> Close </button>
                </div>
            </footer>
        </div>
    </div>
</template>