<script setup lang="ts">
import type { QueryDegradeFunctionParams } from '#/api';
import type { DegradeFunctionData } from '#/custom/degrade/strategies/types';

import { ref } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { queryDegradeFunctionApi } from '#/api';
import { getFunctionType } from '#/custom/degrade/function-express';

import { querySchema } from './data';
import DegradeTrends from './degrade-trends.vue';

// 表单配置
const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema: querySchema,
  wrapperClass: 'grid grid-cols-4 gap-4',
});

// 退化函数数据
const functionData = ref<DegradeFunctionData[]>([]);
const loading = ref(false);
const currentFunction = ref<DegradeFunctionData>();

// 处理查询
const handleSubmit = async () => {
  loading.value = true;
  try {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const queryData = (await formApi.getValues()) as QueryDegradeFunctionParams;

    const res = await queryDegradeFunctionApi(queryData);
    if (res && res.length > 0) {
      functionData.value = res;
      message.success('查询成功，已获取到数据');
    }
    if (functionData.value.length > 0) {
      currentFunction.value = functionData.value[0] as DegradeFunctionData;
    } else {
      message.info('未查询到退化函数数据');
    }
  } catch {
    functionData.value = [];
  } finally {
    loading.value = false;
  }
};

// 处理重置表单
const handleReset = () => {
  formApi.resetForm(); // 重置表单字段
};
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <!-- 顶部参数输入区 -->
    <div class="mt-4 w-full">
      <a-card title="参数输入区" style="height: 160px">
        <Form />
        <a-button
          type="primary"
          @click="handleSubmit"
          style="position: absolute; right: 40px; bottom: 5px"
        >
          提交
        </a-button>
        <a-button
          type="default"
          @click="handleReset"
          style="position: absolute; right: 120px; bottom: 5px"
        >
          重置
        </a-button>
      </a-card>
    </div>
    <!-- 底部参数展示区 -->
    <div class="mt-4 flex w-full space-x-4" style="height: 500px">
      <!-- 左侧图形展示区 -->
      <a-card title="图形展示区" style="flex: 1; min-width: 0">
        <DegradeTrends
          v-if="currentFunction"
          :current-function="currentFunction"
          :loading="loading"
          style="height: 450px"
        />
        <div v-else style="padding: 60px 0; color: #aaa; text-align: center">
          请先提交表单后获取退化曲线
        </div>
      </a-card>
      <!-- 右侧计算结果展示区 -->
      <a-card title="计算结果区" style="width: 330px">
        <a-form>
          <a-form-item label="函数名称">
            {{ getFunctionType(currentFunction?.name ?? '') }}
          </a-form-item>
          <a-form-item label="置信水平"> 95% </a-form-item>
          <a-divider />
          <a-form-item label="失效时间（预测）">
            {{ currentFunction?.t_failure }}（小时）
          </a-form-item>
          <a-form-item label="失效区间（预测）">
            {{ currentFunction?.failure_interval }}（小时）
          </a-form-item>
          <a-form-item label="剩余时长（预测）">
            {{ currentFunction?.difference }}（小时）
          </a-form-item>
          <span style="color: #e66">
            注意：若选择了“产品编号”，请填写“失效阈值”，否则无法输出结果!
          </span>
        </a-form>
      </a-card>
    </div>
  </div>
</template>
