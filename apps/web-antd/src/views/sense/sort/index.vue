<script setup lang="ts">
import type { SenseSortParams } from '#/api';

import { onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { createSenseSortApi, getSenseSortApi } from '#/api/';

import { columns, querySchema } from './data';

// 默认值查询值
const defaultFormValues = {
  model: 'YJ90A1',
  part: 'CNR0000212865',
  stage: '新造',
  process_name: '总装配',
  check_project: '转子装配',
  check_bezier: '测量非端轴承装配尺寸',
  extra_material_names: String.raw`5116740441\转子装配\YJ90B`,
};

// 查询表单
const [Form, formApi] = useVbenForm({
  schema: querySchema,
  layout: 'horizontal',
  showDefaultActions: false,
  wrapperClass: 'grid grid-cols-4 gap-4',
});

// 只显示第一条数据
function filterFirst(data: any[]) {
  return data.length > 0 ? [data[0]] : [];
}

// 查询逻辑
const tableData = ref<any[]>([]);
const loading = ref(false);

// 过滤空值字段（当选择"全部"时不传递该字段）
const filterEmptyFields = (obj: Record<string, any>) => {
  const filtered: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    // 只有当值不为空字符串时才添加到请求参数中
    if (value !== '' && value !== null && value !== undefined) {
      filtered[key] = value;
    }
  });
  return filtered;
};

const doQuery = async () => {
  loading.value = true;
  try {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const rawFormValues = (await formApi.getValues()) as SenseSortParams;

    // 过滤掉值为空字符串的字段（即选择了"全部"的字段）
    const formValues = filterEmptyFields(rawFormValues) as SenseSortParams;

    // 先get
    const res = await getSenseSortApi(formValues);
    let list = Array.isArray(res) ? res : res?.data || [];
    list = filterFirst(list);
    if (list.length > 0) {
      tableData.value = list;
      message.success('成功请求到数据');
    } else {
      // 数据不匹配，触发POST生成
      await createSenseSortApi(formValues);
      message.info('请求已发送，请等待几分钟再查询');
      tableData.value = [];
    }
  } catch {
    tableData.value = [];
  } finally {
    loading.value = false;
  }
};

// 处理重置表单
const handleReset = () => {
  formApi.resetForm(); // 重置表单字段
};

// 表格
const gridOptions = {
  rowConfig: {
    keyField: 'id',
  },
  checkboxConfig: {
    highlight: true,
  },
  pagerConfig: {
    enabled: false,
  },
  height: 'auto',
  maxHeight: 200,
  exportConfig: {},
  printConfig: {},
  scrollX: {
    enabled: true,
  },
  columns,
  data: tableData.value,
  loading: loading.value,
};
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 监听数据变化
watch([tableData, loading], () => {
  gridApi?.setState?.({
    gridOptions: {
      ...gridApi?.state?.gridOptions,
      data: tableData.value,
      loading: loading.value,
    },
  });
});

// 初始化时设置默认值并自动查询
onMounted(async () => {
  await formApi.setValues(defaultFormValues);
  doQuery();
});

// 子排序弹窗
const modalVisible = ref(false);
const modalTitle = ref('');
const modalList = ref<string[]>([]);

function handleShowDetail(field: string, row: any) {
  let catObj: Record<string, any> = {};
  try {
    catObj = JSON.parse(row.categorical_analysis || '{}');
  } catch {}
  const arr = Array.isArray(catObj[field]) ? catObj[field] : [];
  const col = (columns ?? []).find((c) => c.field === field);
  modalTitle.value = `${col?.title || field}相关度排序结果`;
  modalList.value = arr;
  modalVisible.value = true;
}
</script>

<template>
  <Page auto-content-height>
    <div class="w-full" style="height: 240px">
      <a-card title="参数输入区">
        <Form />
        <a-button
          type="primary"
          @click="doQuery"
          style="position: absolute; right: 40px; bottom: 20px"
        >
          提交
        </a-button>
        <a-button
          type="default"
          @click="handleReset"
          style="position: absolute; right: 120px; bottom: 20px"
        >
          重置
        </a-button>
      </a-card>
    </div>
    <a-card title="相关性分析排序结果">
      <Grid>
        <template #check_bezier="{ row }">
          <span>
            {{ row.check_bezier || '全部' }}
          </span>
        </template>
        <template #check_tools_sign="{ row }">
          <span
            style="color: #1677ff; cursor: pointer"
            @click="handleShowDetail('check_tools_sign', row)"
          >
            {{ row.check_tools_sign }}
          </span>
        </template>
        <template #self_create_by="{ row }">
          <span
            style="color: #1677ff; cursor: pointer"
            @click="handleShowDetail('self_create_by', row)"
          >
            {{ row.self_create_by }}
          </span>
        </template>
        <template #extra_source_code="{ row }">
          <span
            style="color: #1677ff; cursor: pointer"
            @click="handleShowDetail('extra_source_code', row)"
          >
            {{ row.extra_source_code }}
          </span>
        </template>
        <template #extra_supplier="{ row }">
          <span
            style="color: #1677ff; cursor: pointer"
            @click="handleShowDetail('extra_supplier', row)"
          >
            {{ row.extra_supplier }}
          </span>
        </template>
        <template #version="{ row }">
          <span
            style="color: #1677ff; cursor: pointer"
            @click="handleShowDetail('version', row)"
          >
            {{ row.version }}
          </span>
        </template>
      </Grid>
    </a-card>
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      footer=" "
      style="width: 25%"
    >
      <div v-if="modalList.length > 0">
        <a-list :data-source="modalList" bordered>
          <template #renderItem="{ item, index }">
            <a-list-item>
              <span style="font-weight: bold; color: #1677ff">{{
                index + 1
              }}</span>
              <span>{{ item }}</span>
            </a-list-item>
          </template>
        </a-list>
      </div>
      <div v-else style="padding: 32px 0; color: #aaa; text-align: center">
        无数据
      </div>
    </a-modal>
  </Page>
</template>
