#!/usr/bin/env node

/**
 * RoomMate Workspace Onboarding & Setup Script
 * Automates environment setup, git hooks configuration, database client generation,
 * and Docker container provisioning with schema migration and seeding.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Command line flag parsing
const args = process.argv.slice(2);
const skipDocker = args.includes("--skip-docker");
const forceEnv = args.includes("--force");

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
RoomMate Developer Setup Script

Usage:
  npm run setup [options]

Options:
  --skip-docker   Skip Docker container provisioning, schema push, and seeding
  --force         Overwrite existing .env files with fresh templates
  --help, -h      Show this help message
`);
  process.exit(0);
}

console.log("\n🏠 Welcome to RoomMate! Starting local workspace setup...\n");

// 1. Verify Node.js runtime version
const [major] = process.versions.node.split(".").map(Number);
if (major < 20) {
  console.warn(
    `⚠️ Warning: Detected Node.js v${process.versions.node}. Node.js 20+ is strongly recommended.\n`,
  );
} else {
  console.log(`✅ [1/5] Node.js runtime: v${process.versions.node}`);
}

// 2. Configure Git Hooks (.githooks)
try {
  execSync("git config core.hooksPath .githooks", {
    cwd: rootDir,
    stdio: "ignore",
  });
  const preCommitHook = path.join(rootDir, ".githooks", "pre-commit");
  if (fs.existsSync(preCommitHook)) {
    try {
      fs.chmodSync(preCommitHook, 0o755);
    } catch {
      // Non-fatal on filesystems that don't support chmod
    }
  }
  console.log(
    "✅ [2/5] Git hooks configured to use .githooks/ directory (pre-commit active).",
  );
} catch {
  console.log(
    "ℹ️ [2/5] Git directory not detected or git config skipped (safe to continue).",
  );
}

// 3. Environment files initialization
console.log("📝 [3/5] Provisioning environment configuration (.env) files...");
const envFiles = [
  { example: ".env.example", target: ".env", label: "Root Docker Compose" },
  {
    example: "roommate-server/.env.example",
    target: "roommate-server/.env",
    label: "Backend Server",
  },
  {
    example: "roommate-app/.env.example",
    target: "roommate-app/.env",
    label: "Frontend Client",
  },
];

for (const { example, target, label } of envFiles) {
  const examplePath = path.join(rootDir, example);
  const targetPath = path.join(rootDir, target);

  if (fs.existsSync(targetPath) && !forceEnv) {
    console.log(`    ℹ️ [${label}] .env already exists at ${target}`);
  } else if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, targetPath);
    console.log(`    ✅ [${label}] Created ${target} from ${example}`);
  } else {
    console.warn(`    ⚠️ [${label}] Template not found: ${example}`);
  }
}

// 4. Generate Prisma Client
console.log("📦 [4/5] Generating Prisma ORM Client...");
try {
  execSync("npm run prisma:generate --workspace=roommate-server", {
    cwd: rootDir,
    stdio: "ignore",
  });
  console.log(
    "    ✅ Prisma client generated successfully (types available in IDE).",
  );
} catch (error) {
  console.warn(
    "    ⚠️ Prisma client generation encountered a non-fatal warning:",
    error.message,
  );
}

// 5. Docker Infrastructure & Database Initialization
console.log("🐳 [5/5] Checking Docker & Database infrastructure...");

let dockerAvailable = false;

if (!skipDocker) {
  try {
    // Check if Docker daemon is running
    execSync("docker info", { stdio: "ignore" });
    dockerAvailable = true;
  } catch {
    dockerAvailable = false;
  }
}

if (dockerAvailable) {
  try {
    console.log(
      "    🐳 Docker daemon active. Starting PostgreSQL and Redis containers...",
    );
    execSync("docker compose up -d db redis", {
      cwd: rootDir,
      stdio: "inherit",
    });

    console.log("    ⏳ Waiting for PostgreSQL container to become ready...");
    let ready = false;
    for (let i = 0; i < 15; i++) {
      try {
        execSync(
          "docker compose exec -T db pg_isready -U postgres -d roommate",
          {
            cwd: rootDir,
            stdio: "ignore",
          },
        );
        ready = true;
        break;
      } catch {
        execSync("sleep 1");
      }
    }

    if (ready) {
      console.log("    ✅ PostgreSQL is healthy and accepting connections.");

      console.log("    🔄 Synchronizing Prisma schema to database...");
      execSync(
        "npx prisma db push --schema=roommate-server/prisma/schema.prisma",
        {
          cwd: rootDir,
          stdio: "inherit",
        },
      );

      console.log("    🌱 Seeding database with idempotent mock data...");
      execSync("npm run db:seed:idempotent --workspace=roommate-server", {
        cwd: rootDir,
        stdio: "inherit",
      });
      console.log("    ✅ Database initialized and seeded successfully.");
    } else {
      console.warn(
        "    ⚠️ PostgreSQL took too long to become healthy; skipped automated seeding.",
      );
    }
  } catch (error) {
    console.warn(
      "    ⚠️ Docker service startup encountered an error:",
      error.message,
    );
    console.log("    ℹ️ You can still run the app using: npm run dev");
  }
} else {
  if (skipDocker) {
    console.log(
      "    ℹ️ Docker provisioning skipped (--skip-docker flag provided).",
    );
  } else {
    console.log("    ℹ️ Docker daemon is not active or running.");
    console.log(
      '    💡 Tip: Start Docker Desktop and re-run "npm run setup" to auto-seed database,',
    );
    console.log(
      '       or run "npm run dev" when you are ready to boot with Docker.',
    );
  }
}

// Summary Dashboard
console.log(`
================================================================================
🎉 RoomMate Workspace Setup Complete!
================================================================================

To start developing:
  $ npm run dev
    - 🌐 Frontend:    http://localhost:5173
    - 🚀 Backend:     http://localhost:5000
    - 🗄️  Prisma Studio: http://localhost:5555

Quality & Verification checks:
  $ npm test          # Runs all Vitest test suites
  $ npm run lint      # Runs ESLint across workspaces
  $ npm run type-check # Runs TypeScript type checker

Note: Pre-commit hook is active. It will auto-format with Prettier, auto-fix
linting, verify types, and run tests before any commit is finalized.

Happy coding! 🚀
================================================================================
`);
