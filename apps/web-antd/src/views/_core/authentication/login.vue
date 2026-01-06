<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
// import type { BasicOption } from '@vben/types';

import { computed, h, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useAccessStore } from '@vben/stores';

import { Image, message } from 'ant-design-vue';

import { getOAuth2OA } from '#/plugins/oauth2/api';
import OAuth2OaLogin from '#/plugins/oauth2/views/oa-login.vue';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

// const showNotification = () => {
//   notification.warning({
//     message: h('span', { class: 'font-semibold' }, '公告'),
//     description: h('div', [
//       h('p', { class: 'mb-2' }, [
//         '您正在浏览 ',
//         h(
//           'span',
//           { class: 'font-bold' },
//           '基于 Vben Admin Antd 构建的 fastapi_best_architecture 前端完整版实施',
//         ),
//       ]),
//       h('ul', { class: 'list-disc pl-5 space-y-1' }, [
//         h('li', null, [
//           '此项目目前仍处于 WIP (Work In Progress) 状态',
//           ' ',
//           h(
//             'span',
//             {
//               class:
//                 'inline-block px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full',
//             },
//             '开发阶段',
//           ),
//         ]),
//         h('li', null, [
//           '作者已在拼命肝',
//           h(
//             'span',
//             { class: 'text-gray-500 ml-1' },
//             '（为此带来的不便请谅解）',
//           ),
//         ]),
//       ]),
//     ]),
//     duration: null,
//     maxCount: 1,
//     placement: 'bottom',
//     class: 'w-full',
//   });
// };

// onMounted(() => {
//   showNotification();
// });

const authStore = useAuthStore();
const accessStore = useAccessStore();
const route = useRoute();
const router = useRouter();

// OA 自动登录状态
const oaAutoLoginLoading = ref(false);

// 注释掉开发测试用的账号选项
// const MOCK_USER_OPTIONS: BasicOption[] = [
//   {
//     label: 'Admin',
//     value: 'admin',
//   },
//   {
//     label: 'Test',
//     value: 'test',
//   },
// ];

const imageSrc = ref('');
const refreshCaptcha = async () => {
  try {
    const captcha = await authStore.captcha();
    imageSrc.value = `data:image/png;base64, ${captcha}`;
  } catch (error) {
    console.error(error);
  }
};
refreshCaptcha();

// 自动触发 OA 登录
const handleAutoOALogin = async () => {
  if (oaAutoLoginLoading.value) {
    return;
  }

  oaAutoLoginLoading.value = true;
  try {
    const redirectUrl = await getOAuth2OA();
    // 跳转到 OA 平台
    window.location.href = redirectUrl;
  } catch (error) {
    console.error('OA 自动登录失败:', error);
    message.error('OA 平台登录失败，请手动点击登录按钮重试');
    // 移除 URL 参数，显示登录表单
    const newQuery = { ...route.query };
    delete newQuery.autoOAuth2;
    router.replace({
      path: route.path,
      query: newQuery,
    });
    oaAutoLoginLoading.value = false;
  }
};

// 检测 URL 参数，自动触发 OA 登录
onMounted(() => {
  const autoOAuth2 = route.query.autoOAuth2;
  if (autoOAuth2 === 'oa') {
    handleAutoOALogin();
  }
});

const formSchema = computed((): VbenFormSchema[] => {
  return [
    // 注释掉账号选择下拉框（开发测试便利功能）
    // {
    //   component: 'VbenSelect',
    //   componentProps: {
    //     options: MOCK_USER_OPTIONS,
    //     placeholder: $t('authentication.selectAccount'),
    //   },
    //   fieldName: 'selectAccount',
    //   label: $t('authentication.selectAccount'),
    //   rules: z
    //     .string()
    //     .min(1, { message: $t('authentication.selectAccount') })
    //     .optional()
    //     .default('admin'),
    // },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      // 注释掉自动填充逻辑
      // dependencies: {
      //   trigger(values, form) {
      //     if (values.selectAccount) {
      //       const findUser = MOCK_USER_OPTIONS.find(
      //         (item) => item.value === values.selectAccount,
      //       );
      //       if (findUser) {
      //         form.setValues({
      //           password: '123456',
      //           username: findUser.value,
      //         });
      //       }
      //     }
      //   },
      //   triggerFields: ['selectAccount'],
      // },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('page.auth.captchaPlaceholder'),
      },
      fieldName: 'captcha',
      label: $t('authentication.password'),
      rules: z.string().length(4, { message: $t('page.auth.captchaRequired') }),
      formItemClass: 'w-2/3',
    },
    {
      component: 'VbenInput',
      fieldName: 'uuid',
      formItemClass: 'hidden',
      dependencies: {
        trigger: (_, form) => {
          form.setValues({
            uuid: accessStore.captchaUuid,
          });
        },
        triggerFields: ['captchaImg'],
      },
    },
    {
      component: h(Image),
      componentProps: {
        src: imageSrc.value,
        width: 120,
        height: 40,
        preview: false,
        onClick: refreshCaptcha,
      },
      fieldName: 'captchaImg',
      formItemClass: 'ml-auto -mt-[74px]',
    },
  ];
});
</script>

<template>
  <div class="login-container">
    <!-- OA 自动登录加载遮罩 -->
    <div v-if="oaAutoLoginLoading" class="oa-auto-login-overlay">
      <div class="oa-auto-login-content">
        <div class="oa-auto-login-spinner"></div>
        <p class="oa-auto-login-text">正在跳转到 OA 平台登录...</p>
      </div>
    </div>

    <AuthenticationLogin
      :form-schema="formSchema"
      :loading="authStore.loginLoading"
      :show-forget-password="false"
      :show-code-login="false"
      :show-qrcode-login="false"
      :show-register="false"
      :show-third-party-login="true"
      @submit="authStore.authLogin"
    >
      <template #third-party-login>
        <OAuth2OaLogin />
      </template>
    </AuthenticationLogin>
  </div>
</template>

<style scoped>
.login-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.oa-auto-login-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(255 255 255 / 90%);
}

.dark .oa-auto-login-overlay {
  background-color: rgb(0 0 0 / 90%);
}

.oa-auto-login-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.oa-auto-login-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #00a0e9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.dark .oa-auto-login-spinner {
  border-color: #333;
  border-top-color: #00a0e9;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.oa-auto-login-text {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.dark .oa-auto-login-text {
  color: #fff;
}
</style>
