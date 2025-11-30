
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, serverTimestamp } from 'firebase/firestore';
import { LoaderCircle, Save } from 'lucide-react';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Serie } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface SerieSettingsCardProps {
  book: Serie;
  onBookUpdate: (updatedBook: Serie) => void;
}

const serieSchema = z.object({
  titulo: z.string().min(1, { message: 'O título é obrigatório.' }),
  descricao: z.string().optional(),
  status: z.enum(['rascunho', 'publicada', 'pausada']),
});

type SerieFormData = z.infer<typeof serieSchema>;

export function SerieSettingsCard({ book, onBookUpdate }: SerieSettingsCardProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SerieFormData>({
    resolver: zodResolver(serieSchema),
    defaultValues: {
      titulo: book.titulo || '',
      descricao: book.descricao || '',
      status: book.status || 'rascunho',
    },
  });

  useEffect(() => {
    form.reset({
      titulo: book.titulo,
      descricao: book.descricao,
      status: book.status,
    });
  }, [book, form]);

  const onSubmit = async (data: SerieFormData) => {
    setIsSaving(true);
    const bookRef = doc(firestore, 'series', book.id);
    
    const updateData = {
      ...data,
      data_atualizacao: serverTimestamp(),
    };

    updateDocumentNonBlocking(bookRef, updateData);
    
    // Optimistically update local state
    onBookUpdate({ ...book, ...data });

    setTimeout(() => {
      toast({
        title: 'Coleção salva!',
        description: 'As informações da coleção foram atualizadas.',
      });
      setIsSaving(false);
    }, 500);
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-semibold text-2xl">Configurações da Série</CardTitle>
            <CardDescription className="font-sans text-base">
              Edite as informações principais da sua coleção.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Tatuagens Florais Minimalistas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a essência da sua coleção. Para quem ela é?"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="publicada">Publicada</SelectItem>
                      <SelectItem value="pausada">Pausada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    