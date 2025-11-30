
import { NextResponse } from 'next/server';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server'; // Using server-side initialization
import type { AiBook, Module, ImageItem } from '@/lib/types';

// IMPORTANT: This function needs to be 'GET' to be a public API route
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: bookId } = params;

  if (!bookId) {
    return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
  }

  try {
    const { firestore } = initializeFirebase();
    const bookRef = doc(firestore, 'ai_books', bookId);
    const bookSnap = await getDoc(bookRef);

    if (!bookSnap.exists()) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const bookData = bookSnap.data() as Omit<AiBook, 'id' | 'modules'>;

    // Fetch modules and their images
    const modulesCollectionRef = collection(firestore, `ai_books/${bookId}/modules`);
    const modulesSnapshot = await getDocs(modulesCollectionRef);

    const modules: Module[] = [];
    for (const moduleDoc of modulesSnapshot.docs) {
      const moduleData = moduleDoc.data() as Omit<Module, 'id' | 'images'>;
      
      const imagesCollectionRef = collection(firestore, `ai_books/${bookId}/modules/${moduleDoc.id}/images`);
      const imagesSnapshot = await getDocs(imagesCollectionRef);
      
      const images: ImageItem[] = imagesSnapshot.docs.map(imageDoc => ({
        id: imageDoc.id,
        ...imageDoc.data(),
      } as ImageItem));

      modules.push({
        id: moduleDoc.id,
        name: moduleData.name,
        description: moduleData.description,
        images: images,
      });
    }

    const fullBook: AiBook = {
      id: bookSnap.id,
      ...bookData,
      modules: modules,
    };

    return NextResponse.json(fullBook);

  } catch (error) {
    console.error(`Error fetching book ${bookId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
