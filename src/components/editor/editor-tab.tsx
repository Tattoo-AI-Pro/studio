
"use client";

import { useState } from "react";
import { Sparkles, LoaderCircle, PlusCircle } from "lucide-react";
import { doc, collection, writeBatch, serverTimestamp, deleteDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import type { Serie, Tatuagem, Modulo } from "@/lib/types";
import { ModuleSection } from "./module-section";
import { EditImageSheet } from "./edit-image-sheet";
import { CompileDialog, type CompilationResult } from "./compile-dialog";
import { EditModuleDialog } from "./edit-module-dialog";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { aiBookCompilation, type AiBookCompilationInput } from "@/ai/flows/ai-book-compilation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface EditorTabProps {
  initialBookState: Serie;
}

export function EditorTab({ initialBookState }: EditorTabProps) {
  const firestore = useFirestore();
  const [book, setBook] = useState<Serie>(initialBookState);
  
  const [editingImage, setEditingImage] = useState<Tatuagem | null>(null);
  
  const [isCompiling, setIsCompiling] = useState(false);
  const [showCompileDialog, setShowCompileDialog] = useState(false);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  
  const [editingModule, setEditingModule] = useState<Modulo | null>(null);
  const [isCreateModuleOpen, setCreateModuleOpen] = useState(false);
  const [deletingModule, setDeletingModule] = useState<Modulo | null>(null);

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

    handleModulesUpdate(newModules);

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
      modulos_count: updatedModules.length,
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

  const handleSaveModule = async (moduleData: Omit<Modulo, 'id'>, moduleId?: string) => {
    const batch = writeBatch(firestore);
    const modulesCollectionRef = collection(firestore, `series/${book.id}/modulos`);
    
    if (moduleId) { // Editing existing module
      const moduleRef = doc(modulesCollectionRef, moduleId);
      batch.update(moduleRef, { ...moduleData, data_atualizacao: serverTimestamp() });
      
      setBook(prev => ({
        ...prev,
        modulos: (prev.modulos ?? []).map(m => m.id === moduleId ? { ...m, ...moduleData } : m)
      }));

    } else { // Creating new module
      const newModuleRef = doc(modulesCollectionRef);
      const newModule: Modulo = {
        ...moduleData,
        id: newModuleRef.id,
        ordem: (book.modulos?.length ?? 0) + 1,
        data_criacao: serverTimestamp(),
        data_atualizacao: serverTimestamp(),
        tatuagens_count: 0
      };
      batch.set(newModuleRef, newModule);

       setBook(prev => ({
        ...prev,
        modulos: [...(prev.modulos ?? []), { ...newModule, id: newModuleRef.id }]
      }));
    }

    // Update parent book count
    const bookRef = doc(firestore, "series", book.id);
    batch.update(bookRef, { 
      modulos_count: (book.modulos?.length ?? 0) + (moduleId ? 0 : 1),
      data_atualizacao: serverTimestamp() 
    });

    await batch.commit();

    toast({ title: `Módulo ${moduleId ? 'atualizado' : 'criado'}!`, description: `"${moduleData.titulo}" foi salvo.` });
    setEditingModule(null);
    setCreateModuleOpen(false);
  };

  const handleDeleteModule = async () => {
    if (!deletingModule) return;

    const moduleRef = doc(firestore, `series/${book.id}/modulos`, deletingModule.id);
    await deleteDoc(moduleRef); // In a real app, you'd handle subcollections

    const bookRef = doc(firestore, "series", book.id);
    const updatedModules = (book.modulos ?? []).filter(m => m.id !== deletingModule.id);

    setBook(prev => ({
      ...prev,
      modulos: updatedModules,
    }));
    
    updateDocumentNonBlocking(bookRef, {
      modulos_count: updatedModules.length,
      data_atualizacao: serverTimestamp(),
    });

    toast({
        variant: "destructive",
        title: "Módulo excluído",
        description: `"${deletingModule.titulo}" foi removido da coleção.`,
    });

    setDeletingModule(null);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="font-headline text-2xl">Editor Visual</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateModuleOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Módulo
            </Button>
            <Button onClick={handleCompile} disabled={isCompiling}>
                {isCompiling ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Sparkles className="mr-2 h-4 w-4" />
                )}
                Compilar AI-Book
            </Button>
          </div>
        </div>

        <div className="space-y-12">
          {(book.modulos ?? []).sort((a, b) => a.ordem - b.ordem).map((module, moduleIndex) => (
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
              onEditModule={() => setEditingModule(module)}
              onDeleteModule={() => setDeletingModule(module)}
            />
          ))}
          {(!book.modulos || book.modulos.length === 0) && (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Esta coleção ainda não possui módulos.
              </p>
              <Button variant="link" onClick={() => setCreateModuleOpen(true)}>
                Comece adicionando um módulo.
              </Button>
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

       <EditModuleDialog
        open={isCreateModuleOpen || !!editingModule}
        onOpenChange={(open) => {
          if (!open) {
            setCreateModuleOpen(false);
            setEditingModule(null);
          }
        }}
        onSave={handleSaveModule}
        module={editingModule}
      />

      <AlertDialog open={!!deletingModule} onOpenChange={(open) => !open && setDeletingModule(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o módulo
                    <span className="font-bold"> "{deletingModule?.titulo}" </span>
                    e todas as tatuagens dentro dele.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteModule} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
