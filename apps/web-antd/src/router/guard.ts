import type { Router } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore, useWebSocketStore } from '#/store';

import { generateAccess } from './access';

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 页面加载进度条
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行

    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    // 优先处理 OAuth2 回调
    if (
      to.name === 'OAuth2Callback' ||
      to.path === '/oauth2/callback' ||
      window.location.pathname === '/oauth2/callback'
    ) {
      // oauth2Login 内部已经处理了跳转逻辑（成功跳转首页，失败跳转登录页）
      // 所以这里不需要额外处理，直接返回 false 阻止后续路由守卫执行
      await authStore.oauth2Login();
      return false;
    }

    // 基本路由，这些路由不需要进入权限拦截
    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) ||
            userStore.userInfo?.homePath ||
            preferences.app.defaultHomePath,
        );
      }
      return true;
    }

    // accessToken 检查
    if (!accessStore.accessToken) {
      // 明确声明忽略权限访问权限，则可以访问
      if (to.meta.ignoreAccess) {
        return true;
      }

      // 没有访问权限，跳转登录页面
      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          // 如不需要，直接删除 query
          query:
            to.fullPath === preferences.app.defaultHomePath
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          // 携带当前跳转的页面，登录后重新跳转该页面
          replace: true,
        };
      }
      return to;
    }

    // 是否已经生成过动态路由
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 生成路由表
    // 当前登录用户拥有的角色标识列表
    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
    const userRoles = userInfo.roles ?? [];

    // 生成菜单和路由
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      router,
      // 则会在菜单中显示，但是访问会被重定向到403
      routes: accessRoutes,
    });

    // 保存菜单信息和路由信息
    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);

    // ✅ 优化 redirectPath 计算逻辑
    // 优先使用 from.query.redirect（登录页可能携带的 redirect 参数）
    // 其次使用 to.path（登录后跳转的目标路径）
    // 最后使用 userInfo.homePath 或默认首页
    let redirectPath =
      (from.query?.redirect as string) ??
      (to.path !== LOGIN_PATH && to.path !== preferences.app.defaultHomePath
        ? to.path
        : userInfo.homePath || preferences.app.defaultHomePath);

    // 如果 redirectPath 是编码过的，需要解码
    try {
      redirectPath = decodeURIComponent(redirectPath);
    } catch {
      // 如果解码失败，使用原始路径
    }

    // ✅ 修复：直接返回路径字符串，让 Vue Router 自动解析
    return redirectPath;
  });
}

/**
 * WebSocket 守卫配置
 * @param router
 */
export function setupWebSocketGuard(router: Router) {
  router.beforeEach(async (_) => {
    const accessStore = useAccessStore();
    const wsStore = useWebSocketStore();

    // 检查 WebSocket 连接状态
    if (accessStore.accessToken && !wsStore.isConnected) {
      wsStore.connect();
    }

    return true;
  });
}

/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
  /** WebSocket */
  setupWebSocketGuard(router);
}

export { createRouterGuard };
