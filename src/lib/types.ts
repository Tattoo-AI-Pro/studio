
export interface ImageItem {
  id: string;
  moduleId: string;
  sourceUrl: string; // URL from an image store (e.g. Firebase Storage or other)
  title: string;
  description: string;
  theme: string;
  style: string;
  tags: string[];
  instagramCaption: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  images: ImageItem[];
}

export interface AiBook {
  id: string;
  ownerId: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  theme: string;
  targetAudience: string;
  tags: string[];
  coverArtUrl?: string; // from placeholder-images.json or other source
  modules: Module[];
  price: number;
  promoPrice?: number;
}
