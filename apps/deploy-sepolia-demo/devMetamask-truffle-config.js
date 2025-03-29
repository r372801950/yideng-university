/**
 * 使用Truffle Dashboard配置，无需Infura和助记词
 */

module.exports = {
  networks: {
    // 本地开发网络配置保持不变
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },

    // Truffle Dashboard配置
    dashboard: {
      port: 24012,
      network_id: "*"
    }
  },

  // mocha设置保持不变
  mocha: {
    timeout: 100000
  },

  // 编译器设置保持不变
  compilers: {
    solc: {
      version: "0.8.21",
    }
  }
};