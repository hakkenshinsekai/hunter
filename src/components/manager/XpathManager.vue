<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import HunterTable from '../utils/HunterTable.vue';
import { getHuntXpathService } from '@/core/database/singleton/singletons';
import { useRoute } from 'vue-router';
import HunterModalDetail from '../utils/HunterModalDetail.vue';

const service = getHuntXpathService();
const route = useRoute()

let showModalDetail = ref(false);
let modalDetailData = ref({});

let columns = [
    'Id', 'Hunt', 'Xpath', 'Content', 'Attributes', 'Updated'
];

let actions = [
    {
        "name": "Delete",
        "fn": async (data) => { await service.xpathDelete(data.id); await initLoading(); },
        "multiple": true
    }, 
    {
        "name": "Detail",
        "fn": async (data) => { await modalDetail(true, data); },
        "multiple": false
    }
];

const globalButtons = [
  {
    "type": "clear",
    "fn": async (data) => {
      await service.xpathDeleteByHunt(route.params.id);
      await initLoading();
    }
  }
];

let loading = ref(true);
let data = ref([]);
let limit = ref(10);
let totalItems = ref(0);

onBeforeMount(async () => {
    await initLoading();
});

async function initLoading() {
    loading.value = true;
    data.value = await service.xpathPaginateByHunt(route.params.id, 0, limit.value);
    totalItems.value = await service.xpathTotalCountByHunt(route.params.id);
    loading.value = false;
}

onMounted(() => { loading.value = false; });

async function paginate(page, limit) {
    let offset = (page - 1) * limit
    let res = await service.xpathPaginateByHunt(route.params.id, offset, limit);
    totalItems.value = totalItems.value = await service.xpathTotalCountByHunt(route.params.id);
    return res;
}

async function dataSearch(term) {
    let res = await service.xpathSearch(term, limit.value);
    totalItems.value = res.length
    return res;
}

async function modalDetail(visible, data) {
  showModalDetail.value = visible;
  modalDetailData.value = data;
}

</script>

<template>
    <div class="block" v-show="route.query.name">
        <h1 class="title is-4">{{ route.query.name }}</h1>
    </div>
    <div class="skeleton-block" v-if="loading">
        loading...
    </div>
    <HunterTable v-else :columns="columns" :data="data" :actions="actions" :totalItems="totalItems" :limit="limit" :dataRequest="paginate"
        :dataSearch="dataSearch" :breadcrumb="['hunt', 'xpath']" :globalButtons="globalButtons" />
    <HunterModalDetail :obj="modalDetailData" v-model:visible="showModalDetail" />
</template>
