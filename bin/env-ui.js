#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const open = require("open");

const nextDir = path.join(__dirname, "..");
const PORT = 3000;

const nextDev = spawn("npx", ["next", "dev", "-p", PORT], {
  cwd: nextDir,
  stdio: ["inherit", "pipe", "pipe"],
  shell: true,
});

let opened = false;

function tryOpen(msg) {
  if (!opened && msg.includes("✓ Ready")) {
    opened = true;
    open(`http://localhost:${PORT}`);
  }
}

nextDev.stdout.on("data", (data) => {
  const msg = data.toString();
  process.stdout.write(msg);
  tryOpen(msg);
});

nextDev.stderr.on("data", (data) => {
  const msg = data.toString();
  process.stderr.write(msg);
  tryOpen(msg);
});

nextDev.on("exit", (code) => {
  process.exit(code);
});
