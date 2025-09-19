import type { RequestClient } from '../request-client';
import type { RequestClientConfig } from '../types';

import { isUndefined } from '@vben/utils';

class FileUploader {
  private client: RequestClient;

  constructor(client: RequestClient) {
    this.client = client;
  }

  public async upload<T = any>(
    url: string,
    data: Record<string, any> & { file: Blob | File },
    config?: RequestClientConfig,
  ): Promise<T> {
    console.log('FileUploader.upload 开始:', { url, data });

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          !isUndefined(item) && formData.append(`${key}[${index}]`, item);
        });
      } else {
        !isUndefined(value) && formData.append(key, value);
      }
    });

    // 调试FormData内容
    console.log('FileUploader FormData内容:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
      if (value instanceof File) {
        console.log(`${key} 文件名:`, value.name);
        console.log(`${key} 文件大小:`, value.size);
      }
    }

    const finalConfig: RequestClientConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    };

    console.log('FileUploader 最终配置:', finalConfig);
    console.log('FileUploader 发送请求到:', url);

    return this.client.post(url, formData, finalConfig);
  }
}

export { FileUploader };
