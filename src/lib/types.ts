
export interface Like {
  userId: string;
  timestamp: Date;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
}

export interface Tatuagem {
  id: string;
  capa_url: string;
  titulo: string;
  descricao_contextual: string;
  tema: string;
  estilos: string[];
  significado_literal: string;
  significado_subjetivo: string;
  cores_usadas: string[];
  elementos_presentes: string[];
  tom_emocional: string;
  local_sugerido: string;
  simbolismo: string;
  referencia_cultural: string;
  tags: string[];
  likes: number;
  comentarios_count: number;
  compartilhamentos: number;
  data_criacao: any;
  data_atualizacao: any;
  autor_id: string;
  origem: 'manual' | 'IA';
}

export interface Modulo {
  id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  data_criacao: any;
  data_atualizacao: any;
  tatuagens_count: number;
  // tatuagens?: Tatuagem[]; // This is deprecated, tattoos are now a subcollection
}

export interface Serie {
  id: string;
  capa_url: string;
  titulo: string;
  descricao: string;
  publico_alvo: string;
  preco: number;
  status: 'rascunho' | 'publicada' | 'pausada';
  data_criacao: any;
  data_atualizacao: any;
  autor_id: string;
  tags_gerais: string[];
  modulos_count: number;
  tatuagens_count: number;
  // modulos?: Modulo[]; // This is deprecated, modules are now a subcollection
}

// Legacy types for gradual migration if needed
export type AiBook = Serie;
export type Module = Modulo;
export type ImageItem = Tatuagem;
