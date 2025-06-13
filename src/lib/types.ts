export interface EnvFile {
  name: string;
  isActive: boolean;
  isTemplate: boolean;
  size: number;
  lastModified: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export type VariableType = "string" | "number" | "boolean" | "secret" | "url";

export interface TemplateVariable {
  key: string;
  description: string;
  type: VariableType;
  required: boolean;
  group: string;
}
