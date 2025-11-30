"use client";
import React from 'react';
import { Book, Palette, ShoppingCart, ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AiBook } from "@/lib/types";
import { EditorTab } from "@/components/editor/editor-tab";
import { SalesTab } from "@/components/sales/sales-tab";
import { AuthButton } from "@/components/auth-button";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function BookHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="text-center sm:text-left">
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-9 w-64" />
      </div>
      <Skeleton className="h-10 w-full max-w-xs" />
    </div>
  )
}


export default function BookEditorPage({ params }: { params: { id: string } }) {
  const { id: bookId } = React.use(params);
  const firestore = useFirestore();

  const bookRef = useMemoFirebase(() => {
    if (!bookId) return null;
    return doc(firestore, "ai_books", bookId);
  }, [firestore, bookId]);

  const { data: book, isLoading } = useDoc<AiBook>(bookRef);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-4 md:px-6 z-20">
        <nav className="flex-1 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold md:text-base text-foreground/80 hover:text-foreground transition-colors"
          >
            <Book className="h-6 w-6 text-primary" />
            <span className="font-headline text-2xl tracking-wide">
              Estúdio de Tatuagem
            </span>
          </Link>
          <Button asChild variant="outline" size="sm" className="h-8 gap-1">
             <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar ao Dashboard</span>
            </Link>
          </Button>
        </nav>
        <div className="ml-auto">
          <AuthButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <Tabs defaultValue="editor" className="flex-1">
          <div className="sticky top-16 bg-card/90 backdrop-blur-sm z-10 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {isLoading && <BookHeaderSkeleton />}
              {!isLoading && book && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-muted-foreground font-body">
                      Coleção
                    </p>
                    <h1 className="font-headline text-3xl">{book.name}</h1>
                  </div>
                  <TabsList className="grid w-full max-w-xs grid-cols-2">
                    <TabsTrigger value="editor">
                      <Palette className="w-4 h-4 mr-2" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="sales">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Vendas
                    </TabsTrigger>
                  </TabsList>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
             {isLoading && (
              <div className="flex justify-center items-center py-16">
                <LoaderCircle className="w-8 h-8 animate-spin text-primary"/>
              </div>
            )}
            {!isLoading && book && (
              <>
                <TabsContent value="editor" className="focus-visible:ring-0 focus-visible:ring-offset-0">
                  <EditorTab initialBookState={book} />
                </TabsContent>
                <TabsContent value="sales" className="focus-visible:ring-0 focus-visible:ring-offset-0">
                  <SalesTab book={book} />
                </TabsContent>
              </>
            )}
             {!isLoading && !book && (
                <div className="text-center py-16">
                    <h2 className="font-headline text-2xl">Coleção não encontrada</h2>
                    <p className="text-muted-foreground">Esta coleção pode ter sido removida ou o link está incorreto.</p>
                    <Button asChild className="mt-4">
                        <Link href="/">Voltar ao Dashboard</Link>
                    </Button>
                </div>
            )}
          </div>
        </Tabs>
      </main>
    </div>
  );
}
