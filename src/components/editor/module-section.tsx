
"use client";

import { useRef, useState } from "react";
import { UploadCloud, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Modulo, Tatuagem } from "@/lib/types";
import { ImageCard } from "./image-card";
import { Separator } from "@/components/ui/separator";
import { analyzeImageAndGenerateContent, type ImageAnalysisOutput } from "@/ai/flows/image-analysis-content-generation";
import { useFirestore, useUser, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";

interface ModuleSectionProps {
  module: Modulo;
  onEditImage: (image: Tatuagem) => void;
  onImagesChange: (images: Tatuagem[]) => void;
  bookId: string;
}

export function ModuleSection({ module, onEditImage, onImagesChange, bookId }: ModuleSectionProps) {
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
              
              // Call AI to get metadata
              const aiContent: ImageAnalysisOutput = await analyzeImageAndGenerateContent({ imageDataUri });

              // In a real app, you'd upload the image to Firebase Storage and get a URL.
              // For now, we'll use the data URI as a placeholder capa_url.
              const newTatuagem: Omit<Tatuagem, "id" | "data_criacao" | "data_atualizacao"> = {
                capa_url: imageDataUri, // Placeholder. Replace with storage URL.
                titulo: aiContent.suggestedName,
                descricao_contextual: aiContent.description,
                tema: aiContent.theme,
                estilos: [aiContent.style],
                significado_literal: '',
                significado_subjetivo: '',
                cores_usadas: [],
                elementos_presentes: [],
                tom_emocional: '',
                local_sugerido: '',
                simbolismo: '',
                referencia_cultural: '',
                tags: aiContent.seoTags,
                likes: 0,
                comentarios_count: 0,
                compartilhamentos: 0,
                autor_id: user.uid,
                origem: 'IA',
              };

              // Save the new tattoo metadata to Firestore subcollection
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

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <CardTitle className="font-semibold text-2xl">{module.titulo}</CardTitle>
            <CardDescription className="font-sans mt-1 text-base">
              {module.descricao}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={handleUploadClick} disabled={isUploading}>
            {isUploading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload Tatuagens
              </>
            )}
          </Button>
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
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma tatuagem neste módulo ainda.</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {(module.tatuagens ?? []).map((image) => (
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
