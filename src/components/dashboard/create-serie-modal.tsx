
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, serverTimestamp, addDoc, writeBatch, doc } from 'firebase/firestore';
import { LoaderCircle, PlusCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Serie } from '@/lib/types';
import { generateAiBookSuggestions, type AiBookSuggestionsInput } from '@/ai/flows/ai-suggestions-book-creation';

interface CreateSerieModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSerieModal({ open, onOpenChange }: CreateSerieModalProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');

  const handleCreate = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para criar uma coleção.',
      });
      return;
    }
    if (!title) {
        toast({
            variant: 'destructive',
            title: 'Campo obrigatório',
            description: 'O título da coleção não pode ser vazio.',
        });
        return;
    }

    setIsCreating(true);

    const newSerieData: Omit<Serie, 'id'> = {
      titulo: title,
      descricao: description,
      publico_alvo: targetAudience,
      autor_id: user.uid,
      status: 'rascunho',
      preco: 0,
      tags_gerais: [],
      capa_url: `https://picsum.photos/seed/${title.replace(/\s+/g, '-')}/600/800`,
      modulos_count: 0,
      tatuagens_count: 0,
      data_criacao: serverTimestamp(),
      data_atualizacao: serverTimestamp(),
    };

    try {
      const seriesCollection = collection(firestore, 'series');
      // Use addDoc and get the returned DocumentReference
      const docRef = await addDoc(seriesCollection, newSerieData);
      
      toast({
        title: 'Coleção criada!',
        description: `"${title}" foi criada com sucesso.`,
      });

      router.push(`/books/${docRef.id}`);

    } catch (error) {
      console.error('Error creating new serie:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar coleção',
        description: 'Não foi possível criar a coleção. Tente novamente.',
      });
    } finally {
        setIsCreating(false);
    }
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    try {
        const input: AiBookSuggestionsInput = {
            name: title,
            price: 0, // Price is not part of the form yet
            description: description,
            targetAudience: targetAudience,
        };
        const suggestions = await generateAiBookSuggestions(input);
        
        if (suggestions.suggestedTitle) {
            setTitle(suggestions.suggestedTitle);
        }
        if (suggestions.improvedDescription) {
            setDescription(suggestions.improvedDescription);
        }

        toast({
            title: 'Sugestões aplicadas!',
            description: 'A IA refinou o título e a descrição da sua coleção.',
        });

    } catch (error) {
        console.error('Error getting AI suggestions:', error);
        toast({
            variant: 'destructive',
            title: 'Erro ao buscar sugestões',
            description: 'Não foi possível obter sugestões da IA. Tente novamente.',
        });
    } finally {
        setIsSuggesting(false);
    }
  }

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetAudience('');
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        resetForm();
    }
    onOpenChange(isOpen);
  }

  const isLoading = isCreating || isSuggesting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="ml-auto gap-1">
            Criar Coleção
            <PlusCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-semibold text-2xl">Criar Nova Coleção</DialogTitle>
          <DialogDescription>
            Defina as informações iniciais da sua nova coleção de tatuagens. Você pode usar a IA para refinar os detalhes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="title" className="font-semibold">Título da Coleção</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Tatuagens Florais Minimalistas"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="description" className="font-semibold">Breve Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a essência da sua coleção. Para quem ela é?"
              className="min-h-24"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="targetAudience" className="font-semibold">Público-alvo</Label>
            <Input
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Ex: Mulheres de 20-35 anos que amam natureza"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" className="gap-2" onClick={handleSuggest} disabled={isLoading}>
                {isSuggesting ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                    <Sparkles className="w-4 h-4" />
                )}
                Sugerir com IA
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
                {isCreating ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                )}
                Criar Coleção
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
