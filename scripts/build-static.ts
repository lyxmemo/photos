import { cpSync, rmSync, existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import path from "path";

const ROOT = process.cwd();

// During static export, temporarily hide routes that only work in dev mode:
// - /api/* (server endpoints for admin CRUD + image serving)
// - /admin/* (upload & manage pages)
// - /photo/[id] (dynamic route — photos open in modal on static site)
const dirs = [
  { src: path.join(ROOT, "src/app/api"), bak: "/tmp/_photos_bak_api" },
  { src: path.join(ROOT, "src/app/admin"), bak: "/tmp/_photos_bak_admin" },
  { src: path.join(ROOT, "src/app/photo"), bak: "/tmp/_photos_bak_photo" },
];

function hide() {
  // Clear Next.js cache for a clean build
  const nextDir = path.join(ROOT, ".next");
  if (existsSync(nextDir)) {
    rmSync(nextDir, { recursive: true, force: true });
  }

  for (const { src, bak } of dirs) {
    if (existsSync(src)) {
      console.log(`Hiding ${path.relative(ROOT, src)}`);
      if (existsSync(bak)) rmSync(bak, { recursive: true, force: true });
      cpSync(src, bak, { recursive: true });
      rmSync(src, { recursive: true, force: true });
    }
  }
}

function restore() {
  for (const { src, bak } of dirs) {
    if (existsSync(bak)) {
      console.log(`Restoring ${path.relative(ROOT, src)}`);
      if (existsSync(src)) rmSync(src, { recursive: true, force: true });
      cpSync(bak, src, { recursive: true });
      rmSync(bak, { recursive: true, force: true });
    }
  }
}

function copyImages() {
  const imagesDir = path.join(ROOT, "data", "images");
  const outImagesDir = path.join(ROOT, "out", "images");

  if (existsSync(imagesDir)) {
    console.log("Copying images to out/images/");
    mkdirSync(outImagesDir, { recursive: true });
    cpSync(imagesDir, outImagesDir, { recursive: true });
  }
}

hide();
try {
  execSync("npx next build", {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, STATIC_EXPORT: "true" },
  });

  // Copy images from data/images/ into the static output
  copyImages();

  console.log("\nStatic site built successfully in out/");
} finally {
  restore();
}
