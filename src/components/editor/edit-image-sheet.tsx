
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
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditImageSheetProps {
  image: Tatuagem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (image: Tatuagem) => void;
}

const StringToArrayInput = ({ value, onChange, placeholder }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string }) => {
  const items = value.split(',').map(item => item.trim()).filter(Boolean);
  return (
    <div>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <div className="flex flex-wrap gap-1 pt-2">
        {items.map((item, i) => (
          <Badge key={i} variant="secondary">{item}</Badge>
        ))}
      </div>
    </div>
  );
};


export function EditImageSheet({
  image,
  open,
  onOpenChange,
  onSave,
}: EditImageSheetProps) {
  const [formData, setFormData] = useState<Partial<Tatuagem>>({});
  
  // State for comma-separated string inputs
  const [tagsInput, setTagsInput] = useState("");
  const [estilosInput, setEstilosInput] = useState("");
  const [coresUsadasInput, setCoresUsadasInput] = useState("");
  const [elementosPresentesInput, setElementosPresentesInput] = useState("");


  useEffect(() => {
    if (image) {
      setFormData(image);
      setTagsInput((image.tags ?? []).join(", "));
      setEstilosInput((image.estilos ?? []).join(", "));
      setCoresUsadasInput((image.cores_usadas ?? []).join(", "));
      setElementosPresentesInput((image.elementos_presentes ?? []).join(", "));
    }
  }, [image]);

  if (!image) return null;

  const handleSave = () => {
    const finalData: Tatuagem = {
      ...(image as Tatuagem), // start with original image to preserve all fields
      ...formData, // apply changes from the form
      tags: tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean),
      estilos: estilosInput.split(",").map((estilo) => estilo.trim()).filter(Boolean),
      cores_usadas: coresUsadasInput.split(",").map((cor) => cor.trim()).filter(Boolean),
      elementos_presentes: elementosPresentesInput.split(",").map((el) => el.trim()).filter(Boolean),
    };
    onSave(finalData);
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
      <SheetContent className="sm:max-w-2xl w-[90vw] flex flex-col">
        <SheetHeader className="text-left pr-6">
          <SheetTitle className="font-semibold text-2xl">
            Editar Detalhes da Tatuagem
          </SheetTitle>
          <SheetDescription className="font-sans text-base flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <span>Sugestões da IA podem estar pré-preenchidas. Ajuste como preferir.</span>
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="grid gap-6 py-6 pr-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="tema" className="font-semibold">Tema</Label>
                <Input id="tema" name="tema" value={formData.tema || ""} onChange={handleChange} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="estilos" className="font-semibold">Estilos</Label>
                <StringToArrayInput
                  value={estilosInput}
                  onChange={(e) => setEstilosInput(e.target.value)}
                  placeholder="realismo, fine-line"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="tom_emocional" className="font-semibold">Tom Emocional</Label>
                <Input id="tom_emocional" name="tom_emocional" value={formData.tom_emocional || ""} onChange={handleChange} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="local_sugerido" className="font-semibold">Local Sugerido no Corpo</Label>
                <Input id="local_sugerido" name="local_sugerido" value={formData.local_sugerido || ""} onChange={handleChange} />
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
             <div className="grid gap-3">
              <Label htmlFor="significado_subjetivo" className="font-semibold">Significado Subjetivo</Label>
              <Textarea
                id="significado_subjetivo"
                name="significado_subjetivo"
                value={formData.significado_subjetivo || ""}
                onChange={handleChange}
                className="min-h-[100px] font-sans"
              />
            </div>

             <div className="grid gap-3">
              <Label htmlFor="simbolismo" className="font-semibold">Simbolismo</Label>
              <Textarea
                id="simbolismo"
                name="simbolismo"
                value={formData.simbolismo || ""}
                onChange={handleChange}
                className="min-h-[100px] font-sans"
              />
            </div>

             <div className="grid gap-3">
              <Label htmlFor="referencia_cultural" className="font-semibold">Referência Cultural</Label>
              <Textarea
                id="referencia_cultural"
                name="referencia_cultural"
                value={formData.referencia_cultural || ""}
                onChange={handleChange}
                className="min-h-[100px] font-sans"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="cores_usadas" className="font-semibold">Cores Utilizadas</Label>
                <StringToArrayInput
                  value={coresUsadasInput}
                  onChange={(e) => setCoresUsadasInput(e.target.value)}
                  placeholder="preto, vermelho, azul"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="elementos_presentes" className="font-semibold">Elementos Presentes</Label>
                <StringToArrayInput
                  value={elementosPresentesInput}
                  onChange={(e) => setElementosPresentesInput(e.target.value)}
                  placeholder="rosa, adaga, caveira"
                />
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="tags" className="font-semibold">Tags (SEO)</Label>
               <StringToArrayInput
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="floral, minimalista, feminina"
                />
            </div>

          </div>
        </ScrollArea>
        <SheetFooter className="pt-6 pr-6">
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

    