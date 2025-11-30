
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import type { Serie } from '@/lib/types';
import { LoaderCircle } from 'lucide-react';
import { placeholderSerieData } from '@/lib/placeholder-data';

export default function NewBookPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    if (!user) {
      router.replace('/');
      return;
    }

    const createNewSerie = async () => {
      const newSerieData: Omit<Serie, 'id'> = {
        ...placeholderSerieData,
        autor_id: user.uid,
        data_criacao: serverTimestamp(),
        data_atualizacao: serverTimestamp(),
      };

      try {
        const seriesCollection = collection(firestore, 'series');
        const docRef = await addDocumentNonBlocking(seriesCollection, newSerieData);
        
        if (docRef) {
          router.replace(`/books/${docRef.id}`);
        } else {
            router.replace('/');
        }
      } catch (error) {
        console.error('Error creating new serie:', error);
        router.replace('/');
      }
    };

    createNewSerie();
  }, [user, isUserLoading, firestore, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      <h1 className="font-semibold text-2xl">Criando sua nova coleção...</h1>
      <p className="text-muted-foreground">Aguarde, estamos preparando tudo para você.</p>
    </div>
  );
}
