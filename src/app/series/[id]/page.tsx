
import type { Serie } from '@/lib/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, ShoppingCart } from 'lucide-react';

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
  const allTattoos = (serie.modulos ?? []).flatMap(m => m.tatuagens ?? []);

  return (
    <div className="bg-black text-white font-sans">
      {/* Block 1: Hero */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={serie.capa_url}
            alt={`Capa da coleção ${serie.titulo}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" />
        </div>
        <div className="relative z-10 p-4 max-w-4xl mx-auto flex flex-col items-center">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md aspect-[3/4] relative mb-8" style={{transform: "perspective(1000px) rotateX(0deg) rotateY(-10deg)", transformStyle: "preserve-3d"}}>
              <Image 
                src={serie.capa_url}
                alt={`Capa 3D da coleção ${serie.titulo}`}
                fill
                className="object-cover rounded-lg shadow-2xl shadow-primary/20"
              />
            </div>
            <Badge variant="outline" className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm">Coleção Exclusiva 2026</Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}>
                {serie.titulo}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
                {`Uma curadoria inédita com ${totalTattoos} artes, explorando estilos, significados e referências para inspirar seus próximos projetos.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-12 px-8 rounded-full font-bold shadow-lg shadow-primary/30">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Comprar Agora
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-lg h-12 px-8 rounded-full font-bold">
                    Ver exemplos
                </Button>
            </div>
        </div>
      </section>
      
      {/* Block 2: Value Proposition */}
      <section className="py-16 lg:py-24 bg-white text-black">
         <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">O que você vai encontrar nesta coleção</h2>
            <p className="text-lg text-gray-700 mb-12 max-w-3xl mx-auto">
                {serie.descricao}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="p-6 rounded-lg bg-gray-50 border">
                    <CheckCircle className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-bold text-xl mb-1">{totalTattoos}+ Tatuagens Únicas</h3>
                    <p className="text-gray-600 text-sm">Artes prontas para uso, com alta resolução e detalhes impressionantes.</p>
                </div>
                 <div className="p-6 rounded-lg bg-gray-50 border">
                    <CheckCircle className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-bold text-xl mb-1">{serie.modulos?.length || 0} Módulos Organizados</h3>
                    <p className="text-gray-600 text-sm">Navegue facilmente por temas, estilos e conceitos para encontrar a inspiração certa.</p>
                </div>
                 <div className="p-6 rounded-lg bg-gray-50 border">
                    <CheckCircle className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-bold text-xl mb-1">Acesso Vitalício</h3>
                    <p className="text-gray-600 text-sm">Pague uma vez e tenha acesso para sempre, incluindo todas as futuras atualizações.</p>
                </div>
            </div>
         </div>
      </section>
      
      {/* Block 3: Modules (To be implemented with Tabs) */}
      <section className="py-16 lg:py-24 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-12 text-center">Navegue pelos Módulos</h2>
          <div className="space-y-8">
            {(serie.modulos ?? []).map(modulo => (
              <div key={modulo.id} className="p-6 border border-gray-800 rounded-lg bg-gray-900/50">
                <h3 className="text-2xl font-bold text-primary">{modulo.titulo}</h3>
                <p className="text-gray-400 mt-2">{modulo.descricao}</p>
                <p className="text-sm text-gray-500 mt-2">{(modulo.tatuagens?.length || 0)} tatuagens neste módulo</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Block 4: Gallery */}
       <section className="py-16 lg:py-24 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-12 text-center">Galeria Premium</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allTattoos.slice(0, 8).map(tatuagem => (
              <div key={tatuagem.id} className="aspect-[3/4] relative overflow-hidden rounded-lg group shadow-lg">
                <Image src={tatuagem.capa_url} alt={tatuagem.titulo} fill className="object-cover transition-transform duration-300 group-hover:scale-110"/>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                    <p className="text-white font-bold text-lg">{tatuagem.titulo}</p>
                </div>
              </div>
            ))}
           </div>
           {allTattoos.length > 8 && (
            <div className="text-center mt-12">
                <Button size="lg" variant="outline" className="border-gray-300 text-black hover:bg-gray-100">Ver todas as {totalTattoos} artes</Button>
            </div>
           )}
        </div>
      </section>
      
      {/* Block 5: Why it matters (Placeholder) */}
      <section className="py-16 lg:py-24 bg-black">
        <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6 text-primary">Por que esta coleção é diferente?</h2>
            <p className="text-lg text-gray-400">Nós vamos além da imagem. Cada arte é enriquecida com contexto, simbolismo e dados de tendência, transformando inspiração em projetos de sucesso.</p>
        </div>
      </section>

      {/* Block 6: Pricing */}
       <section className="py-16 lg:py-24 bg-white text-black">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="border rounded-xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Acesso Completo e Imediato</h2>
            <p className="text-gray-500 mb-6">Tudo que você precisa em um único pacote.</p>
            <p className="text-6xl font-extrabold mb-6">
              R$ {serie.preco.toFixed(2).replace('.', ',')}
            </p>
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xl h-14 rounded-full font-bold shadow-lg shadow-primary/30">
              Garantir minha coleção
            </Button>
            <p className="text-xs text-gray-500 mt-4">Pagamento único. Acesso vitalício.</p>
          </div>
        </div>
      </section>

      {/* Block 7: Social Proof (Placeholder) */}
      <section className="py-16 lg:py-24 bg-black">
          <div className="max-w-3xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">Junte-se a centenas de artistas</h2>
              <p className="text-lg text-gray-400 mb-8">Nossas coleções já inspiraram projetos incríveis. Veja o que estão dizendo.</p>
               <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl h-14 px-10 rounded-full font-bold shadow-lg shadow-primary/30">
                    Quero Acessar Agora
                </Button>
          </div>
      </section>
    </div>
  );
}
