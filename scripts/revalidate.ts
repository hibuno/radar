#!/usr/bin/env bun

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (!REVALIDATION_SECRET) {
  console.error("❌ REVALIDATION_SECRET environment variable is required");
  console.log("💡 Add REVALIDATION_SECRET to your .env file");
  process.exit(1);
}

interface RevalidationOptions {
  path?: string;
  paths?: string[];
  verbose?: boolean;
}

async function revalidatePath(path: string, verbose = false): Promise<boolean> {
  try {
    if (verbose) {
      console.log(`🔄 Revalidating: ${path}`);
    }

    const response = await fetch(`${APP_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: REVALIDATION_SECRET,
        path,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ ${path}: ${result.message}`);
      return true;
    } else {
      console.error(`❌ ${path}: ${result.message}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ ${path}: Error during revalidation:`, error);
    return false;
  }
}

async function revalidateMultiplePaths(options: RevalidationOptions = {}) {
  const { path = "/", paths = [], verbose = false } = options;

  // Determine which paths to revalidate
  const pathsToRevalidate = paths.length > 0 ? paths : [path];

  console.log(
    `🚀 Starting revalidation for ${pathsToRevalidate.length} path(s)...`
  );
  console.log(`🌐 Target URL: ${APP_URL}`);

  const results = await Promise.all(
    pathsToRevalidate.map((p) => revalidatePath(p, verbose))
  );

  const successful = results.filter(Boolean).length;
  const failed = results.length - successful;

  console.log("\n📊 Revalidation Summary:");
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: RevalidationOptions = {
  verbose: args.includes("--verbose") || args.includes("-v"),
};

// Handle specific paths
const pathIndex = args.findIndex((arg) => arg === "--path" || arg === "-p");
if (pathIndex !== -1 && args[pathIndex + 1]) {
  options.path = args[pathIndex + 1];
}

// Handle multiple paths
const pathsIndex = args.findIndex((arg) => arg === "--paths");
if (pathsIndex !== -1 && args[pathsIndex + 1]) {
  options.paths = args[pathsIndex + 1].split(",").map((p) => p.trim());
}

// Show help
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
🔄 Next.js Revalidation Script

Usage:
  bun run scripts/revalidate.ts [options]

Options:
  -p, --path <path>     Revalidate a specific path (default: /)
  --paths <paths>       Revalidate multiple paths (comma-separated)
  -v, --verbose         Show detailed output
  -h, --help           Show this help message

Examples:
  bun run scripts/revalidate.ts                    # Revalidate home page
  bun run scripts/revalidate.ts -p /about          # Revalidate /about page
  bun run scripts/revalidate.ts --paths /,/about   # Revalidate multiple pages
  bun run scripts/revalidate.ts -v                 # Verbose output

Environment Variables:
  REVALIDATION_SECRET   Secret token for revalidation (required)
  NEXT_PUBLIC_APP_URL   Your app URL (default: http://localhost:3000)
`);
  process.exit(0);
}

revalidateMultiplePaths(options);
