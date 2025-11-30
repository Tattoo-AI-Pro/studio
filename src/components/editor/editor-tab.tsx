
"use client";

import { useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import { doc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import type { AiBook, ImageItem } from "@/lib/types";
import { ModuleSection } from "./module-section";
import { EditImageSheet } from "./edit-image-sheet";
import { CompileDialog } from "./compile-dialog";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";

interface EditorTabProps {
  initialBookState: AiBook;
}

export function EditorTab({ initialBookState }: EditorTabProps) {
  const firestore = useFirestore();
  const [book, setBook] = useState<AiBook>(initialBookState);
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showCompileDialog, setShowCompileDialog] = useState(false);
  const { toast } = useToast();

  const handleImageUpdate = (updatedImage: ImageItem) => {
    const newModules = book.modules.map((module) => {
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

    const updatedBook = { ...book, modules: newModules };
    setBook(updatedBook);

    const bookRef = doc(firestore, "ai_books", book.id);
    updateDocumentNonBlocking(bookRef, { modules: newModules });

    toast({
        title: "Imagem salva!",
        description: `"${updatedImage.aiTitle}" foi atualizada com sucesso.`,
    });
  };

  const handleCompile = () => {
    setIsCompiling(true);
    setShowCompileDialog(true);
    // Simulate AI compilation
    setTimeout(() => {
      setIsCompiling(false);
      // The dialog will show the success state automatically
    }, 3000);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-2xl">Editor Visual</h2>
          <Button onClick={handleCompile} disabled={isCompiling}>
            {isCompiling ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Compilar AI-Book
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
          {book.modules.length === 0 && (
            <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground">Esta coleção ainda não possui módulos ou imagens.</p>
                <p className="text-muted-foreground text-sm">Comece fazendo o upload de imagens em um módulo.</p>
            </div>
          )}
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

      <CompileDialog
        open={showCompileDialog}
        onOpenChange={setShowCompileDialog}
        isCompiling={isCompiling}
        bookName={book.name}
      />
    </>
  );
}
