<script setup lang="ts">
import { TableActions } from '@/core/database/model/TableActions';
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router';
import HunterModal from './HunterModal.vue';
import { watchOnce } from '@/core/events/watchOnce';
import HunterAlert from './HunterAlert.vue';

let loading = ref(true);
let inputSearchFocus = ref(false);
let showModal = ref(false);
let showGlobal = ref(false);
let showSearch = ref(false);
let showActions = ref(false);
let modalActionConfirm = ref(false);
let modalText = ref("");
let modalTitle = ref("");
let modalButtons = ref([]);
let totalPages = ref(0);
let paginateNav = ref([])
let currentPage = ref(1);
let showCurrentItems = ref(0);
let selectedRows = ref([]);
let isAllSelected = ref(false);
let alert = ref({visible: false, title: '', message: ''});

const route = useRouter();

interface Props {
  columns: any[]
  actions?: TableActions[] | any[]
  breadcrumb?: string[]
  data: any[]
  globalButtons: any[]
  totalItems: number
  limit: number
  dataRequest?: (page: number, limit: number) => Promise<any>
  dataSearch?: (term: string) => Promise<any>
}

const props = defineProps<Props>();

onMounted(async () => {
  if (props.actions) {
    showActions.value = true;
    if (!props.columns.includes("Actions")) {
      props.columns.push("Actions");
    }
  }
  if (props.globalButtons && props.globalButtons.length > 0) {
    showGlobal.value = true;
    props.globalButtons.forEach(element => {
      let title = element.type === "clear" ? 'Confirm' : 'Submit'
      modalButtons.value.push({
        title: title,
        fn:  element.fn
      })
    });
  }
  updatePaginationNav();
  if (props.dataSearch && props.dataRequest) {
    showSearch.value = true;
  } else {
    showSearch.value = false;
  }
  setLoadingState(false);
});

async function loadDataRequest() {
  if (props.dataRequest) {
    setLoadingState(true);
    let res = await props.dataRequest(currentPage.value, props.limit);
    props.data.splice(0, props.data.length, ...res);
    setLoadingState(false);
  }
}

function updatePaginationNav() {
  if (props.totalItems) {
    totalPages.value = Math.max(1, Math.ceil(props.totalItems / props.limit));
  }
  paginateNav.value = Array.from({ length: totalPages.value }, (_, i) => i + 1);
  currentPageItems();
}

async function changePage(page) {
  if (page <= 0) {
    page = 1;
  } else if (page >= totalPages.value) {
    page = totalPages.value;
  }
  currentPage.value = page;
  await loadDataRequest();
  currentPageItems();
}

watch(() => props.totalItems, (newValue) => {
  if (newValue > 0) {
    updatePaginationNav();
  }
});

function currentPageItems() {
  const offset = currentPage.value * props.limit;
  showCurrentItems.value = Math.min(offset, props.totalItems);
}

function copyToClipboard(el, content) {
  el.target.focus()
  navigator.clipboard.writeText(normalize(content)).then(() => {
    alert.value.visible = true;
    alert.value.title = 'Clipboard';
    alert.value.message = 'Content copied!';
    setTimeout(() => {
      alert.value.visible = false;
      alert.value.title = '';
      alert.value.message = '';
    }, 2000);
  }).catch(err => {
    alert.value.visible = true;
    alert.value.title = 'Clipboard';
    alert.value.message = 'Error on copy content!';
    setTimeout(() => {
      alert.value.visible = false;
      alert.value.title = '';
      alert.value.message = '';
    }, 2000);
  });
}

function setLoadingState(bool) {
  loading.value = bool;
}

function searchFocus(state) {
  inputSearchFocus.value = state;
}

async function actionExec(data, fn, all) {
  if (selectedRows.value && selectedRows.value.length > 0 && (all != undefined && all === true)) {
    selectedRows.value.forEach(async (elem) => {
      await fn(elem);
    });
  } else {
    await fn(data);
  }
}

async function goBack() {
  route.back();
}

function normalize(str) {
  return String(str).replace(/%20/g, ' ');
}

async function searchTerm(e) {
  if (props.dataSearch && props.dataRequest) {
    let term = e.target.value;
    if (term && term.length > 1) {
      setLoadingState(true);
      let searchResult = await props.dataSearch(term);
      props.data.splice(0, props.data.length, ...searchResult);
      currentPageItems();
      updatePaginationNav();
      setLoadingState(false);
    } else {
      await loadDataRequest();
      currentPageItems();
      updatePaginationNav();
    }
  }
}

function selectAll(e) {
  isAllSelected.value = e.target.checked;
  if (isAllSelected.value) {
    selectedRows.value = [...props.data];
  } else {
    selectedRows.value = [];
  }
}

async function globalAction(type: string) {
  if (type) {
    let globalAction = props.globalButtons.find((obj) => obj.type === type);
    if (globalAction) {
      modal(true, 'Confirm', 'Do you want to delete all entries?')
      watchOnce(modalActionConfirm, async (res) => {
        if (res) {
          await globalAction.fn();
        }
      }, 60000);
    }
  }
}

async function modal(visible: boolean, title:string, message:string) {
  showModal.value = visible;
  modalText.value = message;
  modalTitle.value = title;

}

watch(selectedRows, (newSelectedRows) => {
  if (newSelectedRows.length === props.data.length) {
    isAllSelected.value = true;
  } else {
    isAllSelected.value = false;
  }
});

</script>

<template>
  <HunterAlert :title="alert.title" :message="alert.message" v-bind:visible="alert.visible" />
  <nav class="breadcrumb" aria-label="breadcrumbs" v-if="breadcrumb">
    <ul>
      <li v-for="str in breadcrumb" :class="{ 'is-active': breadcrumb[breadcrumb.length - 1] == str }">
        <a @click="goBack">{{ str }}</a>
      </li>
    </ul>
  </nav>
  <div class="columns" v-show="showGlobal">
    <div class="column is-half">
      <div class="field">
        <label class="label">Global actions</label>
        <div class="control has-icons-left has-icons-right">
          <button class="button" @click="globalAction('clear')">Clear Table</button>
        </div>
      </div>
    </div>
  </div>
  <div class="columns" v-show="showSearch">
    <div class="column is-half">
      <div class="field">
        <label class="label">Search</label>
        <div class="control" :class="{ 'is-loading': loading }">
          <input class="input medium" :class="{ 'is-focused': inputSearchFocus }" type="text" placeholder="Search"
            @input="searchTerm" @focusin="searchFocus(true)" @focusout="searchFocus(false)" />
        </div>
      </div>
    </div>

  </div>
  <HunterModal :title="modalTitle" :message="modalText" :buttons="modalButtons" v-model:visible="showModal" v-model:action="modalActionConfirm" />
  <div>
    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th v-show="showActions" class="has-text-centered">
            <input type="checkbox" class="icon" @change="selectAll" :checked="isAllSelected" />
          </th>
          <th v-for="(column, i) in props.columns" :key="i"
            :colspan="i === props.columns.length - 1 ? props.columns.length : 1">{{ column }}</th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <th>Showing {{ showCurrentItems }} of {{ props.totalItems }}</th>
        </tr>
      </tfoot>
      <tbody v-if="loading">
        <tr>
          <td colspan="3" class="has-text-centered">
            <span class="icon is-large">
              <i class="fas fa-spinner fa-pulse fa-2x"></i>
            </span>
            <br />
            Loading data...
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="obj in props.data">
          <td v-show="showActions" class="has-text-centered">
            <input type="checkbox" class="icon" v-model="selectedRows" :value="obj" />
          </td>
          <td v-for="([k, value], index) in Object.entries(obj)" :key="index" @click="copyToClipboard($event, value)">
            <button class="button is-small is-text has-tooltip-arrow has-tooltip-right">
              <span class="icon is-small has-text-info" style="opacity: 0.6;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    d="M16 2H8c-1.1 0-1.99.9-1.99 2L6 18c0 1.1.89 2 1.99 2H16c1.1 0 1.99-.9 1.99-2V4c0-1.1-.89-2-1.99-2zM8 4h8v14H8V4z" />
                </svg>
              </span>
              <span class="tooltip is-tooltip-right">Copy</span>
            </button>
            {{ normalize(value) }}
          </td>
          <td v-show="showActions" v-for="([k, action], index) in Object.entries(actions ?? [])" :key="index">
            <button @click="actionExec(obj, action.fn, action.multiple)" class="button is-small is-text">
              {{ action.name ?? '' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <nav class="pagination is-centered" role="navigation" aria-label="pagination">
      <button class="pagination-previous" :class="{ 'disabled': currentPage <= 1 }" @click="changePage(currentPage - 1)"
        :disabled="currentPage <= 1">Previous</button>
      <button class="pagination-next" :class="{ 'disabled': currentPage >= totalPages }"
        @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages">Next page</button>
      <ul class="pagination-list">
        <li v-show="paginateNav[0] != currentPage && currentPage > 10"><span class="pagination-link"
            :aria-label="'Goto page ' + (paginateNav[0])" @click="changePage(paginateNav[0])">{{ paginateNav[0]
            }}</span>
        </li>
        <li v-show="paginateNav[0] != currentPage && currentPage > 10"><span class="pagination-ellipsis">&hellip;</span>
        </li>
        <li
          v-for="page in paginateNav.slice((currentPage > 10 ? (currentPage - 1) : 0), (currentPage + (totalPages < currentPage + 10 ? (totalPages - currentPage) : 10)))">
          <span class="pagination-link" :aria-label="'Goto page ' + page" :class="{ 'is-current': currentPage == page }"
            @click="changePage(page)">{{ page }}</span>
        </li>
        <li v-show="paginateNav.length > 10 && currentPage < paginateNav.length"><span
            class="pagination-ellipsis">&hellip;</span></li>
        <li v-show="paginateNav.length > 10 && currentPage < paginateNav.length">
          <span class="pagination-link" :aria-label="'Goto page ' + (paginateNav[paginateNav.length - 1])"
            @click="changePage(paginateNav[paginateNav.length - 1])">
            {{ paginateNav[paginateNav.length - 1] }}
          </span>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>