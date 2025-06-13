import { Button } from "@/components/ui/button";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

async function ReadFiles(dir: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

export default async function HomePage() {
  const currentPath = process.env.NEXT_PUBLIC_CALLER_PATH ?? "";
  let envVars: {
    file: string;
    vars?: Record<string, string>;
    error?: string;
    detail?: string;
  }[] = [];

  let files: string[] = [];

  files = await ReadFiles(currentPath);

  for (const file of files) {
    try {
      const envPath = path.join(currentPath, file);
      if (fs.existsSync(envPath)) {
        const parsed = dotenv.parse(fs.readFileSync(envPath));
        envVars.push({ file, vars: parsed });
      } else {
        envVars.push({
          file,
          error: `${file} not found`,
          detail: `The file ${file} does not exist in the directory.`,
        });
      }
    } catch (err) {
      envVars.push({
        file,
        error: `Failed to read ${file}`,
        detail: String(err),
      });
    }
  }

  return (
    <main>
      <Button>Default</Button>
      <Button variant={"destructive"}>Destructive</Button>
      <h1>Env UI</h1>
      <h2>Path:</h2>
      <pre>{currentPath}</pre>
      <h2>.env variables:</h2>
      <pre>{JSON.stringify(envVars, null, 2)}</pre>
    </main>
  );
}
