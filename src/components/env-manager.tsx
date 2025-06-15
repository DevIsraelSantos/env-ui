"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { getEnvFileContent, listEnvFiles } from "@/lib/env-actions";
import type { EnvFile } from "@/lib/types";
import { useEffect, useState } from "react";
import { EnvEditor } from "./env-editor";
import { EnvFileList } from "./env-file-list";
import { EnvTemplateEditor } from "./env-template-editor";

export function EnvManager() {
  const [files, setFiles] = useState<EnvFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<EnvFile | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      try {
        const envFiles = await listEnvFiles();

        setFiles(envFiles);
        if (envFiles.length > 0) {
          const activeFile =
            envFiles.find((file) => file.isActive) || envFiles[0];
          setSelectedFile(activeFile);
          const content = await getEnvFileContent(activeFile.name);
          setFileContent(content);
        }
      } catch (error) {
        console.error("Erro ao carregar arquivos:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFiles();
  }, []);

  const handleFileSelect = async (file: EnvFile) => {
    setSelectedFile(file);
    try {
      const content = await getEnvFileContent(file.name);
      setFileContent(content);
    } catch (error) {
      console.error("Erro ao carregar conteúdo do arquivo:", error);
    }
  };

  const refreshFiles = async () => {
    const envFiles = await listEnvFiles();
    setFiles(envFiles);
  };

  const hasTemplateFile = files.some((file) => file.isTemplate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <EnvFileList
          files={files}
          selectedFile={selectedFile}
          onSelectFile={handleFileSelect}
          onFilesChanged={refreshFiles}
          isLoading={isLoading}
        />
      </div>
      {hasTemplateFile && (
        <div className="md:col-span-3">
          <Tabs
            defaultValue="template"
            className="w-full"
            value={selectedFile?.isTemplate ? "template" : "editor"}
          >
            <TabsContent value="editor" className="mt-0">
              {selectedFile && (
                <EnvEditor
                  file={selectedFile}
                  content={fileContent}
                  onContentChange={setFileContent}
                  onSaved={refreshFiles}
                />
              )}
            </TabsContent>
            <TabsContent value="template" className="mt-0">
              <EnvTemplateEditor onTemplateUpdated={refreshFiles} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
