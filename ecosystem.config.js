// PM2 Ecosystem Config
// Used for the non-Docker deployment approach.
//
// Usage:
//   pm2 start ecosystem.config.js
//   pm2 save
//   pm2 startup   (auto-start on server reboot)
//
// Useful commands:
//   pm2 logs elnadhour-api
//   pm2 restart elnadhour-api
//   pm2 status

module.exports = {
  apps: [
    {
      name: 'elnadhour-api',
      cwd: './backend',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
