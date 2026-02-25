import { execSync } from "child_process";

function run(cmd: string): string {
  console.log(`> ${cmd}`);
  return execSync(cmd, { stdio: "pipe" }).toString().trim();
}

function runVisible(cmd: string): void {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function main() {
  console.log("Publishing photos...\n");

  // Stage photo data and images
  runVisible("git add data/photos.json");
  runVisible("git add public/images/");

  // Check if there are changes to commit
  try {
    execSync("git diff --cached --quiet");
    console.log("No changes to publish.");
    return;
  } catch {
    // There are staged changes, continue
  }

  // Commit
  const date = new Date().toISOString().split("T")[0];
  runVisible(`git commit -m "Update photos ${date}"`);

  // Push
  const branch = run("git rev-parse --abbrev-ref HEAD");
  console.log(`\nPushing to ${branch}...`);
  runVisible(`git push origin ${branch}`);

  console.log("\nPublished! GitHub Actions will build and deploy the site.");
}

main();
