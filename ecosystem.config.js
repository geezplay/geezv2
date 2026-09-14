const path = require("node:path");

module.exports = {
  apps: [
    {
      name: "geezplay-web",
      cwd: __dirname,
      script: "npm",
      args: "run start",
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
