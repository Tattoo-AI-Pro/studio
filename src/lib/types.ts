export interface ImageItem {
  id: string;
  sourceUrl: string; // from placeholder-images.json
  aiTitle: string;
  aiDescription: string;
  aiTheme: string;
  aiStyle: string;
  aiSeoTags: string[];
  aiInstagramCaption: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  images: ImageItem[];
}

export interface AiBook {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  theme: string;
  targetAudience: string;
  tags: string[];
  coverArtUrl: string; // from placeholder-images.json
  modules: Module[];
  price: number;
  promoPrice?: number;
}
