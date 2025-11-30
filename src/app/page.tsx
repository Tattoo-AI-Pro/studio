
"use client";

import { Book, DollarSign, Image as ImageIcon, PlusCircle, Pencil } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth-button";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { AiBook } from "@/lib/types";

const dashboardMetrics = [
  {
    title: "Coleções Criadas",
    value: "12",
    icon: Book,
    description: "+2 este mês",
    color: "text-primary",
  },
  {
    title: "Tatuagens Gerenciadas",
    value: "345",
    icon: ImageIcon,
    description: "+42 este mês",
    color: "text-blue-500",
  },
  {
    title: "Vendas Totais",
    value: "R$ 1.876,50",
    icon: DollarSign,
    description: "+15% vs. mês passado",
    color: "text-green-500",
  },
];

function MyCollections() {
  const firestore = useFirestore();
  const { user } = useUser();

  const collectionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, "ai_books"),
      where("ownerId", "==", user.uid)
    );
  }, [firestore, user]);

  const { data: books, isLoading } = useCollection<AiBook>(collectionsQuery);

  if (isLoading) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-muted-foreground/50 p-8 text-center">
        <p className="text-muted-foreground">Carregando coleções...</p>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-muted-foreground/50 p-8 text-center">
        <p className="text-muted-foreground">
          Suas coleções de tatuagens aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 mt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {books.map((book) => (
        <Link key={book.id} href={`/books/${book.id}`} className="group block">
          <Card className="overflow-hidden relative aspect-[3/4] bg-card">
            {book.coverArtUrl ? (
              <Image
                src={book.coverArtUrl}
                alt={`Capa da coleção ${book.name}`}
                fill
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                data-ai-hint="book cover"
              />
            ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Book className="w-12 h-12 text-muted-foreground" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <h3 className="font-semibold text-lg text-white truncate">{book.name}</h3>
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Pencil className="w-8 h-8 text-white" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 z-10">
        <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Book className="h-6 w-6 text-primary" />
          <span className="font-semibold text-xl tracking-wide truncate">
            Estúdio de Tatuagem
          </span>
        </div>
        <div className="ml-auto">
          <AuthButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <div>
            <h1 className="font-semibold text-3xl">
              Dashboard
            </h1>
            {!isUserLoading && user && (
              <p className="text-muted-foreground">
                Bem-vindo(a) de volta, {user.displayName?.split(" ")[0]}!
              </p>
            )}
          </div>
          {user && (
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/books/new">
                Criar Coleção
                <PlusCircle className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {!user && !isUserLoading && (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="font-semibold">Bem-vindo ao Estúdio de Tatuagem</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Faça login para começar a criar e gerenciar suas coleções de
                tatuagens.
              </p>
              <AuthButton />
            </CardContent>
          </Card>
        )}

        {user && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dashboardMetrics.map((metric) => (
                <Card key={metric.title} className="bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {metric.title}
                    </CardTitle>
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${metric.color}`}>
                      {metric.value}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-4">
              <h2 className="font-semibold text-2xl">
                Minhas Coleções
              </h2>
              <MyCollections />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
