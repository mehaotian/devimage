/**
 * PM2 进程配置（生产）
 * 用法：pnpm deploy:start 或 pm2 start deploy/ecosystem.config.cjs
 */
module.exports = {
  apps: [
    {
      name: 'devimage-api',
      cwd: `${__dirname}/../apps/api`,
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || '3010',
      },
      max_memory_restart: '400M',
      time: true,
      error_file: `${__dirname}/../logs/pm2-error.log`,
      out_file: `${__dirname}/../logs/pm2-out.log`,
      merge_logs: true,
    },
  ],
};
