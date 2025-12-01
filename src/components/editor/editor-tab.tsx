
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
import { useFirestore, updateDocumentNonBlocking, useCollection, useMemoFirebase } from "@/firebase";
import { aiBookCompilation, type AiBookCompilationInput } from "@/ai/flows/ai-book-compilation";
import { SerieSettingsCard } from "./serie-settings-card";
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
  
  const modulesQuery = useMemoFirebase(() => {
    return collection(firestore, `series/${initialBookState.id}/modulos`);
  }, [firestore, initialBookState.id]);

  const { data: modules } = useCollection<Modulo>(modulesQuery);
  
  const [editingImage, setEditingImage] = useState<(Tatuagem & { moduleId: string }) | null>(null);
  
  const [isCompiling, setIsCompiling] = useState(false);
  const [showCompileDialog, setShowCompileDialog] = useState(false);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  
  const [editingModule, setEditingModule] = useState<Modulo | null>(null);
  const [isCreateModuleOpen, setCreateModuleOpen] = useState(false);
  const [deletingModule, setDeletingModule] = useState<Modulo | null>(null);

  const { toast } = useToast();

  const handleImageUpdate = (updatedImage: Tatuagem) => {
    if (!editingImage?.moduleId) return;

    const imageRef = doc(firestore, `series/${book.id}/modulos/${editingImage.moduleId}/tatuagens`, updatedImage.id);

    // a Partial<Tatuagem> is needed here
    const { id, ...dataToSave } = updatedImage;
    const updatePayload = {
      ...dataToSave,
      data_atualizacao: serverTimestamp(),
    };
    
    updateDocumentNonBlocking(imageRef, updatePayload);

    toast({
      title: "Tatuagem salva!",
      description: `"${updatedImage.titulo}" foi atualizada com sucesso.`,
    });
  };


  const handleCompile = async () => {
    setIsCompiling(true);
    setShowCompileDialog(true);
    setCompilationResult(null);

    // This logic is complex as it requires fetching all tattoos from all modules.
    // For now, we'll send dummy data. This should be implemented properly later.
    try {
      const compilationInput: AiBookCompilationInput = {
        aiBookName: book.titulo,
        description: book.descricao,
        targetAudience: book.publico_alvo,
        modules: (modules ?? []).map(m => ({
          name: m.titulo,
          subDescription: m.descricao,
          images: [], // In a real scenario, you'd fetch and map tattoo capa_urls
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

  const handleSaveModule = async (moduleData: Partial<Omit<Modulo, 'id'>>, moduleId?: string) => {
    const batch = writeBatch(firestore);
    const modulesCollectionRef = collection(firestore, `series/${book.id}/modulos`);
    
    if (moduleId) { // Editing existing module
      const moduleRef = doc(modulesCollectionRef, moduleId);
      batch.update(moduleRef, { ...moduleData, data_atualizacao: serverTimestamp() });
      
    } else { // Creating new module
      const newModuleRef = doc(modulesCollectionRef);
      const newModule: Omit<Modulo, 'id'> = {
        titulo: moduleData.titulo!,
        descricao: moduleData.descricao!,
        ordem: (modules?.length ?? 0) + 1,
        data_criacao: serverTimestamp(),
        data_atualizacao: serverTimestamp(),
        tatuagens_count: 0,
      };
      batch.set(newModuleRef, newModule);
    }

    // Update parent book count
    const bookRef = doc(firestore, "series", book.id);
    batch.update(bookRef, { 
      modulos_count: (modules?.length ?? 0) + (moduleId ? 0 : 1),
      data_atualizacao: serverTimestamp() 
    });

    await batch.commit();

    toast({ title: `Módulo ${moduleId ? 'atualizado' : 'criado'}!`, description: `"${moduleData.titulo}" foi salvo.` });
    setEditingModule(null);
    setCreateModuleOpen(false);
  };

  const handleDeleteModule = async () => {
    if (!deletingModule) return;

    // In a real app, you must also delete all documents in subcollections.
    // This is a complex operation (requires a Cloud Function or client-side batching).
    // For now, we just delete the module doc.
    const moduleRef = doc(firestore, `series/${book.id}/modulos`, deletingModule.id);
    await deleteDoc(moduleRef); 

    const bookRef = doc(firestore, "series", book.id);
    
    updateDocumentNonBlocking(bookRef, {
      modulos_count: (modules?.length ?? 1) - 1,
      data_atualizacao: serverTimestamp(),
    });

    toast({
        variant: "destructive",
        title: "Módulo excluído",
        description: `"${deletingModule.titulo}" foi removido da coleção.`,
    });

    setDeletingModule(null);
  };
  
  const sortedModules = (modules ?? []).sort((a, b) => {
    const dateA = a.data_criacao?.toDate?.() ?? new Date(0);
    const dateB = b.data_criacao?.toDate?.() ?? new Date(0);
    if(dateA < dateB) return -1;
    if(dateA > dateB) return 1;
    return 0;
  });

  return (
    <>
      <div className="space-y-8">
        <SerieSettingsCard book={book} onBookUpdate={setBook} />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="font-semibold text-2xl">Editor de Módulos</h2>
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
          {sortedModules.map((module) => (
            <ModuleSection
              key={module.id}
              module={module}
              onEditImage={(image) => setEditingImage({ ...image, moduleId: module.id })}
              bookId={book.id}
              onEditModule={() => setEditingModule(module)}
              onDeleteModule={() => setDeletingModule(module)}
            />
          ))}
          {(!modules || modules.length === 0) && (
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
