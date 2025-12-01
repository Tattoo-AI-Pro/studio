
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, serverTimestamp } from 'firebase/firestore';
import { LoaderCircle, Save, Image as ImageIcon, PlusCircle, Sparkles, RefreshCcw } from 'lucide-react';
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
import { Badge } from '../ui/badge';


interface SerieSettingsCardProps {
  book: Serie;
  onBookUpdate: (updatedBook: Serie) => void;
  onCreateModule: () => void;
  onCompile: () => void;
  isCompiling: boolean;
}

const serieSchema = z.object({
  titulo: z.string().min(1, { message: 'O título é obrigatório.' }),
  descricao: z.string().optional(),
  publico_alvo: z.string().optional(),
  preco: z.coerce.number().min(0, { message: 'O preço não pode ser negativo.'}),
  tags_gerais: z.string().optional(),
  status: z.enum(['rascunho', 'publicada', 'pausada']),
  capa_url: z.string().optional(),
});

type SerieFormData = z.infer<typeof serieSchema>;

const StringToArrayInput = ({ value, onChange, placeholder }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string }) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    return (
      <div>
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        <div className="flex flex-wrap gap-1 pt-2">
          {items.map((item, i) => (
            <Badge key={i} variant="secondary">{item}</Badge>
          ))}
        </div>
      </div>
    );
};

export function SerieSettingsCard({ book, onBookUpdate, onCreateModule, onCompile, isCompiling }: SerieSettingsCardProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SerieFormData>({
    resolver: zodResolver(serieSchema),
    defaultValues: {
      titulo: book.titulo || '',
      descricao: book.descricao || '',
      publico_alvo: book.publico_alvo || '',
      preco: book.preco || 0,
      tags_gerais: (book.tags_gerais || []).join(', '),
      status: book.status || 'rascunho',
      capa_url: book.capa_url || '',
    },
  });

  const capaUrl = form.watch('capa_url');

  useEffect(() => {
    form.reset({
      titulo: book.titulo,
      descricao: book.descricao,
      publico_alvo: book.publico_alvo,
      preco: book.preco,
      tags_gerais: (book.tags_gerais || []).join(', '),
      status: book.status,
      capa_url: book.capa_url,
    });
  }, [book, form]);

  const handleGenerateCover = () => {
    const title = form.getValues('titulo') || 'default';
    // Generate a new random seed to get a new image
    const randomSeed = Math.random().toString(36).substring(7);
    const generatedCapaUrl = `https://picsum.photos/seed/${title.replace(/\s+/g, '-')}-${randomSeed}/800/600`;
    form.setValue('capa_url', generatedCapaUrl, { shouldDirty: true });
  };

  const onSubmit = async (data: SerieFormData) => {
    setIsSaving(true);
    const bookRef = doc(firestore, 'series', book.id);

    const updateData = {
      ...data,
      capa_url: data.capa_url || `https://picsum.photos/seed/${data.titulo.replace(/\s+/g, '-')}/800/600`,
      tags_gerais: data.tags_gerais?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
      data_atualizacao: serverTimestamp(),
    };

    updateDocumentNonBlocking(bookRef, updateData);
    
    onBookUpdate({ ...book, ...updateData });

    setTimeout(() => {
      toast({
        title: 'Coleção salva!',
        description: 'As informações da coleção foram atualizadas.',
      });
      setIsSaving(false);
      form.reset({
        ...updateData,
        tags_gerais: updateData.tags_gerais.join(', ')
      }); 
    }, 500);
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-semibold text-2xl">Configurações da Coleção</CardTitle>
            <CardDescription className="font-sans text-base">
              Edite as informações principais e a capa da sua coleção. Salve as alterações para vê-las refletidas.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 flex flex-col items-center">
                 <FormLabel className="font-semibold w-full text-left">Imagem de Capa</FormLabel>
                 <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden relative border">
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
                 <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGenerateCover}>
                    <RefreshCcw className="w-4 h-4" />
                    Gerar Nova Capa
                 </Button>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="publico_alvo"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="font-semibold">Público-alvo</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Mulheres de 20-35 anos" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="preco"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Preço (BRL)</FormLabel>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">R$</span>
                                    <FormControl>
                                        <Input type="number" placeholder="49.90" className="pl-9" {...field} />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="tags_gerais"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-semibold">Tags Gerais</FormLabel>
                        <FormControl>
                           <StringToArrayInput
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                placeholder="floral, minimalista, 2026"
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
          <CardFooter className="flex-col sm:flex-row items-center gap-2 border-t pt-6">
            <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
              {isSaving ? (
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={onCreateModule}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Módulo
            </Button>
            <Button onClick={onCompile} disabled={isCompiling}>
                {isCompiling ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Sparkles className="mr-2 h-4 mr-2" />
                )}
                Compilar AI-Book
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    