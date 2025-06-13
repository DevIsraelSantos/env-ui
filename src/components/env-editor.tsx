"use client";

import { useNotificationContext } from "@/components/notification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { saveEnvFile, validateEnvFile } from "@/lib/env-actions";
import { parseEnvContent } from "@/lib/env-parser";
import type { EnvFile } from "@/lib/types";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { EnvVariableTable } from "./env-variable-table";

interface EnvEditorProps {
  file: EnvFile;
  content: string;
  onContentChange: (content: string) => void;
  onSaved: () => Promise<void>;
}

export function EnvEditor({
  file,
  content,
  onContentChange,
  onSaved,
}: EnvEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [editMode, setEditMode] = useState<"text" | "table">("text");
  const [parsedVariables, setParsedVariables] = useState<
    Record<string, string>
  >({});
  const { showNotification } = useNotificationContext();

  useEffect(() => {
    setParsedVariables(parseEnvContent(content));
  }, [content]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveEnvFile(file.name, content);
      await onSaved();
      showNotification({
        title: "Arquivo salvo",
        description: `Arquivo ${file.name} salvo com sucesso!`,
      });
    } catch (error) {
      showNotification({
        title: "Erro ao salvar arquivo",
        description: `Não foi possível salvar o arquivo: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationErrors([]);
    try {
      const result = await validateEnvFile(content);
      if (result.valid) {
        showNotification({
          title: "Arquivo válido",
          description: "Todas as variáveis obrigatórias estão presentes.",
        });
      } else {
        setValidationErrors(result.errors);
        showNotification({
          title: "Validação falhou",
          description: `Encontrados ${result.errors.length} problemas.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      showNotification({
        title: "Erro na validação",
        description: `Ocorreu um erro durante a validação: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleTableUpdate = (variables: Record<string, string>) => {
    // Converte o objeto de variáveis de volta para o formato de texto .env
    const newContent = Object.entries(variables)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
    onContentChange(newContent);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-medium">{file.name}</CardTitle>
          {file.isActive && (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Ativo
            </Badge>
          )}
          {file.isTemplate && (
            <Badge variant="outline" className="bg-secondary/10 text-secondary">
              Template
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={editMode === "text" ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode("text")}
          >
            Texto
          </Button>
          <Button
            variant={editMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode("table")}
          >
            Tabela
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {editMode === "text" ? (
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="font-mono text-sm h-[500px]"
            placeholder="KEY=value"
          />
        ) : (
          <EnvVariableTable
            variables={parsedVariables}
            onVariablesChange={handleTableUpdate}
          />
        )}

        {validationErrors.length > 0 && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <h4 className="font-medium text-destructive mb-2">
              Erros de validação:
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-destructive">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleValidate}
          disabled={isValidating}
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validando...
            </>
          ) : (
            "Validar"
          )}
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
