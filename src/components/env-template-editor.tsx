"use client";

import { useNotificationContext } from "@/components/notification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEnvFileContent, saveEnvFile } from "@/lib/env-actions";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { TemplateRawEditor } from "./template-raw-editor";
import { TemplateVariableEditor } from "./template-variable-editor";

interface EnvTemplateEditorProps {
  onTemplateUpdated: () => Promise<void>;
}

export function EnvTemplateEditor({
  onTemplateUpdated,
}: EnvTemplateEditorProps) {
  const [templateContent, setTemplateContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotificationContext();

  useEffect(() => {
    async function loadTemplate() {
      try {
        const content = await getEnvFileContent(".env.template");
        setTemplateContent(content);
      } catch (error) {
        console.error("Erro ao carregar template:", error);
        showNotification({
          title: "Erro ao carregar template",
          description: "Não foi possível carregar o arquivo .env.template",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadTemplate();
  }, [showNotification]);

  const handleSave = async (content: string) => {
    setIsSaving(true);
    try {
      await saveEnvFile(".env.template", content);
      await onTemplateUpdated();
      setTemplateContent(content);
      showNotification({
        title: "Template salvo",
        description: "Arquivo .env.template salvo com sucesso!",
      });
    } catch (error) {
      showNotification({
        title: "Erro ao salvar template",
        description: `Não foi possível salvar o template: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Gerenciar Template (.env.template)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="structured">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="structured">Estruturado</TabsTrigger>
            <TabsTrigger value="raw">Texto</TabsTrigger>
          </TabsList>
          <TabsContent value="structured">
            <TemplateVariableEditor
              content={templateContent}
              onSave={handleSave}
              isSaving={isSaving}
            />
          </TabsContent>
          <TabsContent value="raw">
            <TemplateRawEditor
              content={templateContent}
              onSave={handleSave}
              isSaving={isSaving}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
