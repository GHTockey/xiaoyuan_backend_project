/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * 读取：ctx.app.config.模块名.键
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // 用于 cookie 签名密钥, 应更改为您自己的并保持安全
  config.keys = appInfo.name + '_1672667215718_5729';

  // 在此处添加全局中间件
  // config.middleware = ['refToStr'];

  // 在此处添加用户配置
  const userConfig = {
    // myAppName: 'egg',
  };

  config.io = {
    namespace: {
      '/': {
        connectionMiddleware: ['auth'], // 连接和断开
        packetMiddleware: ['filter'],
      },
    },
  }

  // 关闭 csrf 安全验证
  config.security = {
    csrf: {
      enable: false,
    },
  };
  // 跨域
  config.cors = {
    origin: '*', // 允许跨域访问，或者白名单
    credentials: true, // 允许跨域携带cookie
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  };

  // token 安全字符串
  config.jwt = {
    secret: "China"
  };

  // mysql 配置
  config.mysql = {
    client: {
      host: '1.15.48.103',
      port: '3306',
      user: 'campus',
      password: 'EYCsxBY4CZTXJGMd',
      database: 'campus',
    }
  };

  // 腾讯云 cos
  config.tencentCloudCos = {
    client: {
      SecretId: 'AKID4zg8LK4jASXNzMdfS1LdgV5Um04va4KL',
      SecretKey: 'ta9XnpcBZnpfLtHSRDoDPRGrHXZMuEJA',
      defaultParams: {
        Bucket: 'campus-1312676635',
        Region: 'ap-shanghai',
      }
    }
  };

  // config.multipart = {
  // mode: "stream",
  // 为了保证文件上传的安全，框架限制了支持的的文件格式
  // 可以通过 fileExtensions 新增支持的文件扩展名
  // fileExtensions:['.??']
  // };


  //  端口
  config.cluster = {
    listen: {
      // path: '',
      port: 7001
    }
  };

  return {
    ...config,
    ...userConfig,
  };
};
