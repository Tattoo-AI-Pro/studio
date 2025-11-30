"use client";

import { useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AiBook, ImageItem } from "@/lib/types";
import { ModuleSection } from "./module-section";
import { EditImageSheet } from "./edit-image-sheet";
import { useToast } from "@/hooks/use-toast";

interface EditorTabProps {
  initialBookState: AiBook;
}

export function EditorTab({ initialBookState }: EditorTabProps) {
  const [book, setBook] = useState<AiBook>(initialBookState);
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const { toast } = useToast();

  const handleImageUpdate = (updatedImage: ImageItem) => {
    setBook((prevBook) => {
      const newModules = prevBook.modules.map((module) => {
        const imageIndex = module.images.findIndex(
          (img) => img.id === updatedImage.id
        );
        if (imageIndex > -1) {
          const newImages = [...module.images];
          newImages[imageIndex] = updatedImage;
          return { ...module, images: newImages };
        }
        return module;
      });
      return { ...prevBook, modules: newModules };
    });
    toast({
        title: "Image Updated",
        description: `"${updatedImage.aiTitle}" has been saved.`,
      });
  };

  const handleCompile = () => {
    setIsCompiling(true);
    // Simulate AI compilation
    setTimeout(() => {
      setIsCompiling(false);
      toast({
        title: "Compilation Complete!",
        description: "Your AI-Book assets are ready.",
      });
    }, 3000);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-2xl">Visual Editor</h2>
          <Button onClick={handleCompile} disabled={isCompiling}>
            {isCompiling ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Compile AI-Book
          </Button>
        </div>

        <div className="space-y-12">
          {book.modules.map((module) => (
            <ModuleSection
              key={module.id}
              module={module}
              onEditImage={setEditingImage}
            />
          ))}
        </div>
      </div>

      <EditImageSheet
        image={editingImage}
        open={!!editingImage}
        onOpenChange={(open) => {
          if (!open) setEditingImage(null);
        }}
        onSave={handleImageUpdate}
      />
    </>
  );
}
