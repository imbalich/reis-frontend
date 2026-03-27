import type { VbenFormSchema } from '#/adapter/form';

import { h } from 'vue';

import { Button } from 'ant-design-vue';

export const importSchema: VbenFormSchema[] = [
  {
    component: 'Upload',
    fieldName: 'fileList',
    label: '选择文件',
    componentProps: {
      accept: '.xlsx,.xls',
      maxCount: 1,
      multiple: false,
      showUploadList: true,
      beforeUpload: (_file: File) => false,
      onChange: (_info: any) => {},
    },
    renderComponentContent: () => ({
      default: () => {
        return h(Button, { type: 'primary' }, { default: () => '选择文件' });
      },
    }),
    rules: 'required',
    help: '仅支持 Excel（.xlsx / .xls），请使用「删失数据集导入配置」模板',
  },
  {
    component: 'Divider',
    fieldName: 'divider1',
    componentProps: {
      orientation: 'left',
      plain: true,
    },
  },
  {
    component: 'div',
    fieldName: 'usage_guide',
    label:
      '📋 模板说明：\n' +
      '1. 工作簿含两个 Sheet：「配置表」为数据区（后端仅解析此表）；「填表说明」仅供阅读。\n' +
      '2. 配置表列：运行时间（整数或小数）、状态标签（仅允许 failure 或 suspension）。\n' +
      '3. 选择文件后点击确定，数据由服务端解析并入库到当前项目。\n' +
      '4. 导入将覆盖本项目下已有删失数据集，请先备份或确认无误后再导入。\n\n' +
      '💡 请先下载 public 目录提供的模板，避免表头或 Sheet 名称不一致导致失败。',
  },
];
