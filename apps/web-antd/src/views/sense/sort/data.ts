import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import {
  getDmCheckBezierByProjectApi,
  getDmCheckProjectByProcessApi,
  getDmFailureModelApi,
  getDmFaultLocationByModelApi,
  getDmLifetimeStageApi,
  getDmMaterialNameByProcessApi,
  getDmProcessNameByModelApi,
} from '#/api';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'model',
    label: '产品型号',
    componentProps: {
      allowClear: true,
      showSearch: true, // 显示搜索框
      class: 'w-full', // w-full 表示组件宽度 100% 铺满容器
      api: async () => {
        const res = await getDmFailureModelApi();
        // console.log(res);
        return res.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'part',
    label: '零部件',
    dependencies: {
      triggerFields: ['model'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        filterOption: (input: string, option: any) => {
          // 支持用名称或编码搜索
          return (
            option.label?.toLowerCase().includes(input.toLowerCase()) ||
            option.value?.toLowerCase().includes(input.toLowerCase())
          );
        },
        api: async (params: any) => {
          if (!params?.model) return [];
          const res = await getDmFaultLocationByModelApi({
            product_model: params.model,
          });
          return res.map((item: string) => {
            const match = item.match(/（(.*?)）/);
            const part = match ? match[1] : '';
            return {
              label: item,
              value: part,
            };
          });
        },
        params: {
          model: values.model,
        },
      }),
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'stage',
    label: '产品寿命阶段',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      api: async () => {
        const res = await getDmLifetimeStageApi();
        return res.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'process_name',
    label: '工序名称',
    dependencies: {
      triggerFields: ['model'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        filterOption: (input: string, option: any) => {
          // 支持用名称或编码搜索
          return (
            option.label?.toLowerCase().includes(input.toLowerCase()) ||
            option.value?.toLowerCase().includes(input.toLowerCase())
          );
        },
        api: async (params: any) => {
          if (!params?.model) return [];
          const res = await getDmProcessNameByModelApi({
            product_model: params.model,
          });
          // 添加"全部"选项在最前面
          const options = [
            { label: '全部', value: '' }, // 空字符串表示全部
            ...res.map((item: string) => ({
              label: item,
              value: item,
            })),
          ];
          return options;
        },
        params: {
          model: values.model,
        },
      }),
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'extra_material_names',
    label: '原材料名称',
    dependencies: {
      triggerFields: ['model', 'process_name'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        dropdownStyle: {
          minWidth: '450px', // 或者你需要的宽度
          maxWidth: '700px',
        },
        filterOption: (input: string, option: any) => {
          return (
            option.label?.toLowerCase().includes(input.toLowerCase()) ||
            option.value?.toLowerCase().includes(input.toLowerCase())
          );
        },
        api: async (params: any) => {
          // 如果没有选择工序名称，返回空数组
          if (
            params?.process_name === undefined ||
            params?.process_name === null
          )
            return [];

          // 如果选择了"全部"，直接返回"全部"选项，不请求后端
          if (params.process_name === '') {
            return [{ label: '全部', value: '' }];
          }

          // 选择了具体工序，请求后端获取原材料列表
          const res = await getDmMaterialNameByProcessApi({
            product_model: params.model,
            process_name: params.process_name,
          });
          // 添加"全部"选项
          const options = [
            { label: '全部', value: '' },
            ...res.map((item: string) => {
              const materialName = item.split('(')[0] || item;
              return {
                label: item,
                value: materialName,
              };
            }),
          ];
          return options;
        },
        params: {
          product_model: values.model,
          process_name: values.process_name,
        },
      }),
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'check_project',
    label: '检验区位',
    dependencies: {
      triggerFields: ['model', 'process_name'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        filterOption: (input: string, option: any) => {
          // 支持用名称或编码搜索
          return (
            option.label?.toLowerCase().includes(input.toLowerCase()) ||
            option.value?.toLowerCase().includes(input.toLowerCase())
          );
        },
        api: async (params: any) => {
          // 如果没有选择工序名称，返回空数组
          // 注意：空字符串（"全部"）被认为是有效选择
          if (
            params?.process_name === undefined ||
            params?.process_name === null
          )
            return [];

          // 如果选择了"全部"，直接返回"全部"选项，不请求后端
          if (params.process_name === '') {
            return [{ label: '全部', value: '' }];
          }

          // 选择了具体工序，请求后端获取检验区位列表
          const res = await getDmCheckProjectByProcessApi({
            product_model: params.model,
            process_name: params.process_name,
          });
          // 添加"全部"选项
          const options = [
            { label: '全部', value: '' },
            ...res.map((item: string) => ({
              label: item,
              value: item,
            })),
          ];
          return options;
        },
        params: {
          model: values.model,
          process_name: values.process_name,
        },
      }),
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'check_bezier',
    label: '检验项点',
    dependencies: {
      triggerFields: ['model', 'process_name', 'check_project'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        filterOption: (input: string, option: any) => {
          // 支持用名称或编码搜索
          return (
            option.label?.toLowerCase().includes(input.toLowerCase()) ||
            option.value?.toLowerCase().includes(input.toLowerCase())
          );
        },
        api: async (params: any) => {
          // 如果没有选择检验区位，返回空数组
          if (
            params?.check_project === undefined ||
            params?.check_project === null
          )
            return [];

          // 如果选择了"全部"，直接返回"全部"选项，不请求后端
          if (params.check_project === '') {
            return [{ label: '全部', value: '' }];
          }

          // 选择了具体检验区位，请求后端获取检验项点列表
          const res = await getDmCheckBezierByProjectApi({
            product_model: params.model,
            process_name: params.process_name,
            check_project: params.check_project,
          });
          // 添加"全部"选项
          const options = [
            { label: '全部', value: '' },
            ...res.map((item: string) => ({
              label: item,
              value: item,
            })),
          ];
          return options;
        },
        params: {
          model: values.model,
          process_name: values.process_name,
          check_project: values.check_project,
        },
      }),
    },
  },
];

// 表格 columns，全部用 slots 便于自定义渲染
export const columns: VxeGridProps['columns'] = [
  { field: 'seq', title: '序号', type: 'seq', width: 50 },
  {
    field: 'check_bezier',
    title: '检验项点',
    width: 500,
    slots: { default: 'check_bezier' },
  },
  {
    field: 'rela_self_value',
    title: '自检结果',
  },
  {
    field: 'check_tools_sign',
    title: '检验工具',
    slots: { default: 'check_tools_sign' },
  },
  {
    field: 'self_create_by',
    title: '操作员工',
    slots: { default: 'self_create_by' },
  },
  {
    field: 'extra_source_code',
    title: '配件/原材料',
    slots: { default: 'extra_source_code' },
  },
  {
    field: 'extra_supplier',
    title: '供应商',
    slots: { default: 'extra_supplier' },
  },
  {
    field: 'version',
    title: '版本',
    slots: { default: 'version' },
  },
];
