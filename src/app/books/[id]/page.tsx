
"use client";
import React, { use, useState, useEffect } from 'react';
import { Book, Palette, ShoppingCart, ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Serie } from "@/lib/types";
import { EditorTab } from "@/components/editor/editor-tab";
import { SalesTab } from "@/components/sales/sales-tab";
import { AuthButton } from "@/components/auth-button";
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


export default function BookEditorPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const firestore = useFirestore();
    const params = use(paramsPromise);
    const { id: bookId } = params;

    const bookRef = useMemoFirebase(() => {
        if (!bookId) return null;
        return doc(firestore, "series", bookId);
    }, [firestore, bookId]);

    const { data: book, isLoading } = useDoc<Serie>(bookRef);
    const [bookTitle, setBookTitle] = useState(book?.titulo || "");

    useEffect(() => {
        if (book) {
            setBookTitle(book.titulo);
        }
    }, [book]);

    if (isLoading) {
        return (
             <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                <h1 className="font-semibold text-2xl">Carregando sua coleção...</h1>
                <p className="text-muted-foreground">Aguarde, estamos buscando as informações.</p>
            </div>
        )
    }

    if (!book) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-center">
                <h1 className="font-semibold text-2xl">Coleção não encontrada.</h1>
                <p className="text-muted-foreground">Não conseguimos encontrar a coleção que você está procurando.</p>
                 <Button asChild variant="outline">
                    <Link href="/">Voltar ao Dashboard</Link>
                </Button>
            </div>
        )
    }
    
    const bookWithDefaults: Serie = {
        ...{
            titulo: '',
            preco: 0,
            publico_alvo: '',
            descricao: '',
            capa_url: '',
            status: 'rascunho',
            data_criacao: null,
            data_atualizacao: null,
            autor_id: '',
            tags_gerais: [],
            modulos_count: 0,
            tatuagens_count: 0,
        },
        ...book,
        preco: book.preco ?? 0,
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 z-20">
            <nav className="flex-1 flex items-center gap-4">
            <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold md:text-base text-foreground/80 hover:text-foreground transition-colors"
            >
                <Book className="h-6 w-6 text-primary" />
                <span className="font-semibold text-xl tracking-wide truncate">
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
            <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <AuthButton />
            </div>
        </header>
        <main className="flex flex-1 flex-col">
            <Tabs defaultValue="editor" className="flex-1">
            <div className="sticky top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                    <div className="text-center sm:text-left">
                        <p className="text-sm text-muted-foreground font-sans">
                            Série
                        </p>
                        <h1 className="font-semibold text-3xl">{bookTitle}</h1>
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
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
                <TabsContent value="editor" className="focus-visible:ring-0 focus-visible:ring-offset-0">
                    <EditorTab initialBookState={bookWithDefaults} />
                </TabsContent>
                <TabsContent value="sales" className="focus-visible:ring-0 focus-visible:ring-offset-0">
                    <SalesTab book={bookWithDefaults} />
                </TabsContent>
            </div>
            </Tabs>
        </main>
        </div>
    );
}
