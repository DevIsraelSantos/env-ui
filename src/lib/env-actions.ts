"use server";

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { parseTemplateContent } from "./template-parser";
import type { EnvFile, ValidationResult } from "./types";

const environmentWorkspace = join(process.env.NEXT_PUBLIC_CALLER_PATH ?? "");

export async function listEnvFiles(): Promise<EnvFile[]> {
  try {
    const files = readdirSync(environmentWorkspace);
    const envFiles = files
      .filter((file) => file.startsWith(".env"))
      .map((file) => {
        const stats = statSync(join(environmentWorkspace, file));
        return {
          name: file,
          isActive: file === ".env",
          isTemplate: file === ".env.template",
          size: stats.size,
          lastModified: stats.mtimeMs,
        };
      })
      .sort((a, b) => {
        // Ordenar com .env primeiro, depois .env.template, depois os outros
        if (a.name === ".env.template") return -1;
        if (b.name === ".env.template") return 1;
        if (a.name === ".env") return -1;
        if (b.name === ".env") return 1;
        return a.name.localeCompare(b.name);
      });

    return envFiles;
  } catch (error) {
    console.error("Erro ao listar arquivos .env:", error);
    throw new Error("Não foi possível listar os arquivos .env");
  }
}

export async function getEnvFileContent(fileName: string): Promise<string> {
  try {
    const filePath = join(environmentWorkspace, fileName);
    if (!existsSync(filePath)) {
      if (fileName === ".env.template") {
        writeFileSync(filePath, "# Template de variáveis de ambiente\n");
      } else {
        throw new Error(`Arquivo ${fileName} não encontrado`);
      }
    }

    return readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error(`Erro ao ler arquivo ${fileName}:`, error);
    throw new Error(`Não foi possível ler o arquivo ${fileName}`);
  }
}

export async function saveEnvFile(
  fileName: string,
  content: string
): Promise<void> {
  try {
    const filePath = join(environmentWorkspace, fileName);
    writeFileSync(filePath, content);
  } catch (error) {
    console.error(`Erro ao salvar arquivo ${fileName}:`, error);
    throw new Error(`Não foi possível salvar o arquivo ${fileName}`);
  }
}

export async function activateEnvFile(fileName: string): Promise<void> {
  try {
    const sourcePath = join(environmentWorkspace, fileName);
    const targetPath = join(environmentWorkspace, ".env");

    if (!existsSync(sourcePath)) {
      throw new Error(`Arquivo ${fileName} não encontrado`);
    }

    const content = readFileSync(sourcePath, "utf-8");
    writeFileSync(targetPath, content);
  } catch (error) {
    console.error(`Erro ao ativar arquivo ${fileName}:`, error);
    throw new Error(`Não foi possível ativar o arquivo ${fileName}`);
  }
}

export async function createEnvFile(name: string): Promise<void> {
  try {
    const fileName = `.env.${name}`;
    const filePath = join(environmentWorkspace, fileName);

    if (existsSync(filePath)) {
      throw new Error(`Arquivo ${fileName} já existe`);
    }

    // Verificar se existe um arquivo .env.template para usar como base
    let content = "";
    const examplePath = join(environmentWorkspace, ".env.template");

    if (existsSync(examplePath)) {
      content = readFileSync(examplePath, "utf-8");
    }

    writeFileSync(filePath, content);
  } catch (error) {
    console.error(`Erro ao criar arquivo .env.${name}:`, error);
    throw new Error(`Não foi possível criar o arquivo .env.${name}`);
  }
}

export async function deleteEnvFile(fileName: string): Promise<void> {
  try {
    // Não permitir excluir o .env principal ou o template
    if (fileName === ".env" || fileName === ".env.template") {
      throw new Error(`Não é permitido excluir o arquivo ${fileName}`);
    }
    const dir = join(process.env.NEXT_PUBLIC_CALLER_PATH ?? "");
    const filePath = join(dir, fileName);

    if (!existsSync(filePath)) {
      throw new Error(`Arquivo ${fileName} não encontrado`);
    }

    // Excluir o arquivo
    const fs = await import("fs");
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(`Erro ao excluir arquivo ${fileName}:`, error);
    throw new Error(`Não foi possível excluir o arquivo ${fileName}`);
  }
}

export async function validateEnvFile(
  content: string
): Promise<ValidationResult> {
  try {
    const result: ValidationResult = {
      valid: true,
      errors: [],
    };

    // Carregar o template para validação
    const dir = join(process.env.NEXT_PUBLIC_CALLER_PATH ?? "");
    const templatePath = join(dir, ".env.template");
    if (!existsSync(templatePath)) {
      return result; // Se não há template, consideramos válido
    }

    const templateContent = readFileSync(templatePath, "utf-8");
    const { variables } = parseTemplateContent(templateContent);

    // Extrair variáveis do conteúdo fornecido
    const contentLines = content.split("\n");
    const contentVars = new Set<string>();

    for (const line of contentLines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const match = trimmedLine.match(/^([^=]+)=/);
        if (match) {
          contentVars.add(match[1].trim());
        }
      }
    }

    // Verificar variáveis obrigatórias
    for (const variable of variables) {
      if (variable.required && !contentVars.has(variable.key)) {
        result.valid = false;
        result.errors.push(
          `Variável obrigatória '${variable.key}' não encontrada`
        );
      }
    }

    return result;
  } catch (error) {
    console.error("Erro ao validar arquivo:", error);
    throw new Error("Não foi possível validar o arquivo");
  }
}
