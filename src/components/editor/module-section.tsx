
"use client";

import { useRef, useState } from "react";
import { UploadCloud, LoaderCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Modulo, Tatuagem } from "@/lib/types";
import { ImageCard } from "./image-card";
import { Separator } from "@/components/ui/separator";
import { analyzeImageAndGenerateContent, type ImageAnalysisOutput } from "@/ai/flows/image-analysis-content-generation";
import { useFirestore, useUser, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react";


interface ModuleSectionProps {
  module: Modulo;
  onEditImage: (image: Tatuagem) => void;
  onImagesChange: (images: Tatuagem[]) => void;
  bookId: string;
  onEditModule: () => void;
  onDeleteModule: () => void;
}

export function ModuleSection({ 
    module, 
    onEditImage, 
    onImagesChange, 
    bookId, 
    onEditModule, 
    onDeleteModule 
}: ModuleSectionProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        return new Promise<Tatuagem | null>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const imageDataUri = e.target?.result as string;
              
              const aiContent: ImageAnalysisOutput = await analyzeImageAndGenerateContent({ imageDataUri });

              const newTatuagem: Omit<Tatuagem, "id" | "data_criacao" | "data_atualizacao"> = {
                capa_url: imageDataUri,
                titulo: aiContent.suggestedName,
                descricao_contextual: aiContent.description,
                tema: aiContent.theme,
                estilos: [aiContent.style],
                significado_literal: aiContent.significado_literal,
                significado_subjetivo: aiContent.significado_subjetivo,
                cores_usadas: aiContent.cores_usadas,
                elementos_presentes: aiContent.elementos_presentes,
                tom_emocional: aiContent.tom_emocional,
                local_sugerido: aiContent.local_sugerido,
                simbolismo: aiContent.simbolismo,
                referencia_cultural: aiContent.referencia_cultural,
                tags: aiContent.seoTags,
                likes: 0,
                comentarios_count: 0,
                compartilhamentos: 0,
                autor_id: user.uid,
                origem: 'IA',
              };

              const tatuagensCollection = collection(firestore, `series/${bookId}/modulos/${module.id}/tatuagens`);
              const docRef = await addDocumentNonBlocking(tatuagensCollection, {
                  ...newTatuagem,
                  data_criacao: serverTimestamp(),
                  data_atualizacao: serverTimestamp()
              });

              resolve({ ...newTatuagem, id: docRef.id, data_criacao: new Date(), data_atualizacao: new Date() });

            } catch (error) {
              console.error("Error during AI analysis or Firestore save:", error);
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const newImages = (await Promise.all(uploadPromises)).filter(img => img !== null) as Tatuagem[];
      onImagesChange([...(module.tatuagens ?? []), ...newImages]);

    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const sortedTattoos = (module.tatuagens ?? []).sort((a, b) => {
    const dateA = a.data_criacao?.toDate?.() ?? 0;
    const dateB = b.data_criacao?.toDate?.() ?? 0;
    if(dateA < dateB) return -1;
    if(dateA > dateB) return 1;
    return 0;
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
                <CardTitle className="font-semibold text-2xl">{module.titulo}</CardTitle>
                <CardDescription className="font-sans mt-1 text-base">
                {module.descricao}
                </CardDescription>
            </div>
          
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleUploadClick} disabled={isUploading}>
                    {isUploading ? (
                    <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Analisando...
                    </>
                    ) : (
                    <>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Upload
                    </>
                    )}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEditModule}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDeleteModule} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Excluir</span>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept="image/*"
            />
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-4 md:p-6">
        {(!module.tatuagens || module.tatuagens.length === 0) && !isUploading && (
            <div className="text-center py-8">
                <h3 className="font-semibold">Nenhuma Tatuagem</h3>
                <p className="text-sm text-muted-foreground">Comece fazendo o upload de imagens para este módulo.</p>
            </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {sortedTattoos.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onEdit={() => onEditImage(image)}
            />
          ))}
          {isUploading && Array.from({ length: fileInputRef.current?.files?.length ?? 0 }).map((_, i) => (
            <Card key={`loading-${i}`} className="overflow-hidden group aspect-[3/4] relative flex items-center justify-center bg-muted">
                <LoaderCircle className="w-8 h-8 text-primary animate-spin" />
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
