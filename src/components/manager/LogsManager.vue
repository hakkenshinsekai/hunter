<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import HunterTable from '../utils/HunterTable.vue';
import { getHunterLogger } from '@/core/database/singleton/singletons';
import HunterModalDetail from '../utils/HunterModalDetail.vue';

const logger = getHunterLogger();

let showModalDetail = ref(false);
let modalDetailData = ref({});

let columns = [
  'Id', 'Log', 'Updated'
];

let actions = [
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
      await logger.logClearTable();
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
  data.value = await logger.paginate(0, limit.value);
  totalItems.value = await logger.totalCount();
  loading.value = false;
}

onMounted(() => {loading.value = false;});

async function paginate(page, limit) {
  let offset = (page - 1) * limit
  let res = await logger.paginate(offset, limit);
  totalItems.value = totalItems.value = await logger.totalCount();
  return res;
}

async function dataSearch(term) {
  let res = await logger.search(term, limit.value);
  totalItems.value = res.length
  return res;
}

async function modalDetail(visible, data) {
  showModalDetail.value = visible;
  modalDetailData.value = data;
}

</script>

<template>
  <div class="skeleton-block" v-if="loading">
    loading...
  </div>
  <HunterTable v-else :columns="columns" :actions="actions" :data="data" :totalItems="totalItems" :limit="limit" :dataRequest="paginate" :dataSearch="dataSearch" :globalButtons="globalButtons" />
  <HunterModalDetail :obj="modalDetailData" v-model:visible="showModalDetail" />
</template>
