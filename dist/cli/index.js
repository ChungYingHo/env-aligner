#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS({
  "node_modules/picocolors/picocolors.js"(exports, module) {
    "use strict";
    var p = process || {};
    var argv = p.argv || [];
    var env = p.env || {};
    var isColorSupported = !(!!env.NO_COLOR || argv.includes("--no-color")) && (!!env.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || (p.stdout || {}).isTTY && env.TERM !== "dumb" || !!env.CI);
    var formatter = (open, close, replace = open) => (input) => {
      let string = "" + input, index = string.indexOf(close, open.length);
      return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
    };
    var replaceClose = (string, close, replace, index) => {
      let result = "", cursor = 0;
      do {
        result += string.substring(cursor, index) + replace;
        cursor = index + close.length;
        index = string.indexOf(close, cursor);
      } while (~index);
      return result + string.substring(cursor);
    };
    var createColors = (enabled = isColorSupported) => {
      let f = enabled ? formatter : () => String;
      return {
        isColorSupported: enabled,
        reset: f("\x1B[0m", "\x1B[0m"),
        bold: f("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
        dim: f("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
        italic: f("\x1B[3m", "\x1B[23m"),
        underline: f("\x1B[4m", "\x1B[24m"),
        inverse: f("\x1B[7m", "\x1B[27m"),
        hidden: f("\x1B[8m", "\x1B[28m"),
        strikethrough: f("\x1B[9m", "\x1B[29m"),
        black: f("\x1B[30m", "\x1B[39m"),
        red: f("\x1B[31m", "\x1B[39m"),
        green: f("\x1B[32m", "\x1B[39m"),
        yellow: f("\x1B[33m", "\x1B[39m"),
        blue: f("\x1B[34m", "\x1B[39m"),
        magenta: f("\x1B[35m", "\x1B[39m"),
        cyan: f("\x1B[36m", "\x1B[39m"),
        white: f("\x1B[37m", "\x1B[39m"),
        gray: f("\x1B[90m", "\x1B[39m"),
        bgBlack: f("\x1B[40m", "\x1B[49m"),
        bgRed: f("\x1B[41m", "\x1B[49m"),
        bgGreen: f("\x1B[42m", "\x1B[49m"),
        bgYellow: f("\x1B[43m", "\x1B[49m"),
        bgBlue: f("\x1B[44m", "\x1B[49m"),
        bgMagenta: f("\x1B[45m", "\x1B[49m"),
        bgCyan: f("\x1B[46m", "\x1B[49m"),
        bgWhite: f("\x1B[47m", "\x1B[49m"),
        blackBright: f("\x1B[90m", "\x1B[39m"),
        redBright: f("\x1B[91m", "\x1B[39m"),
        greenBright: f("\x1B[92m", "\x1B[39m"),
        yellowBright: f("\x1B[93m", "\x1B[39m"),
        blueBright: f("\x1B[94m", "\x1B[39m"),
        magentaBright: f("\x1B[95m", "\x1B[39m"),
        cyanBright: f("\x1B[96m", "\x1B[39m"),
        whiteBright: f("\x1B[97m", "\x1B[39m"),
        bgBlackBright: f("\x1B[100m", "\x1B[49m"),
        bgRedBright: f("\x1B[101m", "\x1B[49m"),
        bgGreenBright: f("\x1B[102m", "\x1B[49m"),
        bgYellowBright: f("\x1B[103m", "\x1B[49m"),
        bgBlueBright: f("\x1B[104m", "\x1B[49m"),
        bgMagentaBright: f("\x1B[105m", "\x1B[49m"),
        bgCyanBright: f("\x1B[106m", "\x1B[49m"),
        bgWhiteBright: f("\x1B[107m", "\x1B[49m")
      };
    };
    module.exports = createColors();
    module.exports.createColors = createColors;
  }
});

// src/cli/index.ts
import { program } from "commander";
import { createRequire } from "module";

// src/cli/commands/check.ts
import path from "path";

// src/core/parser.ts
import { readFileSync } from "fs";
import { parse } from "dotenv";
function parseEnvFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  return parse(content);
}
function parseEnvRaw(filePath) {
  const lines = readFileSync(filePath, "utf8").split("\n");
  const result = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    result[key] = value;
  }
  return result;
}

// src/core/checker.ts
function checkEnv(schemaPath, envPath) {
  const schemaVars = parseEnvFile(schemaPath);
  const envVars = parseEnvFile(envPath);
  const envRaw = parseEnvRaw(envPath);
  const schemaKeys = Object.keys(schemaVars);
  const envKeys = Object.keys(envVars);
  const missing = schemaKeys.filter((key) => !envKeys.includes(key));
  const empty = schemaKeys.filter((key) => {
    if (!envKeys.includes(key)) return false;
    const rawValue = envRaw[key] ?? "";
    if (rawValue === "''" || rawValue === '""') return false;
    const parsed = envVars[key];
    const isQuoted = parsed.startsWith('"') || parsed.startsWith("'");
    const valueWithoutComment = !isQuoted ? parsed.split("#")[0].trim() : parsed.trim();
    return valueWithoutComment === "";
  });
  const extra = envKeys.filter((key) => !schemaKeys.includes(key));
  return {
    missing,
    empty,
    extra,
    passed: missing.length === 0 && empty.length === 0
  };
}

// src/utils/fs.ts
import { promises as fs } from "fs";
async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

// src/utils/logger.ts
var import_picocolors = __toESM(require_picocolors(), 1);
var logger = {
  success: (msg) => console.log(import_picocolors.default.green(msg)),
  info: (msg) => console.log(import_picocolors.default.blue(msg)),
  warn: (msg) => console.warn(import_picocolors.default.yellow(msg)),
  error: (msg) => console.error(import_picocolors.default.red(msg)),
  label: {
    error: (msg) => console.error(import_picocolors.default.bgRed(import_picocolors.default.white(msg))),
    warn: (msg) => console.warn(import_picocolors.default.bgYellow(import_picocolors.default.white(msg))),
    info: (msg) => console.log(import_picocolors.default.bgBlue(import_picocolors.default.white(msg))),
    success: (msg) => console.log(import_picocolors.default.bgGreen(import_picocolors.default.white(msg)))
  }
};

// src/cli/commands/check.ts
async function checkCommand(opts) {
  const schemaPath = path.join(opts.dir, opts.schema);
  const envPath = path.join(opts.dir, opts.env);
  if (!await fileExists(schemaPath)) {
    logger.error(`\u274C Schema file not found: ${schemaPath}`);
    process.exit(2);
  }
  if (!await fileExists(envPath)) {
    logger.error(`\u274C Env file not found: ${envPath}`);
    logger.info(`   Run "env-aligner init" to create it.`);
    process.exit(2);
  }
  const result = checkEnv(schemaPath, envPath);
  if (result.missing.length > 0) {
    logger.label.error(` [Missing Variables] `);
    logger.error(`\u2192 ${result.missing.join(", ")}`);
  }
  if (result.empty.length > 0) {
    logger.label.warn(` [Empty Variables] `);
    logger.warn(`\u2192 ${result.empty.join(", ")}`);
  }
  if (result.extra.length > 0) {
    logger.label.info(` [Extra Variables] `);
    logger.info(`\u2192 ${result.extra.join(", ")}`);
  }
  if (!result.passed) {
    logger.error(`
\u274C Check failed. Run "env-aligner fix" to auto-fix.`);
    process.exit(1);
  }
  logger.success(`
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F389} SUCCESS! ENV CHECK PASSED

\u2705 All required variables are present in:
   ${opts.dir}
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
}

// src/cli/commands/init.ts
import path2 from "path";

// src/core/cloner.ts
import { promises as fs2 } from "fs";
async function cloneEnv(schemaPath, envPath) {
  if (!await fileExists(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }
  if (await fileExists(envPath)) {
    return false;
  }
  await fs2.copyFile(schemaPath, envPath);
  return true;
}

// src/cli/commands/init.ts
async function initCommand(opts) {
  const schemaPath = path2.join(opts.dir, opts.schema);
  const envPath = path2.join(opts.dir, opts.env);
  try {
    const created = await cloneEnv(schemaPath, envPath);
    if (created) {
      logger.success(`\u2705 Created ${opts.env} from ${opts.schema} in ${opts.dir}`);
    } else {
      logger.info(`\u2139\uFE0F  ${opts.env} already exists in ${opts.dir}, skipping.`);
    }
  } catch (err) {
    logger.error(`\u274C ${err.message}`);
    process.exit(2);
  }
}

// src/cli/commands/fix.ts
import path3 from "path";

// src/core/fixer.ts
import { readFileSync as readFileSync2, writeFileSync } from "fs";
import { parse as parse2 } from "dotenv";
function fixEnv(schemaPath, envPath) {
  const schemaRaw = readFileSync2(schemaPath, "utf8");
  const schemaVars = parse2(schemaRaw);
  const schemaKeys = Object.keys(schemaVars);
  const envRaw = parseEnvRaw(envPath);
  const envKeys = Object.keys(envRaw);
  const added = [];
  const removed = envKeys.filter((key) => !schemaKeys.includes(key));
  const schemaLines = schemaRaw.split(/\r?\n/);
  const outputLines = [];
  for (const line of schemaLines) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      outputLines.push(line);
      continue;
    }
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    if (!(key in schemaVars)) continue;
    if (key in envRaw) {
      outputLines.push(`${key}=${envRaw[key]}`);
    } else {
      const schemaValue = schemaVars[key];
      outputLines.push(`${key}=${schemaValue} # TODO`);
      added.push(key);
    }
  }
  const originalEnvKeys = envKeys;
  const reordered = added.length > 0 || removed.length > 0 || !schemaKeys.every((k, i) => originalEnvKeys[i] === k);
  writeFileSync(envPath, outputLines.join("\n"), "utf8");
  return { added, removed, reordered };
}

// src/cli/commands/fix.ts
async function fixCommand(opts) {
  const schemaPath = path3.join(opts.dir, opts.schema);
  const envPath = path3.join(opts.dir, opts.env);
  if (!await fileExists(schemaPath)) {
    logger.error(`\u274C Schema file not found: ${schemaPath}`);
    process.exit(2);
  }
  if (!await fileExists(envPath)) {
    logger.error(`\u274C Env file not found: ${envPath}`);
    logger.info(`   Run "env-aligner init" to create it.`);
    process.exit(2);
  }
  try {
    const result = fixEnv(schemaPath, envPath);
    if (result.added.length > 0) {
      logger.label.warn(` [Added Keys] `);
      logger.warn(`\u2192 ${result.added.join(", ")}`);
      logger.warn(`  (marked with # TODO \u2014 please fill in actual values)`);
    }
    if (result.removed.length > 0) {
      logger.label.info(` [Removed Keys] `);
      logger.info(`\u2192 ${result.removed.join(", ")}`);
    }
    const hasChanges = result.added.length > 0 || result.removed.length > 0 || result.reordered;
    if (hasChanges) {
      logger.success(`
\u2705 ${opts.env} has been fixed and aligned with ${opts.schema}`);
    } else {
      logger.success(`
\u2705 ${opts.env} is already in sync with ${opts.schema} \u2014 no changes needed.`);
    }
  } catch (err) {
    logger.error(`\u274C ${err.message}`);
    process.exit(2);
  }
}

// src/cli/index.ts
var require2 = createRequire(import.meta.url);
var { version } = require2("../../package.json");
var SHARED_OPTIONS = [
  ["--dir <directory>", "Root directory to scan", process.cwd()],
  ["--schema <file>", "Schema file name", ".env.example"],
  ["--env <file>", "Env file name", ".env"]
];
program.name("env-aligner").description("A CLI tool to initialize, check, and fix .env files against a schema.").version(version, "-v", "--version").showSuggestionAfterError();
program.command("init").description("Create .env from schema (.env.example). Skips if .env already exists.").option(SHARED_OPTIONS[0][0], SHARED_OPTIONS[0][1], SHARED_OPTIONS[0][2]).option(SHARED_OPTIONS[1][0], SHARED_OPTIONS[1][1], SHARED_OPTIONS[1][2]).option(SHARED_OPTIONS[2][0], SHARED_OPTIONS[2][1], SHARED_OPTIONS[2][2]).action(initCommand);
program.command("check", { isDefault: true }).description("Check .env against schema and report missing, empty, or extra variables. (default command)").option(SHARED_OPTIONS[0][0], SHARED_OPTIONS[0][1], SHARED_OPTIONS[0][2]).option(SHARED_OPTIONS[1][0], SHARED_OPTIONS[1][1], SHARED_OPTIONS[1][2]).option(SHARED_OPTIONS[2][0], SHARED_OPTIONS[2][1], SHARED_OPTIONS[2][2]).addHelpText("after", `
  Tip: Add to package.json to run before dev:
    "predev": "env-aligner check"
  `).action(checkCommand);
program.command("fix").description("Auto-fix .env: add missing keys (with # TODO), remove extra keys, align order to schema.").option(SHARED_OPTIONS[0][0], SHARED_OPTIONS[0][1], SHARED_OPTIONS[0][2]).option(SHARED_OPTIONS[1][0], SHARED_OPTIONS[1][1], SHARED_OPTIONS[1][2]).option(SHARED_OPTIONS[2][0], SHARED_OPTIONS[2][1], SHARED_OPTIONS[2][2]).action(fixCommand);
program.parse(process.argv);
