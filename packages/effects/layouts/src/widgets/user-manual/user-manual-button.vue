<script lang="ts" setup>
import { BookOpenText } from '@vben/icons';
import { downloadFileFromUrl } from '@vben/utils';

import { VbenIconButton } from '@vben-core/shadcn-ui';

defineOptions({
  name: 'UserManualButton',
});

const props = withDefaults(defineProps<Props>(), {
  manualUrl: '/user-manual.pdf',
  fileName: '用户操作手册.pdf',
});

interface Props {
  /**
   * 用户手册文件URL
   * 可以是相对路径（如 /public/manual.pdf）或完整URL
   */
  manualUrl?: string;
  /**
   * 下载文件名
   */
  fileName?: string;
}

async function handleDownload() {
  try {
    // 如果manualUrl是相对路径，需要转换为完整URL
    const url =
      props.manualUrl.startsWith('http://') ||
      props.manualUrl.startsWith('https://')
        ? props.manualUrl
        : `${window.location.origin}${props.manualUrl}`;

    await downloadFileFromUrl({
      fileName: props.fileName,
      source: url,
    });
  } catch (error) {
    console.error('下载用户手册失败:', error);
    // 可以在这里添加消息提示
  }
}
</script>

<template>
  <VbenIconButton title="下载用户操作手册" @click="handleDownload">
    <BookOpenText class="text-foreground size-4" />
  </VbenIconButton>
</template>
