
"use client";

import { useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import { doc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import type { Serie, Tatuagem, Modulo } from "@/lib/types";
import { ModuleSection } from "./module-section";
import { EditImageSheet } from "./edit-image-sheet";
import { CompileDialog, type CompilationResult } from "./compile-dialog";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { aiBookCompilation, type AiBookCompilationInput } from "@/ai/flows/ai-book-compilation";

interface EditorTabProps {
  initialBookState: Serie;
}

export function EditorTab({ initialBookState }: EditorTabProps) {
  const firestore = useFirestore();
  const [book, setBook] = useState<Serie>(initialBookState);
  const [editingImage, setEditingImage] = useState<Tatuagem | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showCompileDialog, setShowCompileDialog] = useState(false);
  const [compilationResult, setCompilationResult] =
    useState<CompilationResult | null>(null);
  const { toast } = useToast();

  const handleImageUpdate = (updatedImage: Tatuagem) => {
    const newModules = (book.modulos ?? []).map((module) => {
      if (!module.tatuagens) module.tatuagens = [];
      const imageIndex = module.tatuagens.findIndex(
        (img) => img.id === updatedImage.id
      );
      if (imageIndex > -1) {
        const newImages = [...module.tatuagens];
        newImages[imageIndex] = updatedImage;
        return { ...module, tatuagens: newImages };
      }
      return module;
    });

    const updatedBook = { ...book, modulos: newModules };
    setBook(updatedBook);

    const bookRef = doc(firestore, "series", book.id);
    updateDocumentNonBlocking(bookRef, { 
      modulos: newModules,
      data_atualizacao: serverTimestamp()
    });

    toast({
      title: "Tatuagem salva!",
      description: `"${updatedImage.titulo}" foi atualizada com sucesso.`,
    });
  };

  const handleModulesUpdate = (updatedModules: Modulo[]) => {
    const updatedBook = { ...book, modulos: updatedModules };
    setBook(updatedBook);

    const bookRef = doc(firestore, "series", book.id);
    updateDocumentNonBlocking(bookRef, { 
      modulos: updatedModules,
      data_atualizacao: serverTimestamp()
     });
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setShowCompileDialog(true);
    setCompilationResult(null);

    try {
      const compilationInput: AiBookCompilationInput = {
        aiBookName: book.titulo,
        description: book.descricao,
        targetAudience: book.publico_alvo,
        modules: (book.modulos ?? []).map(m => ({
          name: m.titulo,
          subDescription: m.descricao,
          images: (m.tatuagens ?? []).map(img => img.capa_url),
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
          {(book.modulos ?? []).map((module, moduleIndex) => (
            <ModuleSection
              key={module.id}
              module={module}
              onEditImage={setEditingImage}
              onImagesChange={(newImages) => {
                const newModules = [...(book.modulos ?? [])];
                newModules[moduleIndex].tatuagens = newImages;
                handleModulesUpdate(newModules);
              }}
              bookId={book.id}
            />
          ))}
          {(!book.modulos || book.modulos.length === 0) && (
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
        bookName={book.titulo}
      />
    </>
  );
}
