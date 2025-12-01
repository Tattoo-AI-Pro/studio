
"use client";

import { useEffect, useState } from "react";
import { Book, Search, User as UserIcon, Bell, ChevronDown } from "lucide-react";
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
                                     <Link href={`/books/${serie.id}`} className="block">
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

function NetflixHeader() {
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
            <Button variant="ghost" size="icon" className="text-white">
                <Search className="h-5 w-5" />
            </Button>
             <Button variant="ghost" size="icon" className="text-white">
                <Bell className="h-5 w-5" />
            </Button>
            <AuthButton />
        </div>
    </header>
  )
}

export default function NetflixBrowsePage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const trendingQuery = useMemoFirebase(() => {
    return query(
      collection(firestore, "series"),
      orderBy("data_criacao", "desc"),
      limit(12)
    );
  }, [firestore]);
  
  const { data: trendingSeries, isLoading: isLoadingTrending } = useCollection<Serie>(trendingQuery);

  // You would have more queries for other carousels
  const newReleasesSeries = useMemoFirebase(() => {
    // a different query
    return query(
      collection(firestore, "series"),
      orderBy("data_atualizacao", "desc"),
      limit(12)
    );
  }, [firestore]);

  const { data: newReleases, isLoading: isLoadingNew } = useCollection<Serie>(newReleasesSeries);


  return (
    <div className="flex min-h-screen w-full flex-col bg-black text-white">
      <NetflixHeader />
      <main className="flex-1 pt-16">
        {/* Hero Section Placeholder */}
        <div className="h-[60vh] w-full bg-gradient-to-t from-black via-transparent to-black flex items-center justify-center">
            <h1 className="text-4xl font-bold">HERO SECTION - COMING SOON</h1>
        </div>
        
        <div className="flex flex-col gap-4 -mt-24">
            {isLoadingTrending ? (
                <div className="h-48 flex items-center justify-center"><p>Carregando...</p></div>
            ) : (
                <CollectionCarousel title="Em Alta" collections={trendingSeries ?? []} />
            )}
             {isLoadingNew ? (
                <div className="h-48 flex items-center justify-center"><p>Carregando...</p></div>
            ) : (
                <CollectionCarousel title="Novidades da Semana" collections={newReleases ?? []} />
            )}

            {/* More carousels will go here */}
        </div>
      </main>
    </div>
  );
}
