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
    color: "text-accent-foreground",
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
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-4 md:px-6 z-10">
        <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Book className="h-6 w-6 text-primary" />
          <span className="font-headline text-2xl tracking-wide">
            Tattoo Art Factory
          </span>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-headline text-3xl font-semibold">
            Dashboard de Acompanhamento
          </h1>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/collections/new">
              Criar Coleção
              <PlusCircle className="h-4 w-4" />
            </Link>
          </Button>
        </div>

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
           <h2 className="font-headline text-2xl font-semibold">Coleções Recentes</h2>
           {/* Aqui listaremos as coleções de tatuagens no futuro */}
           <div className="mt-4 rounded-lg border border-dashed border-muted-foreground/50 p-8 text-center">
                <p className="text-muted-foreground">A listagem das suas coleções de tatuagens aparecerá aqui.</p>
           </div>
        </div>
      </main>
    </div>
  );
}
