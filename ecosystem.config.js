const path = require("node:path");

module.exports = {
  apps: [
    {
      name: "geezplay-web",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "512M",
    },
    {
      name: "geezplay-api",
      cwd: path.join(__dirname, "server"),
      script: "dist/src/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      max_memory_restart: "512M",
    },
  ],
};
