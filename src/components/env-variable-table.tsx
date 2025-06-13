"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface EnvVariableTableProps {
  variables: Record<string, string>;
  onVariablesChange: (variables: Record<string, string>) => void;
}

export function EnvVariableTable({
  variables,
  onVariablesChange,
}: EnvVariableTableProps) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleUpdateVariable = (key: string, value: string) => {
    const updatedVariables = { ...variables, [key]: value };
    onVariablesChange(updatedVariables);
  };

  const handleDeleteVariable = (key: string) => {
    const updatedVariables = { ...variables };
    delete updatedVariables[key];
    onVariablesChange(updatedVariables);
  };

  const handleAddVariable = () => {
    if (!newKey.trim()) return;

    const updatedVariables = {
      ...variables,
      [newKey]: newValue,
    };

    onVariablesChange(updatedVariables);
    setNewKey("");
    setNewValue("");
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Chave</TableHead>
            <TableHead className="w-[50%]">Valor</TableHead>
            <TableHead className="w-[10%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(variables).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell className="font-mono">{key}</TableCell>
              <TableCell>
                <Input
                  value={value}
                  onChange={(e) => handleUpdateVariable(key, e.target.value)}
                  className="font-mono"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteVariable(key)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <Input
                placeholder="Nova chave"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="font-mono"
              />
            </TableCell>
            <TableCell>
              <Input
                placeholder="Novo valor"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="font-mono"
              />
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddVariable}
                disabled={!newKey.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
