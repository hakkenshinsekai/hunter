<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import HunterTable from '../utils/HunterTable.vue';
import { getHuntService, getHuntXpathService } from '@/core/database/singleton/singletons';
import { useRouter } from 'vue-router';

const service = getHuntService();
const xpathService = getHuntXpathService();
const route = useRouter();

let columns = [
  'Id', 'Url', 'Html','Updated'
];

let actions = [
  {
    "name": "Open",
    "fn": async (data) => { route.push({name: "xpath", params: {id: data.id }, query: { name: data.url}})},
    "multiple": false
  },
  {
    "name": "Delete",
    "fn": async (data) => { await xpathService.xpathDeleteByHunt(data.id); await service.huntDelete(data.id); await initLoading(); },
    "multiple": true
  }
];

const globalButtons = [
  {
    "type": "clear",
    "fn": async (data) => {
      await xpathService.xpathClearTable();
      await service.huntClearTable();
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

onMounted(() => {loading.value = false;});

async function initLoading() {
  loading.value = true;
  data.value = await service.huntPaginate(0, limit.value);
  totalItems.value = await service.huntTotalCont();
  loading.value = false;
}

async function paginate(page, limit) {
  let offset = (page - 1) * limit
  let res = await service.huntPaginate(offset, limit);
  totalItems.value = totalItems.value = await service.huntTotalCont();
  return res;
}

async function dataSearch(term) {
  let res = await service.huntSearch(term, limit.value);
  totalItems.value = res.length
  return res;
}

</script>

<template>
  <div class="skeleton-block" v-if="loading">
    loading...
  </div>
  <HunterTable v-else :columns="columns" :actions="actions" :data="data" :totalItems="totalItems" :limit="limit" :dataRequest="paginate" :dataSearch="dataSearch" :globalButtons="globalButtons" />
</template>
