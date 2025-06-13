import type { TemplateVariable, VariableType } from "./types";

export function parseTemplateContent(content: string): {
  variables: TemplateVariable[];
  groups: string[];
} {
  const variables: TemplateVariable[] = [];
  const groups = new Set<string>();
  let currentGroup = "";

  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Verificar se é uma definição de grupo
    if (line.startsWith("# @group:")) {
      currentGroup = line.substring("# @group:".length).trim();
      groups.add(currentGroup);
      continue;
    }

    // Verificar se é uma linha de variável
    if (!line.startsWith("#") && line.includes("=")) {
      const keyValue = line.split("=", 2);
      const key = keyValue[0].trim();

      // Procurar por comentários acima desta linha
      let description = "";
      let type: VariableType = "string";
      let required = false;

      // Olhar para trás para encontrar comentários relacionados
      let j = i - 1;
      while (j >= 0 && lines[j].trim().startsWith("#")) {
        const comment = lines[j].trim();

        // Extrair tipo
        if (comment.includes("@type:")) {
          const typeMatch = comment.match(/@type:(\w+)/);
          if (typeMatch && isValidType(typeMatch[1])) {
            type = typeMatch[1] as VariableType;
          }
        }

        // Verificar se é obrigatório
        if (comment.includes("@required")) {
          required = true;
        }

        // Coletar descrição (comentários sem anotações especiais)
        if (
          !comment.includes("@type:") &&
          !comment.includes("@required") &&
          !comment.includes("@group:")
        ) {
          const desc = comment.substring(1).trim();
          if (desc) {
            description = desc + (description ? "\n" + description : "");
          }
        }

        j--;
      }

      variables.push({
        key,
        description,
        type,
        required,
        group: currentGroup,
      });
    }
  }

  return {
    variables,
    groups: Array.from(groups),
  };
}

export function serializeTemplateContent(
  variables: TemplateVariable[],
  groups: string[]
): string {
  let content = "# Template de variáveis de ambiente\n\n";

  // Agrupar variáveis por grupo
  const groupedVars: Record<string, TemplateVariable[]> = {};

  // Inicializar com grupos vazios
  groupedVars[""] = []; // Sem grupo
  for (const group of groups) {
    groupedVars[group] = [];
  }

  // Distribuir variáveis nos grupos
  for (const variable of variables) {
    const group = variable.group || "";
    if (!groupedVars[group]) {
      groupedVars[group] = [];
    }
    groupedVars[group].push(variable);
  }

  // Gerar conteúdo para cada grupo
  for (const group of ["", ...groups]) {
    const vars = groupedVars[group];
    if (vars.length === 0) continue;

    if (group) {
      content += `\n# @group:${group}\n`;
    }

    for (const variable of vars) {
      // Adicionar descrição
      if (variable.description) {
        const descLines = variable.description.split("\n");
        for (const line of descLines) {
          content += `# ${line}\n`;
        }
      }

      // Adicionar metadados
      let metaLine = `# @type:${variable.type}`;
      if (variable.required) {
        metaLine += " @required";
      }
      content += `${metaLine}\n`;

      // Adicionar a variável
      content += `${variable.key}=\n\n`;
    }
  }

  return content;
}

function isValidType(type: string): boolean {
  return ["string", "number", "boolean", "secret", "url"].includes(type);
}
