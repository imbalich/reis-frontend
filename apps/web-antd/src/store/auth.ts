import type { Recordable } from '@vben/types';

import type { CaptchaResult, LoginParams, MyUserInfo } from '#/api';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import {
  getAccessCodesApi,
  getCaptchaApi,
  getUserInfoApi,
  loginApi,
  logoutApi,
} from '#/api';
import { $t } from '#/locales';
import { useDictStore, useWebSocketStore } from '#/store';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const dictStore = useDictStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 登陆验证码
   */
  async function captcha() {
    const res: CaptchaResult = await getCaptchaApi();
    accessStore.setCaptchaUuid(res.uuid);
    return res.image;
  }

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: MyUserInfo | null = null;
    try {
      loginLoading.value = true;
      const { access_token, session_uuid } = await loginApi(
        params as LoginParams,
      );

      // 如果成功获取到 accessToken
      if (access_token) {
        accessStore.setAccessToken(access_token);
        accessStore.setAccessSessionUuid(session_uuid);

        // 获取用户信息并存储到 accessStore 中
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getAccessCodesApi(),
        ]);

        userInfo = fetchUserInfoResult;

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        // 初始化WebSocket连接
        const wsStore = useWebSocketStore();
        wsStore.connect();

        if (userInfo?.nickname) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.nickname}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function oauth2Login() {
    const params = new URLSearchParams(window.location.search);
    const access_token = params.get('access_token');
    const session_uuid = params.get('session_uuid');
    const error = params.get('error');

    // 处理错误情况
    if (error) {
      const ERROR_MAP: Record<string, string> = {
        invalid_state: '授权状态无效或已过期，请重新登录',
        token_error: '获取访问令牌失败',
        no_access_token: '未获取到访问令牌',
        login_failed: '登录失败，请重试',
        http_error: '网络请求错误',
        unknown_error: '未知错误，请重试',
      };
      const errorMsg = ERROR_MAP[error] ?? `登录失败：${error}`;

      notification.error({
        message: 'OA平台登录失败',
        description: errorMsg,
        duration: 5,
      });

      // 跳转回登录页
      await router.replace({
        path: LOGIN_PATH,
        query: {},
      });
      return false;
    }

    // 处理成功情况
    if (access_token && session_uuid) {
      try {
        accessStore.setAccessToken(access_token);
        accessStore.setAccessSessionUuid(session_uuid);

        // 获取用户信息和权限码
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getAccessCodesApi(),
        ]);

        const userInfo = fetchUserInfoResult;
        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        }

        // 初始化WebSocket连接
        const wsStore = useWebSocketStore();
        wsStore.connect();

        // 显示成功通知
        if (userInfo?.nickname) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.nickname}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }

        // 跳转到首页
        await router.push(userInfo.homePath || preferences.app.defaultHomePath);

        return true;
      } catch (error_) {
        console.error('OAuth2 login error:', error_);
        notification.error({
          message: '登录失败',
          description: '获取用户信息失败，请重试',
          duration: 5,
        });
        await router.replace({
          path: LOGIN_PATH,
          query: {},
        });
        return false;
      }
    }

    // 缺少必要参数
    console.error('Missing or invalid access_token or session_uuid');
    notification.error({
      message: '登录失败',
      description: '缺少必要的登录参数，请重新登录',
      duration: 5,
    });
    await router.replace({
      path: LOGIN_PATH,
      query: {},
    });
    return false;
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: MyUserInfo | null = null;
    userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    dictStore.resetCache();
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    captcha,
    authLogin,
    oauth2Login,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
