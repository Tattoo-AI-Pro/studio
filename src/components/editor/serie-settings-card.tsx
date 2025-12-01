
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, serverTimestamp } from 'firebase/firestore';
import { LoaderCircle, Save, Image as ImageIcon } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';


interface SerieSettingsCardProps {
  book: Serie;
  onBookUpdate: (updatedBook: Serie) => void;
}

const serieSchema = z.object({
  titulo: z.string().min(1, { message: 'O título é obrigatório.' }),
  descricao: z.string().optional(),
  status: z.enum(['rascunho', 'publicada', 'pausada']),
  capa_url: z.string().optional(),
});

type SerieFormData = z.infer<typeof serieSchema>;

export function SerieSettingsCard({ book, onBookUpdate }: SerieSettingsCardProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SerieFormData>({
    resolver: zodResolver(serieSchema),
    defaultValues: {
      titulo: book.titulo || '',
      descricao: book.descricao || '',
      status: book.status || 'rascunho',
      capa_url: book.capa_url || '',
    },
  });

  const capaUrl = form.watch('capa_url');

  useEffect(() => {
    form.reset({
      titulo: book.titulo,
      descricao: book.descricao,
      status: book.status,
      capa_url: book.capa_url,
    });
  }, [book, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      form.setValue('capa_url', dataUri, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

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
      form.reset(data); // resync form with saved data
    }, 500);
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-semibold text-2xl">Configurações da Série</CardTitle>
            <CardDescription className="font-sans text-base">
              Edite as informações principais e a capa da sua coleção.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 flex flex-col items-center">
                 <FormLabel className="font-semibold w-full text-center md:text-left">Imagem de Capa</FormLabel>
                 <div className="w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden relative border">
                    {capaUrl ? (
                         <Image 
                            src={capaUrl}
                            alt="Capa da coleção"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 80vw, 30vw"
                            data-ai-hint="book cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center flex-col gap-2 text-muted-foreground">
                            <ImageIcon className="w-10 h-10" />
                            <span className="text-sm">Sem capa</span>
                        </div>
                    )}
                 </div>
                 <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    Alterar Capa
                 </Button>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
            <div className="md:col-span-2 space-y-6">
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
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
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
