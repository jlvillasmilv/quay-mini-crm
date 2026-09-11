#!/usr/bin/env node
/**
 * Wrapper para `npm run migration:generate`.
 *
 * TypeORM places the generated migration in the directory specified as
 * a positional argument (`dirname(path)`) and uses `basename(path)` as the name
 * of both the file and the class. To avoid having to type the folder name every time,
 * this script automatically prepends the migrations directory to the name
 * provided by the user.
 *
 * Uso:
 *   npm run migration:generate -- CreateUsersTable
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const MIGRATIONS_DIR = "src/database/migrations";
const DATA_SOURCE = "src/database/data-source.ts";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(
    [
      "Use: npm run migration:generate -- <NombreDeLaMigracion>",
      "Example: npm run migration:generate -- CreateUsersTable",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

const name = args.join("-");
const migrationPath = path.posix.join(MIGRATIONS_DIR, name);

const result = spawnSync(
  "npm",
  [
    "run",
    "typeorm",
    "--",
    "migration:generate",
    "-d",
    DATA_SOURCE,
    migrationPath,
  ],
  { cwd: projectRoot, stdio: "inherit", shell: process.platform === "win32" },
);

process.exit(result.status === null ? 1 : result.status);
