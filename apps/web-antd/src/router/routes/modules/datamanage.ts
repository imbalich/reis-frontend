import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Datamanage',
    path: '/datamanage',
    meta: {
      title: '基础数据管理',
      icon: 'material-symbols:table',
      order: 5,
    },
    children: [
      {
        name: 'DespatchDm',
        path: '/datamanage/despatch',
        component: () => import('#/views/datamanage/despatch/index.vue'),
        meta: {
          title: '发运数据管理',
          icon: 'material-symbols:table-view',
        },
      },
      {
        name: 'FailureDm',
        path: '/datamanage/failure',
        component: () => import('#/views/datamanage/failure/index.vue'),
        meta: {
          title: '故障数据管理',
          icon: 'material-symbols:table-view',
        },
      },
      {
        name: 'EbomDm',
        path: '/datamanage/ebom',
        component: () => import('#/views/datamanage/ebom/index.vue'),
        meta: {
          title: 'Ebom数据管理',
          icon: 'material-symbols:table-view',
        },
      },
      {
        name: 'ProductDm',
        path: '/datamanage/product',
        component: () => import('#/views/datamanage/product/index.vue'),
        meta: {
          title: '产品信息数据管理',
          icon: 'material-symbols:table-view',
        },
      },
      {
        name: 'RepairDm',
        path: '/datamanage/repair',
        component: () => import('#/views/datamanage/repair/index.vue'),
        meta: {
          title: '造修阶段数据管理',
          icon: 'material-symbols:table-view',
        },
      },
      {
        name: 'ReplaceDm',
        path: '/datamanage/replace',
        component: () => import('#/views/datamanage/replace/index.vue'),
        meta: {
          title: '必换件数据管理',
          icon: 'material-symbols:table-view',
        },
      },
      {
        name: 'WarehouseDm',
        path: '/datamanage/warehouse',
        component: () => import('#/views/datamanage/warehouse/index.vue'),
        meta: {
          title: '仓库数据管理',
          icon: 'material-symbols:table-view',
        },
      },
      {
        name: 'WarehouseInventoryDm',
        path: '/datamanage/warehouse-inventory',
        component: () =>
          import('#/views/datamanage/warehouse-inventory/index.vue'),
        meta: {
          title: '库房备品清单管理',
          icon: 'material-symbols:table-view',
        },
      },
      {
        name: 'PartSpareMappingDm',
        path: '/datamanage/part-spare-mapping',
        component: () =>
          import('#/views/datamanage/part-spare-mapping/index.vue'),
        meta: {
          title: '部件与备品映射关系管理',
          icon: 'material-symbols:table-view',
        },
      },
    ],
  },
];

export default routes;
