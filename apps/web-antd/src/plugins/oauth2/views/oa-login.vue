<script setup lang="ts">
import { ref } from 'vue';

import { VbenButton } from '@vben/common-ui';

import { getOAuth2OA } from '#/plugins/oauth2/api';

defineOptions({ name: 'OAuth2OaLogin' });

const loading = ref(false);

const handleLogin = async () => {
  if (loading.value) {
    return;
  }
  loading.value = true;
  try {
    const redirectUrl = await getOAuth2OA();
    window.location.href = redirectUrl;
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};
</script>

<template>
  <div class="oa-login-wrapper">
    <VbenButton
      class="oa-login-btn w-full"
      size="lg"
      :loading="loading"
      @click="handleLogin"
    >
      OA 平台登录
    </VbenButton>
  </div>
</template>

<style scoped>
.oa-login-wrapper {
  margin-top: 24px;
}

.oa-login-btn {
  font-weight: 600;
  color: #fff;
  background-color: #00a0e9;
  border-color: #00a0e9;
}

.oa-login-btn:hover,
.oa-login-btn:focus {
  color: #fff;
  background-color: #0085c3;
  border-color: #0085c3;
}
</style>
