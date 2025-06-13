"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  parseTemplateContent,
  serializeTemplateContent,
} from "@/lib/template-parser";
import type { TemplateVariable, VariableType } from "@/lib/types";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface TemplateVariableEditorProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  isSaving: boolean;
}

export function TemplateVariableEditor({
  content,
  onSave,
  isSaving,
}: TemplateVariableEditorProps) {
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState<TemplateVariable>({
    key: "",
    description: "",
    type: "string",
    required: true,
    group: "",
  });

  useEffect(() => {
    const { variables, groups } = parseTemplateContent(content);
    setVariables(variables);
    setGroups(groups);
  }, [content]);

  const handleSave = () => {
    const serializedContent = serializeTemplateContent(variables, groups);
    onSave(serializedContent);
  };

  const handleAddVariable = () => {
    if (!newVariable.key.trim()) return;

    setVariables([...variables, { ...newVariable }]);

    // Reset form
    setNewVariable({
      key: "",
      description: "",
      type: "string",
      required: true,
      group: newVariable.group, // Manter o grupo selecionado
    });
  };

  const handleDeleteVariable = (index: number) => {
    const updatedVariables = [...variables];
    updatedVariables.splice(index, 1);
    setVariables(updatedVariables);
  };

  const handleUpdateVariable = (
    index: number,
    field: keyof TemplateVariable,
    value: any
  ) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = { ...updatedVariables[index], [field]: value };
    setVariables(updatedVariables);
  };

  const handleAddGroup = () => {
    const groupName = prompt("Nome do novo grupo:");
    if (groupName && !groups.includes(groupName)) {
      setGroups([...groups, groupName]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Grupos</h3>
          <Button variant="outline" size="sm" onClick={handleAddGroup}>
            Adicionar Grupo
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <div key={group} className="bg-muted px-3 py-1 rounded-md text-sm">
              {group}
            </div>
          ))}
          {groups.length === 0 && (
            <div className="text-muted-foreground text-sm">
              Nenhum grupo definido
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Variáveis</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">Chave</TableHead>
              <TableHead className="w-[30%]">Descrição</TableHead>
              <TableHead className="w-[15%]">Tipo</TableHead>
              <TableHead className="w-[15%]">Grupo</TableHead>
              <TableHead className="w-[10%]">Obrigatório</TableHead>
              <TableHead className="w-[10%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variables.map((variable, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono">{variable.key}</TableCell>
                <TableCell>
                  <Input
                    value={variable.description}
                    onChange={(e) =>
                      handleUpdateVariable(index, "description", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={variable.type}
                    onValueChange={(value) =>
                      handleUpdateVariable(index, "type", value as VariableType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="secret">Secret</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={variable.group || ""}
                    onValueChange={(value) =>
                      handleUpdateVariable(index, "group", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sem grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Sem grupo</SelectItem>
                      {groups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={variable.required ? "true" : "false"}
                    onValueChange={(value) =>
                      handleUpdateVariable(index, "required", value === "true")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteVariable(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-medium">Adicionar Nova Variável</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Chave</label>
            <Input
              placeholder="DATABASE_URL"
              value={newVariable.key}
              onChange={(e) =>
                setNewVariable({ ...newVariable, key: e.target.value })
              }
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tipo</label>
            <Select
              value={newVariable.type}
              onValueChange={(value) =>
                setNewVariable({ ...newVariable, type: value as VariableType })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="secret">Secret</SelectItem>
                <SelectItem value="url">URL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Grupo</label>
            <Select
              value={newVariable.group}
              onValueChange={(value) =>
                setNewVariable({ ...newVariable, group: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Sem grupo</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              Obrigatório
            </label>
            <Select
              value={newVariable.required ? "true" : "false"}
              onValueChange={(value) =>
                setNewVariable({ ...newVariable, required: value === "true" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Descrição</label>
            <Textarea
              placeholder="Descrição da variável"
              value={newVariable.description}
              onChange={(e) =>
                setNewVariable({ ...newVariable, description: e.target.value })
              }
              rows={2}
            />
          </div>
        </div>
        <Button onClick={handleAddVariable} disabled={!newVariable.key.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Variável
        </Button>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Template
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
