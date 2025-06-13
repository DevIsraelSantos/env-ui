#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const open = require("open");

const nextDir = path.join(__dirname, "..");

const cwd = process.cwd();

const nextDev = spawn("npx", ["next", "dev"], {
  cwd: nextDir,
  stdio: ["inherit", "pipe", "pipe"],
  shell: true,
  env: {
    NEXT_PUBLIC_CALLER_PATH: cwd,
  },
});

let opened = false;
let host = null;

function tryOpen(msg) {
  const localUrlMatch = msg.match(/Local:\s+([^\s]+)/);
  if (localUrlMatch) {
    host = localUrlMatch[1];
  }

  if (!opened && msg.includes("✓ Ready") && host) {
    opened = true;
    open(host);
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
