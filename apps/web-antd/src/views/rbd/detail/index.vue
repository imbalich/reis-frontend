<script setup lang="ts">
import type { RbdProjectResult } from '#/api/rbd';

import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useTabs } from '@vben/hooks';

import { message } from 'ant-design-vue';

import { getRbdProjectDetailApi } from '#/api/rbd';
import { RBDEditor } from '#/modules/rbd';

// 设置组件名称，与路由name保持一致
defineOptions({
  name: 'RbdProjectDetail',
});

const route = useRoute();
const { setTabTitle } = useTabs();
const projectInfo = ref<null | RbdProjectResult>(null);
const loading = ref(false);

// 获取项目信息并设置动态标题
const fetchProjectInfo = async () => {
  const projectId = route.params.id;
  if (!projectId || Array.isArray(projectId)) {
    message.error('项目ID不能为空');
    return;
  }

  loading.value = true;
  try {
    const data = await getRbdProjectDetailApi(projectId);
    projectInfo.value = data;

    // 设置动态标签页标题
    setTabTitle(`${data.name}详情页`);

    // 项目信息已加载
  } catch (error) {
    console.error('获取项目信息失败:', error);
    message.error('获取项目信息失败');
    // 设置默认标题
    setTabTitle(`项目详情-${projectId}`);
  } finally {
    loading.value = false;
  }
};

// 监听路由参数变化，重新获取项目信息
watch(
  () => route.params.id,
  (newId, oldId) => {
    // 只有当新ID存在且与旧ID不同时才获取项目信息
    // 并且确保当前在RBD详情页路由中
    if (
      newId &&
      newId !== oldId &&
      !Array.isArray(newId) &&
      route.path.startsWith('/rbd/detail/')
    ) {
      fetchProjectInfo();
    }
  },
);

onMounted(() => {
  fetchProjectInfo();
});
</script>

<template>
  <div v-if="loading" class="loading-container">
    <a-spin size="large" tip="正在加载项目信息..." />
  </div>
  <div v-else-if="projectInfo" class="project-detail-container">
    <RBDEditor :project-info="projectInfo" />
  </div>
  <div v-else class="error-container">
    <a-result
      status="error"
      title="项目信息加载失败"
      sub-title="请检查项目ID是否正确"
    >
      <template #extra>
        <a-button type="primary" @click="fetchProjectInfo">重新加载</a-button>
      </template>
    </a-result>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.project-detail-container {
  height: 100vh;
  overflow: hidden;
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
