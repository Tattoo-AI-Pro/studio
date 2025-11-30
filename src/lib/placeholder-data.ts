
import { AiBook } from './types';
import { PlaceHolderImages } from './placeholder-images';

// This is a helper function to find an image from our placeholder JSON
const findImage = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    if (!img) throw new Error(`Placeholder image with id "${id}" not found.`);
    return img.imageUrl;
}

// This data is a mock and will be replaced with live data from Firestore.
// It uses placeholder images for demonstration. In a real scenario,
// these URLs would come from a user's upload or a generated source.
export const placeholderBookData: AiBook = {
  id: 'placeholder-book-1',
  ownerId: 'placeholder-owner-id',
  name: 'Tatuagens Místicas: Uma Coleção AI',
  shortDescription: 'Uma coleção de tatuagens místicas com seus significados profundos, gerada por IA.',
  longDescription: 'Explore um universo de símbolos e significados com esta coleção exclusiva. Cada tatuagem foi analisada e descrita por nossa IA para oferecer inspiração e conhecimento. Perfeito para quem busca uma tatuagem com alma e história.',
  theme: 'Místico & Esotérico',
  targetAudience: 'Pessoas interessadas em espiritualidade, simbologia e tatuagens com significado.',
  tags: ['místico', 'espiritual', 'símbolos', 'significado', '2026'],
  coverArtUrl: findImage('cover-art-1'),
  price: 99.90,
  promoPrice: 49.90,
  modules: [
    {
      id: 'module-1',
      name: 'Módulo 1: Mini Tattoos Místicas',
      description: 'Símbolos poderosos em formatos delicados e minimalistas.',
      images: [
        {
          id: 'img-1',
          sourceUrl: findImage('tattoo-1'),
          aiTitle: 'Voo da Liberdade',
          aiDescription: 'Um avião de papel simbolizando a liberdade, a jornada e a leveza da alma. Ideal para pulsos e tornozelos.',
          aiTheme: 'Minimalista',
          aiStyle: 'Fine-line',
          aiSeoTags: ['minimalista', 'fine-line', 'avião de papel', 'liberdade'],
          aiInstagramCaption: 'Deixe sua alma voar. ✈️ #minitattoo #fineline #tattooinspiration',
        },
        {
          id: 'img-4',
          sourceUrl: findImage('tattoo-4'),
          aiTitle: 'Poeira Estelar',
          aiDescription: 'Uma constelação delicada que representa a conexão com o cosmos e o universo interior.',
          aiTheme: 'Celestial',
          aiStyle: 'Fine-line',
          aiSeoTags: ['constelação', 'celestial', 'espaço', 'minimalista'],
          aiInstagramCaption: 'Escrito nas estrelas. ✨ #celestialtattoo #constellation #startattoo',
        },
        {
            id: 'img-10',
            sourceUrl: findImage('tattoo-10'),
            aiTitle: 'Luz Interior',
            aiDescription: 'Um pequeno sol que representa a energia vital, a luz interior e o otimismo.',
            aiTheme: 'Celestial',
            aiStyle: 'Minimalista',
            aiSeoTags: ['sol', 'minimalista', 'energia'],
            aiInstagramCaption: 'Seja sua própria luz. ☀️ #suntattoo #tinytattoo #minimalist',
        },
      ],
    },
    {
      id: 'module-2',
      name: 'Módulo 2: Realismo Mágico Feminino',
      description: 'Retratos femininos que mesclam o realismo com elementos surreais e mágicos.',
      images: [
        {
          id: 'img-2',
          sourceUrl: findImage('tattoo-9'),
          aiTitle: 'Florescer da Alma',
          aiDescription: 'Um braço adornado com flores realistas, simbolizando o florescimento pessoal e a beleza da natureza.',
          aiTheme: 'Floral',
          aiStyle: 'Realismo',
          aiSeoTags: ['floral', 'realismo', 'flores', 'feminina'],
          aiInstagramCaption: 'Floresça onde estiver plantada. 🌺 #floraltattoo #realism #tattooforgirls',
        },
        {
          id: 'img-5',
          sourceUrl: findImage('tattoo-5'),
          aiTitle: 'Olhar da Deusa',
          aiDescription: 'Um retrato feminino hiper-realista que captura a força e a serenidade do arquétipo da deusa.',
          aiTheme: 'Retrato',
          aiStyle: 'Realismo',
          aiSeoTags: ['retrato', 'realismo', 'deusa', 'feminina'],
          aiInstagramCaption: 'O poder de um olhar. #portraittattoo #realismtattoo #goddess',
        },
      ],
    },
    {
        id: 'module-3',
        name: 'Módulo 3: Símbolos de Poder',
        description: 'Animais e objetos que carregam forte simbologia e poder ancestral.',
        images: [
            {
                id: 'img-3',
                sourceUrl: findImage('tattoo-3'),
                aiTitle: 'Lobo Geométrico',
                aiDescription: 'A força e a inteligência do lobo representadas em traços geométricos precisos, unindo natureza e ordem.',
                aiTheme: 'Animal',
                aiStyle: 'Geométrico',
                aiSeoTags: ['lobo', 'geométrico', 'animal', 'força'],
                aiInstagramCaption: 'Instinto e precisão. #wolftattoo #geometrictattoo #animaltattoo',
            },
        ]
    }
  ],
};
