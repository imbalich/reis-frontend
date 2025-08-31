import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Rbd',
    path: '/rbd',
    meta: {
      title: '可靠性框图',
      icon: 'ant-design:border-inner-outlined',
      order: 12,
    },
    children: [
      {
        name: 'RbdProjectList',
        path: '/rbd/list',
        component: () => import('#/views/rbd/list/index.vue'),
        meta: {
          title: '项目列表',
          icon: 'ant-design:project-outlined',
        },
      },
      {
        name: 'RbdProjectDetail',
        path: '/rbd/detail/:id',
        component: () => import('#/views/rbd/detail/index.vue'),
        meta: {
          title: '项目详情',
          icon: 'ant-design:file-text-outlined',
          hideInMenu: true,
          keepAlive: true, // 保持KeepAlive缓存，确保用户编辑状态不丢失
        },
      },
    ],
  },
];

export default routes;
