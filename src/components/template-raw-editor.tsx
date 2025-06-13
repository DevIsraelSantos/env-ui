"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";

interface TemplateRawEditorProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  isSaving: boolean;
}

export function TemplateRawEditor({
  content,
  onSave,
  isSaving,
}: TemplateRawEditorProps) {
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    onSave(editedContent);
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="font-mono text-sm h-[500px]"
        placeholder="# Comentário
# @group:Nome do Grupo
# @type:string @required
KEY=value"
      />
      <div className="flex justify-end">
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
