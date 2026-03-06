module.exports = {
  apps: [
    {
      name: "source-of-clarity",
      cwd: "/home/agent/cocoa007/source-of-clarity",
      script: "node_modules/.bin/next",
      args: "start",
      env: {
        DATABASE_URL: "postgres://agent@/source_of_clarity?host=/var/run/postgresql",
        NODE_ENV: "production",
        PORT: "3000",
      },
      max_memory_restart: "512M",
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
