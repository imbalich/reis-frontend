<script setup lang="ts">
import { useVbenForm } from '#/adapter/form';

import { schema } from './data';

const [Form] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema,
  wrapperClass: 'grid grid-cols-4 gap-4',
});
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <!-- 顶部参数输入区 -->
    <div class="mt-4 w-full">
      <a-card title="参数输入区">
        <Form />
        <a-button
          type="primary"
          style="position: absolute; bottom: 10px; right: 40px"
        >
          提交
        </a-button>
      </a-card>
    </div>
    <!-- 下方左右布局 -->
    <div class="mt-4 flex w-full space-x-4" style="height: 550px">
      <!-- 左侧策略选择表单 -->
      <a-card title="最佳更换时间估算" style="width: 850px">
        <img
          src="/img1.png"
          alt="最佳更换时间估算"
          style="width: 85%; margin: 1px auto 0 auto; display: block"
        />
      </a-card>
      <!-- 右侧图形展示区 -->
      <a-card title="在一系列CM成本范围内的最佳更换间隔" style="width: 850px">
        <img
          src="/img2.png"
          alt="在一系列CM成本范围内的最佳更换间隔"
          style="width: 90%; margin: 10px auto 0 auto; display: block"
        />
      </a-card>
    </div>
  </div>
</template>
