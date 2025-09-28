import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'ScientificInventory',
    path: '/scientific-inventory',
    meta: {
      title: '科学库存管理',
      icon: 'material-symbols:inventory-2',
      order: 7,
    },
    children: [
      {
        name: 'ScientificInventoryResults',
        path: '/scientific-inventory/results',
        component: () => import('#/views/scientific-inventory/index.vue'),
        meta: {
          title: '计算结果展示',
          icon: 'material-symbols:table-view',
        },
      },
    ],
  },
];

export default routes;
