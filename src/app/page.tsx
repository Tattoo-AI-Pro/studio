
"use client";

import { useEffect, useState } from "react";
import { Book, Search, PlusCircle, LoaderCircle, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth-button";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import type { Serie } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { CreateSerieModal } from "@/components/dashboard/create-serie-modal";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


// #############################################################################
// ##
// ## VFLIX - Public Facing Page (for guests)
// ##
// #############################################################################

function CollectionCarousel({ title, collections }: { title: string; collections: Serie[] }) {
    if (!collections || collections.length === 0) return null;

    return (
        <div className="space-y-4 py-8">
            <h2 className="text-2xl font-bold px-4 md:px-8 lg:px-12">{title}</h2>
             <Carousel
                opts={{
                    align: "start",
                    loop: false,
                    slidesToScroll: 'auto',
                }}
                 className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {collections.map((serie, index) => (
                        <CarouselItem key={serie.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                             <div className="group relative aspect-video overflow-visible">
                                <Card className="overflow-hidden bg-background transition-all duration-300 ease-in-out group-hover:scale-[1.15] group-hover:z-10 group-hover:shadow-2xl group-hover:shadow-black/50">
                                     <Link href={`/series/${serie.id}`} className="block">
                                        <Image
                                            src={serie.capa_url || `https://picsum.photos/seed/${serie.id}/480/270`}
                                            alt={`Capa da coleção ${serie.titulo}`}
                                            width={480}
                                            height={270}
                                            className="object-cover w-full h-full"
                                            data-ai-hint="movie poster"
                                        />
                                    </Link>
                                    <div className="absolute hidden transition-all duration-300 ease-in-out group-hover:block bottom-full mb-[-1.15rem] left-0 right-0 p-4 bg-background rounded-t-md w-[calc(100%*1.15)] transform origin-bottom scale-[0.869] z-20">
                                         <h3 className="font-bold truncate text-foreground">{serie.titulo}</h3>
                                         <p className="text-xs text-muted-foreground mt-1">{serie.modulos_count || 0} módulos • {serie.tatuagens_count || 0} tatuagens</p>
                                    </div>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="hidden md:block">
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                </div>
            </Carousel>
        </div>
    );
}

function VFlixHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-50 flex h-16 items-center gap-4 px-4 md:px-8 transition-colors duration-300",
        isScrolled ? "bg-black/90 backdrop-blur-sm" : "bg-transparent"
    )}>
        <Link href="/" className="flex items-center gap-2 text-lg font-bold md:text-base text-primary">
            <span className="font-black text-2xl tracking-tighter">TATTOOFLIX</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 ml-8">
            {['Coleções', 'Estilos', 'Tendências'].map(item => (
                <Link key={item} href="#" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                    {item}
                </Link>
            ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Search className="h-5 w-5" />
            </Button>
            <AuthButton />
        </div>
    </header>
  )
}

function VFlixBrowsePage() {
  const firestore = useFirestore();
  
  const trendingQuery = useMemoFirebase(() => {
    return query(
      collection(firestore, "series"),
      where("status", "==", "publicada"),
      orderBy("data_criacao", "desc"),
      limit(12)
    );
  }, [firestore]);
  
  const { data: trendingSeries, isLoading: isLoadingTrending } = useCollection<Serie>(trendingQuery);

  const newReleasesQuery = useMemoFirebase(() => {
    return query(
      collection(firestore, "series"),
      where("status", "==", "publicada"),
      orderBy("data_atualizacao", "desc"),
      limit(12)
    );
  }, [firestore]);

  const { data: newReleases, isLoading: isLoadingNew } = useCollection<Serie>(newReleasesQuery);


  return (
    <div className="flex min-h-screen w-full flex-col bg-black text-white">
      <VFlixHeader />
      <main className="flex-1 pt-16">
        {/* Hero Section Placeholder */}
        <div className="h-[60vh] w-full bg-gradient-to-t from-black via-transparent to-black flex items-end justify-center p-12">
            <div className="max-w-3xl text-center">
                <h1 className="text-5xl font-black tracking-tighter mb-4">Coleções de Tatuagens para Artistas Modernos</h1>
                <p className="text-xl text-white/80 mb-8">Acesse milhares de designs, prontos para a agulha. Economize tempo, inspire-se e eleve seu trabalho.</p>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg h-12 px-8 rounded-full">
                    Acessar ou Criar Conta
                </Button>
            </div>
        </div>
        
        <div className="flex flex-col gap-4 -mt-24">
            {isLoadingTrending ? (
                <div className="h-48 flex items-center justify-center"><LoaderCircle className="animate-spin" /></div>
            ) : (
                <CollectionCarousel title="Em Alta" collections={trendingSeries ?? []} />
            )}
             {isLoadingNew ? (
                <div className="h-48 flex items-center justify-center"><LoaderCircle className="animate-spin" /></div>
            ) : (
                <CollectionCarousel title="Novidades da Semana" collections={newReleases ?? []} />
            )}

            {/* More carousels will go here */}
        </div>
      </main>
    </div>
  );
}


// #############################################################################
// ##
// ## CREATOR DASHBOARD - For logged-in users
// ##
// #############################################################################

function CreatorDashboardHeader() {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    return (
        <>
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-30">
            <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold md:text-base"
            >
                <Book className="h-6 w-6 text-primary" />
                <span className="font-bold tracking-tight">Creator Studio</span>
            </Link>
            <div className="flex-1" />
            <Button size="sm" className="ml-auto gap-1" onClick={() => setCreateModalOpen(true)}>
                Criar Coleção
                <PlusCircle className="h-4 w-4" />
            </Button>
            <AuthButton />
        </header>
        <CreateSerieModal open={isCreateModalOpen} onOpenChange={setCreateModalOpen} />
        </>
    );
}

function MyCollections() {
  const firestore = useFirestore();
  const { user } = useUser();

  const myCollectionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, "series"),
      where("autor_id", "==", user.uid),
      orderBy("data_atualizacao", "desc")
    );
  }, [firestore, user]);

  const { data: series, isLoading } = useCollection<Serie>(myCollectionsQuery);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <div className="p-4 space-y-2">
                    <div className="h-5 w-3/4 bg-muted animate-pulse rounded-md" />
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded-md" />
                </div>
            </Card>
        ))}
      </div>
    )
  }

  if (!series || series.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-24 text-center">
            <h3 className="mt-4 text-2xl font-semibold">Nenhuma coleção criada ainda</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Clique no botão abaixo para começar a sua primeira obra-prima.
            </p>
            {/* This button should probably open the CreateSerieModal */}
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Nova Coleção
            </Button>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {series.map(serie => (
            <Card key={serie.id} className="flex flex-col group">
                <div className="aspect-[4/3] relative overflow-hidden">
                     <Image
                        src={serie.capa_url || `https://picsum.photos/seed/${serie.id}/400/300`}
                        alt={`Capa de ${serie.titulo}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                        <Badge variant={serie.status === 'publicada' ? 'default' : 'secondary'} className="capitalize">
                            {serie.status}
                        </Badge>
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-lg truncate">{serie.titulo}</h3>
                    <p className="text-sm text-muted-foreground mt-1 flex-1">
                        {serie.modulos_count || 0} módulos • {serie.tatuagens_count || 0} tatuagens
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                        <Button asChild size="sm" className="flex-1">
                            <Link href={`/books/${serie.id}`}>Editar</Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="px-2">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Ver Página</DropdownMenuItem>
                                <DropdownMenuItem>Estatísticas</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive">Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </Card>
        ))}
    </div>
  )
}


function CreatorDashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <CreatorDashboardHeader />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="mb-8">
                <h1 className="font-bold text-3xl">Minhas Coleções</h1>
                <p className="text-muted-foreground">Gerencie, edite e acompanhe suas publicações.</p>
            </div>
            <MyCollections />
        </main>
    </div>
  )
}

export default function HomePage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        </div>
    )
  }

  // If user is logged in, show the Creator Dashboard
  // Otherwise, show the public-facing VFlix page
  return user ? <CreatorDashboard /> : <VFlixBrowsePage />;
}
