
"use client";

import { useRef, useState, useEffect } from "react";
import { UploadCloud, LoaderCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Modulo, Tatuagem } from "@/lib/types";
import { ImageCard } from "./image-card";
import { Separator } from "@/components/ui/separator";
import { analyzeImageAndGenerateContent, type ImageAnalysisOutput } from "@/ai/flows/image-analysis-content-generation";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc, writeBatch } from "firebase/firestore";
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
  bookId: string;
  onEditModule: () => void;
  onDeleteModule: () => void;
}

export function ModuleSection({ 
    module, 
    onEditImage, 
    bookId, 
    onEditModule, 
    onDeleteModule 
}: ModuleSectionProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const tattoosQuery = useMemoFirebase(() => {
    if (!bookId || !module.id) return null;
    return collection(firestore, `series/${bookId}/modulos/${module.id}/tatuagens`);
  }, [firestore, bookId, module.id]);

  const { data: tattoos, isLoading: isLoadingTattoos } = useCollection<Tatuagem>(tattoosQuery);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user || !tattoosQuery) return;

    setIsUploading(true);
    const newUploadCount = files.length;

    try {
      const batch = writeBatch(firestore);

      for (const file of Array.from(files)) {
          const reader = new FileReader();
          const dataUri = await new Promise<string>((resolve) => {
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(file);
          });

          const aiContent: ImageAnalysisOutput = await analyzeImageAndGenerateContent({ imageDataUri: dataUri });

          const newTatuagemData: Omit<Tatuagem, "id"> = {
            capa_url: dataUri, // Initially use Data URI, could be replaced by a storage URL
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
            data_criacao: serverTimestamp(),
            data_atualizacao: serverTimestamp(),
          };

          const newTattooRef = doc(tattoosQuery);
          batch.set(newTattooRef, newTatuagemData);
      }
      
      // Update tattoo count on the module
      const moduleRef = doc(firestore, `series/${bookId}/modulos/${module.id}`);
      batch.update(moduleRef, {
        tatuagens_count: (module.tatuagens_count ?? 0) + newUploadCount
      });

      await batch.commit();

    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const sortedTattoos = (tattoos ?? []).sort((a, b) => {
    const dateA = a.data_criacao?.toDate?.() ?? new Date(0);
    const dateB = b.data_criacao?.toDate?.() ?? new Date(0);
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
        {isLoadingTattoos && (
            <div className="text-center py-8">
                 <LoaderCircle className="w-8 h-8 text-primary animate-spin mx-auto" />
                 <p className="text-sm text-muted-foreground mt-2">Carregando tatuagens...</p>
            </div>
        )}
        {!isLoadingTattoos && (!tattoos || tattoos.length === 0) && !isUploading && (
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
