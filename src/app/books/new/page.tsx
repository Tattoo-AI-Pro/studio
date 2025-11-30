'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { AiBook } from '@/lib/types';
import { LoaderCircle } from 'lucide-react';

export default function NewBookPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      // Wait until user status is resolved
      return;
    }

    if (!user) {
      // If no user, redirect to home page to login
      router.replace('/');
      return;
    }

    // Once user is confirmed, create the new book
    const createNewBook = async () => {
      const newBookData: Omit<AiBook, 'id' | 'coverArtUrl' | 'modules'> = {
        ownerId: user.uid,
        name: 'Nova Coleção Sem Título',
        shortDescription: 'Descreva sua nova coleção de tatuagens aqui.',
        longDescription: 'Use este espaço para dar mais detalhes sobre o tema, estilo e propósito da sua coleção.',
        theme: 'Geral',
        targetAudience: 'Todos os públicos',
        tags: ['nova-colecao'],
        price: 0.00,
        promoPrice: 0.00,
      };

      try {
        const booksCollection = collection(firestore, 'ai_books');
        const docRef = await addDocumentNonBlocking(booksCollection, {
            ...newBookData,
            // Add placeholder values for fields that are required but not in the Omit
            coverArtUrl: '',
            modules: [],
        });
        
        if (docRef) {
          router.replace(`/books/${docRef.id}`);
        } else {
            // Handle case where docRef is not returned, maybe show an error
            router.replace('/');
        }
      } catch (error) {
        console.error('Error creating new book:', error);
        // Optionally, show a toast notification to the user
        router.replace('/');
      }
    };

    createNewBook();
  }, [user, isUserLoading, firestore, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      <h1 className="font-headline text-2xl">Criando sua nova coleção...</h1>
      <p className="text-muted-foreground">Aguarde, estamos preparando tudo para você.</p>
    </div>
  );
}
