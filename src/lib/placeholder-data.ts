
import type { Serie } from './types';
import { serverTimestamp } from 'firebase/firestore';

// This data is a mock and will be replaced with live data from Firestore.
export const placeholderSerieData: Omit<Serie, 'id' | 'data_criacao' | 'data_atualizacao'> = {
  autor_id: 'placeholder-owner-id',
  titulo: 'Nova Série (Copie e Edite)',
  descricao: 'Comece com este modelo e personalize sua nova coleção de tatuagens.',
  publico_alvo: 'Amantes de tatuagem',
  preco: 0,
  status: 'rascunho',
  tags_gerais: ['nova', 'tatuagem', '2026'],
  capa_url: 'https://picsum.photos/seed/placeholder-cover/600/800',
  modulos_count: 0,
  tatuagens_count: 0,
  modulos: [],
};
