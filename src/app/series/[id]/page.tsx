
import type { Serie } from '@/lib/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle } from 'lucide-react';

async function getSerieData(serieId: string): Promise<Serie | null> {
  // In a real app, you'd fetch from your API or directly from the database.
  // We'll use the API route we just created.
  // The URL needs to be absolute when fetching on the server.
  const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002';
  try {
    const res = await fetch(`${host}/api/series/${serieId}`, {
        cache: 'no-store' // For now, don't cache to see changes immediately
    });
    if (!res.ok) {
        if (res.status === 404) {
            return null;
        }
        throw new Error(`Failed to fetch serie: ${res.statusText}`);
    }
    return res.json();
  } catch(error) {
    console.error("Failed to fetch serie data for landing page:", error);
    return null;
  }
}


export default async function SerieLandingPage({ params }: { params: { id: string } }) {
  const serie = await getSerieData(params.id);

  if (!serie) {
    notFound();
  }
  
  const totalTattoos = serie.modulos?.reduce((acc, mod) => acc + (mod.tatuagens?.length || 0), 0) ?? 0;

  return (
    <div className="bg-white text-black font-sans">
      {/* Block 1: Hero */}
      <section className="relative min-h-screen flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src={serie.capa_url}
            alt={`Capa da coleção ${serie.titulo}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
        </div>
        <div className="relative z-10 p-4 max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">Coleção Exclusiva</Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                {serie.titulo}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
                {`Uma curadoria inédita com ${totalTattoos} artes, explorando estilos, significados e referências para inspirar seus próximos projetos.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-12 px-8">
                    Acessar Agora
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 hover:text-white text-lg h-12 px-8">
                    Ver exemplos da coleção
                </Button>
            </div>
        </div>
      </section>

      {/* Block 2: Value Proposition */}
      <section className="py-16 lg:py-24 bg-gray-50">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">O que você vai encontrar nesta coleção</h2>
            <p className="text-lg text-gray-600 mb-8">
                {serie.descricao}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
                <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold">{totalTattoos} Tatuagens</h3>
                        <p className="text-gray-500 text-sm">Artes únicas e prontas para uso.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold">{serie.modulos?.length || 0} Módulos</h3>
                        <p className="text-gray-500 text-sm">Organizado por temas e estilos.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold">Significados</h3>
                        <p className="text-gray-500 text-sm">Contexto e simbolismo detalhados.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold">Acesso Vitalício</h3>
                        <p className="text-gray-500 text-sm">Pague uma vez, use para sempre.</p>
                    </div>
                </div>
            </div>
         </div>
      </section>
      
       {/* Block 3: Modules */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-8 text-center">Navegue pelos Módulos</h2>
          <div className="space-y-8">
            {(serie.modulos ?? []).map(modulo => (
              <div key={modulo.id} className="p-6 border rounded-lg">
                <h3 className="text-2xl font-bold">{modulo.titulo}</h3>
                <p className="text-gray-600">{modulo.descricao}</p>
                <p className="text-sm text-gray-500 mt-2">{(modulo.tatuagens?.length || 0)} tatuagens</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Block 4: Gallery */}
       <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-8 text-center">Galeria Premium</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(serie.modulos ?? []).flatMap(m => m.tatuagens ?? []).slice(0, 8).map(tatuagem => (
              <div key={tatuagem.id} className="aspect-[3/4] relative overflow-hidden rounded-lg group">
                <Image src={tatuagem.capa_url} alt={tatuagem.titulo} fill className="object-cover"/>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-bold">{tatuagem.titulo}</p>
                </div>
              </div>
            ))}
           </div>
        </div>
      </section>

      {/* Block 6: Pricing */}
       <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-md mx-auto px-4 text-center border rounded-lg p-8">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Acesso Completo</h2>
          <p className="text-5xl font-extrabold mb-6">
            R$ {serie.preco.toFixed(2).replace('.', ',')}
          </p>
          <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-12 px-8">
            Comprar Agora
          </Button>
           <p className="text-xs text-gray-500 mt-4">Acesso vitalício e todas as futuras atualizações incluídas.</p>
        </div>
      </section>

    </div>
  );
}
