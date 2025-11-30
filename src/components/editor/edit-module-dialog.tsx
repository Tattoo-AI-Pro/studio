
'use client';

import { useEffect, useState } from 'react';
import { LoaderCircle, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Modulo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


interface EditModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Omit<Modulo, 'id'>>, moduleId?: string) => Promise<void>;
  module: Modulo | null;
}

export function EditModuleDialog({
  open,
  onOpenChange,
  onSave,
  module,
}: EditModuleDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const isEditing = !!module;

  useEffect(() => {
    if (open) {
      setTitle(module?.titulo ?? '');
      setDescription(module?.descricao ?? '');
    }
  }, [open, module]);

  const handleSave = async () => {
    if (!title) {
        toast({
            variant: 'destructive',
            title: 'Campo obrigatório',
            description: 'O título do módulo não pode ser vazio.',
        });
        return;
    }
    
    setIsSaving(true);
    await onSave({
        titulo: title,
        descricao: description,
    }, module?.id);
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-semibold text-2xl">{isEditing ? 'Editar' : 'Criar Novo'} Módulo</DialogTitle>
          <DialogDescription>
            Defina as informações deste módulo. Módulos são como capítulos da sua coleção.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="module-title" className="font-semibold">Título do Módulo</Label>
            <Input
              id="module-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Tatuagens Florais Minimalistas"
              disabled={isSaving}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="module-description" className="font-semibold">Breve Descrição</Label>
            <Textarea
              id="module-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a essência deste módulo. O que ele agrupa?"
              className="min-h-24"
              disabled={isSaving}
            />
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Módulo
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
