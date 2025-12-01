
import { NextResponse } from 'next/server';
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server'; // Using server-side initialization
import type { Serie, Modulo, Tatuagem } from '@/lib/types';

// IMPORTANT: This function needs to be 'GET' to be a public API route
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: serieId } = params;

  if (!serieId) {
    return NextResponse.json({ error: 'Serie ID is required' }, { status: 400 });
  }

  try {
    const { firestore } = initializeFirebase();
    const serieRef = doc(firestore, 'series', serieId);
    const serieSnap = await getDoc(serieRef);

    if (!serieSnap.exists()) {
      return NextResponse.json({ error: 'Serie not found' }, { status: 404 });
    }

    const serieData = serieSnap.data() as Omit<Serie, 'id' | 'modulos'>;

    // Fetch modules and their tattoos
    const modulosQuery = query(collection(firestore, `series/${serieId}/modulos`), orderBy('data_criacao', 'asc'));
    const modulosSnapshot = await getDocs(modulosQuery);

    const modulos: Modulo[] = [];
    for (const moduloDoc of modulosSnapshot.docs) {
      const moduloData = moduloDoc.data() as Omit<Modulo, 'id' | 'tatuagens'>;
      
      const tatuagensQuery = query(collection(firestore, `series/${serieId}/modulos/${moduloDoc.id}/tatuagens`), orderBy('data_criacao', 'asc'));
      const tatuagensSnapshot = await getDocs(tatuagensQuery);
      
      const tatuagens: Tatuagem[] = tatuagensSnapshot.docs.map(tatuagemDoc => ({
        id: tatuagemDoc.id,
        ...tatuagemDoc.data(),
      } as Tatuagem));

      modulos.push({
        ...moduloData,
        id: moduloDoc.id,
        tatuagens: tatuagens,
      });
    }

    const fullSerie: Serie = {
      id: serieSnap.id,
      ...serieData,
      modulos: modulos,
    };

    return NextResponse.json(fullSerie);

  } catch (error) {
    console.error(`Error fetching serie ${serieId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
