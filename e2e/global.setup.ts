import { execSync } from "node:child_process";

function run(command: string) {
  execSync(command, { stdio: "inherit", env: process.env });
}

export default async function globalSetup() {
  run("npx prisma migrate reset --force --skip-generate");
  run("npm run db:seed");
}

