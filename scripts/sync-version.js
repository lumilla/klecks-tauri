#!/usr/bin/env node
// Keep tauri.conf.json and Cargo.toml in sync with
// the version declared in the root package.json.
//
// Run via:  node scripts/sync-version.js
// Also invoked automatically as part of `npm run build`.

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// package.json
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf-8"));
const version = pkg.version;

if (!version) {
  console.error('ERROR: No "version" field found in package.json');
  process.exit(1);
}

console.log(`Syncing version ${version} with tauri.conf.json, Cargo.toml`);

// tauri.conf.json
const tauriConfPath = resolve(root, "src-tauri", "tauri.conf.json");
const tauriConf = JSON.parse(readFileSync(tauriConfPath, "utf-8"));

if (tauriConf.version !== version) {
  tauriConf.version = version;
  writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n");
  console.log(`tauri.conf.json updated`);
} else {
  console.log(`tauri.conf.json already up-to-date`);
}

const cargoPath = resolve(root, "src-tauri", "Cargo.toml");
let cargo = readFileSync(cargoPath, "utf-8");

// Match the version line under [package] and replace it with the new version.
const cargoVersionRe = /^(version\s*=\s*)"[^"]*"/m;
const newCargo = cargo.replace(cargoVersionRe, `$1"${version}"`);

if (newCargo !== cargo) {
  writeFileSync(cargoPath, newCargo);
  console.log(`Cargo.toml updated`);
} else {
  console.log(`Cargo.toml already up-to-date`);
}
