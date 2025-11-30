
"use client";

import { useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import { doc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import type { AiBook, ImageItem, Module } from "@/lib/types";
import { ModuleSection } from "./module-section";
import { EditImageSheet } from "./edit-image-sheet";
import { CompileDialog, type CompilationResult } from "./compile-dialog";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { aiBookCompilation, type AiBookCompilationInput } from "@/ai/flows/ai-book-compilation";

interface EditorTabProps {
  initialBookState: AiBook;
}

export function EditorTab({ initialBookState }: EditorTabProps) {
  const firestore = useFirestore();
  const [book, setBook] = useState<AiBook>(initialBookState);
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showCompileDialog, setShowCompileDialog] = useState(false);
  const [compilationResult, setCompilationResult] =
    useState<CompilationResult | null>(null);
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
      description: `"${updatedImage.title}" foi atualizada com sucesso.`,
    });
  };

  const handleModulesUpdate = (updatedModules: Module[]) => {
    const updatedBook = { ...book, modules: updatedModules };
    setBook(updatedBook);

    const bookRef = doc(firestore, "ai_books", book.id);
    updateDocumentNonBlocking(bookRef, { modules: updatedModules });
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setShowCompileDialog(true);
    setCompilationResult(null);

    try {
      const compilationInput: AiBookCompilationInput = {
        aiBookName: book.name,
        description: book.longDescription,
        targetAudience: book.targetAudience,
        modules: book.modules.map(m => ({
          name: m.name,
          subDescription: m.description,
          // For now, we send image URLs; the flow expects base64 but can handle URLs.
          // In a future step, we could convert these if needed.
          images: m.images.map(img => img.sourceUrl),
        }))
      };

      const result = await aiBookCompilation(compilationInput);
      setCompilationResult(result);

    } catch (error) {
        console.error("Error during AI compilation:", error);
        toast({
            variant: "destructive",
            title: "Erro na Compilação",
            description: "A IA não conseguiu compilar a coleção. Tente novamente.",
        });
        // Close the dialog on error
        setShowCompileDialog(false);
    } finally {
        setIsCompiling(false);
    }
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
          {book.modules.map((module, moduleIndex) => (
            <ModuleSection
              key={module.id}
              module={module}
              onEditImage={setEditingImage}
              onImagesChange={(newImages) => {
                const newModules = [...book.modules];
                newModules[moduleIndex].images = newImages;
                handleModulesUpdate(newModules);
              }}
              bookId={book.id}
            />
          ))}
          {book.modules.length === 0 && (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Esta coleção ainda não possui módulos ou imagens.
              </p>
              <p className="text-muted-foreground text-sm">
                Comece fazendo o upload de imagens em um módulo.
              </p>
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
        compilationResult={compilationResult}
        bookName={book.name}
      />
    </>
  );
}
