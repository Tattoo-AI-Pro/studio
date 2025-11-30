"use client";

import { Book, DollarSign, Image as ImageIcon, PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth-button";
import { useUser } from "@/firebase";

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
    color: "text-accent",
  },
  {
    title: "Vendas Totais",
    value: "R$ 1.876,50",
    icon: DollarSign,
    description: "+15% vs. mês passado",
    color: "text-green-500",
  },
];

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-4 md:px-6 z-10">
        <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Book className="h-6 w-6 text-primary" />
          <span className="font-headline text-2xl tracking-wide">
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
            <h1 className="font-headline text-3xl font-semibold">
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
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Bem-vindo ao Estúdio de Tatuagem</CardTitle>
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
                <Card key={metric.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-body">
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
              <h2 className="font-headline text-2xl font-semibold">
                Minhas Coleções
              </h2>
              {/* Aqui listaremos as coleções de tatuagens no futuro */}
              <div className="mt-4 rounded-lg border border-dashed border-muted-foreground/50 p-8 text-center">
                <p className="text-muted-foreground">
                  Suas coleções de tatuagens aparecerão aqui.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
