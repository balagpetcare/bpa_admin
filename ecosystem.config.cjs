// PM2 production process manager config for BPA Admin (Next.js, next start).
// NOTE: cannot use `output: 'standalone'` — Next 16.0.8 bug with Edge
// middleware + standalone causes ENOENT (see DEPLOYMENT_LOG.md). Runs via
// `next start` instead. Env vars come from .env.production.local symlink
// (-> /srv/config/bpa/admin.env).
//
// Usage:
//   pm2 start ecosystem.config.cjs
//   pm2 logs bpa-admin
//   pm2 reload bpa-admin

module.exports = {
  apps: [
    {
      name: 'bpa-admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      },
      out_file: './logs/bpa-admin.out.log',
      error_file: './logs/bpa-admin.error.log',
      merge_logs: true,
      time: true,
    },
  ],
};
