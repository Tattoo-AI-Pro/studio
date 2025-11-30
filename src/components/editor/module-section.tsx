
"use client";

import { useRef, useState } from "react";
import { UploadCloud, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Module, ImageItem } from "@/lib/types";
import { ImageCard } from "./image-card";
import { Separator } from "@/components/ui/separator";
import { analyzeImageAndGenerateContent } from "@/ai/flows/image-analysis-content-generation";
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection } from "firebase/firestore";

interface ModuleSectionProps {
  module: Module;
  onEditImage: (image: ImageItem) => void;
  onImagesChange: (images: ImageItem[]) => void;
  bookId: string;
}

export function ModuleSection({ module, onEditImage, onImagesChange, bookId }: ModuleSectionProps) {
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        return new Promise<ImageItem | null>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const imageDataUri = e.target?.result as string;
              
              // Call AI to get metadata
              const aiContent = await analyzeImageAndGenerateContent({ imageDataUri });

              // In a real app, you'd upload the image to Firebase Storage and get a URL.
              // For now, we'll use the data URI as a placeholder sourceUrl.
              const newImage: Omit<ImageItem, "id"> = {
                sourceUrl: imageDataUri, // Placeholder. Replace with storage URL.
                aiTitle: aiContent.suggestedName,
                aiDescription: aiContent.description,
                aiTheme: aiContent.theme,
                aiStyle: aiContent.style,
                aiSeoTags: aiContent.seoTags,
                aiInstagramCaption: aiContent.instagramCaption,
              };

              // Save the new image metadata to Firestore subcollection
              const imagesCollection = collection(firestore, `ai_books/${bookId}/modules/${module.id}/images`);
              const docRef = await addDocumentNonBlocking(imagesCollection, newImage);

              resolve({ ...newImage, id: docRef.id });

            } catch (error) {
              console.error("Error during AI analysis or Firestore save:", error);
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const newImages = (await Promise.all(uploadPromises)).filter(img => img !== null) as ImageItem[];
      
      // We don't directly update firestore here. Instead we notify the parent.
      // The parent component (`EditorTab`) will update its state, which triggers a
      // non-blocking update of the entire book document. This is simpler than
      // managing deep updates with arrayUnion here.
      onImagesChange([...module.images, ...newImages]);

    } catch (error) {
      console.error("Error uploading files:", error);
      // Optionally, show a toast to the user
    } finally {
      setIsUploading(false);
      // Reset file input
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl">{module.name}</CardTitle>
            <CardDescription className="font-body mt-1 text-base">
              {module.description}
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
                Upload Images
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
        {module.images.length === 0 && !isUploading && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma imagem neste módulo ainda.</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {module.images.map((image) => (
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
