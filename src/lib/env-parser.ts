export function parseEnvContent(content: string): Record<string, string> {
  const variables: Record<string, string> = {};

  const lines = content.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Ignorar linhas vazias e comentários
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    // Extrair chave e valor
    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2];
      variables[key] = value;
    }
  }

  return variables;
}
