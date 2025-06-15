"use client";

import { useNotificationContext } from "@/components/notification";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  activateEnvFile,
  createEnvFile,
  deleteEnvFile,
} from "@/lib/env-actions";
import type { EnvFile } from "@/lib/types";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Separator } from "./ui/separator";

interface EnvFileListProps {
  files: EnvFile[];
  selectedFile: EnvFile | null;
  onSelectFile: (file: EnvFile) => void;
  onFilesChanged: () => Promise<void>;
  isLoading: boolean;
}

export function EnvFileList({
  files,
  selectedFile,
  onSelectFile,
  onFilesChanged,
  isLoading,
}: EnvFileListProps) {
  const [newFileName, setNewFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<EnvFile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showNotification } = useNotificationContext();

  const hasTemplateFile = files.some(
    (file) => file.isTemplate && file.name === ".env.template"
  );

  const handleCreateFile = async () => {
    const newFileNameTrimmed = hasTemplateFile
      ? newFileName.trim()
      : "template";

    if (!newFileNameTrimmed) {
      showNotification({
        title: "Nome inválido",
        description: "Por favor, forneça um nome para o arquivo .env",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createEnvFile(newFileNameTrimmed);
      await onFilesChanged();
      setNewFileName("");
      setIsDialogOpen(false);
      showNotification({
        title: "Arquivo criado",
        description: `Arquivo .env.${newFileNameTrimmed} criado com sucesso!`,
      });
    } catch (error) {
      showNotification({
        title: "Erro ao criar arquivo",
        description: `Não foi possível criar o arquivo: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleActivateFile = async (file: EnvFile) => {
    setIsActivating(true);
    try {
      await activateEnvFile(file.name);
      await onFilesChanged();
      showNotification({
        title: "Ambiente ativado",
        description: `Arquivo ${file.name} ativado como .env principal`,
      });
    } catch (error) {
      showNotification({
        title: "Erro ao ativar arquivo",
        description: `Não foi possível ativar o arquivo: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    try {
      await deleteEnvFile(fileToDelete.name);
      await onFilesChanged();
      showNotification({
        title: "Arquivo excluído",
        description: `Arquivo ${fileToDelete.name} excluído com sucesso!`,
      });
    } catch (error) {
      showNotification({
        title: "Erro ao excluir arquivo",
        description: `Não foi possível excluir o arquivo: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };

  function ButtonCreateFile() {
    return (
      <Button onClick={handleCreateFile} disabled={isCreating}>
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando...
          </>
        ) : (
          `Criar ${hasTemplateFile ? "arquivo" : "template"}`
        )}
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Arquivos .env</CardTitle>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={onFilesChanged}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {hasTemplateFile
                    ? "Criar novo arquivo .env"
                    : "Criar template .env"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {hasTemplateFile && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">.env.</span>
                    <Input
                      placeholder="dev, prod, staging..."
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      className="col-span-3"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateFile();
                        }
                      }}
                    />
                  </div>
                )}
                <ButtonCreateFile />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum arquivo .env encontrado
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file, index) => (
              <React.Fragment key={file.name}>
                {index === 2 && <Separator className="mt-4" />}
                <div
                  className={`flex items-center justify-between p-2 rounded-md ${
                    selectedFile?.name === file.name
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  } ${
                    file.isActive ? "border-1 border-l-4 border-primary" : ""
                  }`}
                >
                  <button
                    className="flex-1 text-left truncate"
                    onClick={() => onSelectFile(file)}
                  >
                    <span className="font-medium">{file.name}</span>
                    {file.isActive && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (ativo)
                      </span>
                    )}
                  </button>
                  <div className="flex gap-1">
                    {!file.isActive && !file.isTemplate && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleActivateFile(file)}
                        disabled={isActivating}
                      >
                        {isActivating ? "..." : "Ativar"}
                      </Button>
                    )}
                    {!file.isTemplate && file.name !== ".env" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setFileToDelete(file)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir arquivo</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o arquivo{" "}
                              {file.name}? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteFile}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Excluindo..." : "Excluir"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
