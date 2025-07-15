import type { DistributionStrategy } from '../strategies/types';

import {
  Exponential1P,
  Exponential2P,
  Gamma2P,
  Gamma3P,
  Gumbel2P,
  Loglogistic2P,
  Loglogistic3P,
  Lognormal2P,
  Lognormal3P,
  Normal2P,
  Weibull2P,
  Weibull3P,
} from '../strategies';

const DistributionFactory = {
  createStrategy(data: any): DistributionStrategy {
    if (!data.distribution) {
      throw new Error('无效的分布数据: 缺少distribution字段');
    }

    switch (data.distribution) {
      case 'Exponential_1P': {
        return new Exponential1P(data.lambda_);
      }
      case 'Exponential_2P': {
        return new Exponential2P(data.lambda_, data.gamma);
      }
      case 'Gamma_2P': {
        return new Gamma2P(data.alpha, data.beta);
      }
      case 'Gamma_3P': {
        return new Gamma3P(data.alpha, data.beta, data.gamma);
      }
      case 'Gumbel_2P': {
        return new Gumbel2P(data.mu, data.sigma);
      }
      case 'Loglogistic_2P': {
        return new Loglogistic2P(data.alpha, data.beta);
      }
      case 'Loglogistic_3P': {
        return new Loglogistic3P(data.alpha, data.beta, data.gamma);
      }
      case 'Lognormal_2P': {
        return new Lognormal2P(data.mu, data.sigma);
      }
      case 'Lognormal_3P': {
        return new Lognormal3P(data.mu, data.sigma, data.gamma);
      }
      case 'Normal_2P': {
        return new Normal2P(data.mu, data.sigma);
      }
      case 'Weibull_2P': {
        return new Weibull2P(data.alpha, data.beta);
      }
      case 'Weibull_3P': {
        return new Weibull3P(data.alpha, data.beta, data.gamma);
      }
      default: {
        throw new Error(`不支持的分布类型: ${data.distribution}`);
      }
    }
  },
};

export default DistributionFactory;
