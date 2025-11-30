"use client";
import React from 'react';
import { Book, Palette, ShoppingCart, ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { placeholderBook } from "@/lib/placeholder-data";
import type { AiBook } from "@/lib/types";
import { EditorTab } from "@/components/editor/editor-tab";
import { SalesTab } from "@/components/sales/sales-tab";
import { AuthButton } from "@/components/auth-button";


export default function BookEditorPage({ params }: { params: { id: string } }) {
    const book = placeholderBook; // Using placeholder for now

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
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
                <TabsContent value="editor" className="focus-visible:ring-0 focus-visible:ring-offset-0">
                    <EditorTab initialBookState={book} />
                </TabsContent>
                <TabsContent value="sales" className="focus-visible:ring-0 focus-visible:ring-offset-0">
                    <SalesTab />
                </TabsContent>
            </div>
            </Tabs>
        </main>
        </div>
    );
}
