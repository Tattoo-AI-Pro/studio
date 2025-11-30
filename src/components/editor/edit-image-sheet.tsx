
"use client";

import { useEffect, useState } from "react";
import { Bot, Save } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Tatuagem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface EditImageSheetProps {
  image: Tatuagem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (image: Tatuagem) => void;
}

export function EditImageSheet({
  image,
  open,
  onOpenChange,
  onSave,
}: EditImageSheetProps) {
  const [formData, setFormData] = useState<Partial<Tatuagem>>({});
  const [tagsInput, setTagsInput] = useState("");
  const [estilosInput, setEstilosInput] = useState("");

  useEffect(() => {
    if (image) {
      setFormData(image);
      setTagsInput((image.tags ?? []).join(", "));
      setEstilosInput((image.estilos ?? []).join(", "));
    }
  }, [image]);

  if (!image) return null;

  const handleSave = () => {
    onSave({
      ...formData,
      tags: tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean),
      estilos: estilosInput.split(",").map((estilo) => estilo.trim()).filter(Boolean),
    } as Tatuagem);
    onOpenChange(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-semibold text-2xl">
            Editar Detalhes da Tatuagem
          </SheetTitle>
          <SheetDescription className="font-sans text-base flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <span>Sugestões da IA estão pré-preenchidas. Ajuste conforme necessário.</span>
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-3">
            <Label htmlFor="titulo" className="font-semibold">Título</Label>
            <Input
              id="titulo"
              name="titulo"
              value={formData.titulo || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="descricao_contextual" className="font-semibold">Descrição Contextual</Label>
            <Textarea
              id="descricao_contextual"
              name="descricao_contextual"
              value={formData.descricao_contextual || ""}
              onChange={handleChange}
              className="min-h-[100px] font-sans"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-3">
              <Label htmlFor="tema" className="font-semibold">Tema</Label>
              <Input
                id="tema"
                name="tema"
                value={formData.tema || ""}
                onChange={handleChange}
              />
            </div>
             <div className="grid gap-3">
              <Label htmlFor="estilos" className="font-semibold">Estilos</Label>
              <Input
                id="estilos"
                value={estilosInput}
                onChange={(e) => setEstilosInput(e.target.value)}
                placeholder="e.g. realismo, fine-line"
              />
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="tags" className="font-semibold">Tags (SEO)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. minimalista, floral"
            />
            <div className="flex flex-wrap gap-2">
              {tagsInput.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, i) => (
                <Badge key={i} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="significado_literal" className="font-semibold">Significado Literal</Label>
            <Textarea
              id="significado_literal"
              name="significado_literal"
              value={formData.significado_literal || ""}
              onChange={handleChange}
              className="min-h-[100px] font-sans"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
