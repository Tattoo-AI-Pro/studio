
"use client";

import {
  FileText,
  Globe,
  Image as ImageIcon,
  Copy,
  Download,
  LoaderCircle,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { AiBookCompilationOutput } from "@/ai/flows/ai-book-compilation";

export type CompilationResult = AiBookCompilationOutput;

interface CompileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCompiling: boolean;
  compilationResult: CompilationResult | null;
  bookName: string;
}

export function CompileDialog({
  open,
  onOpenChange,
  isCompiling,
  compilationResult,
  bookName,
}: CompileDialogProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string | undefined, label: string) => {
    if (!text) {
        toast({ variant: "destructive", title: "Nada para copiar." });
        return;
    };
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} foi copiado para a área de transferência.`,
    });
  };

  const renderLoading = () => (
    <>
      <DialogHeader>
        <DialogTitle className="sr-only">Compilando seu AI-Book</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <LoaderCircle className="w-12 h-12 text-primary animate-spin" />
        <h3 className="font-semibold text-2xl">Compilando seu AI-Book...</h3>
        <p className="font-sans text-muted-foreground text-center">
          A IA está trabalhando sua mágica: gerando PDFs, arte de capa e mais.
          <br />
          Isso pode levar um momento.
        </p>
      </div>
    </>
  );

  const renderResults = () => (
    <>
      <DialogHeader className="text-center items-center">
        <PartyPopper className="w-12 h-12 text-primary" />
        <DialogTitle className="font-semibold text-3xl">
          Compilação Completa!
        </DialogTitle>
        <DialogDescription className="font-sans text-base">
          Sua coleção "{bookName}" e seus ativos foram gerados.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-lg">Versão em PDF</p>
              <p className="text-sm text-muted-foreground">
                Em breve para download
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <ImageIcon className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-lg">Arte de Capa</p>
              <p className="text-sm text-muted-foreground">Em breve para download</p>
            </div>
          </div>
          <Button size="sm" variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <Globe className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-lg">Site de Vendas & Versão Web</p>
              <a
                href={compilationResult?.webVersionUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline"
              >
                {compilationResult?.webVersionUrl || "Gerando URL..."}
              </a>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              copyToClipboard(compilationResult?.webVersionUrl, "URL do Site")
            }
          >
            <Copy className="mr-2 h-4 w-4" /> Copiar URL
          </Button>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <div>
                <p className="font-semibold text-lg">Cópia de Marketing</p>
                <p className="text-sm text-muted-foreground">
                  Pronta para usar em suas campanhas
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                copyToClipboard(compilationResult?.marketingCopies, "Cópia de Marketing")
              }
            >
              <Copy className="mr-2 h-4 w-4" /> Copiar
            </Button>
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-md font-code text-sm">
            <p className="whitespace-pre-wrap">{compilationResult?.marketingCopies || "Gerando cópia de marketing..."}</p>
          </div>
        </div>
      </div>
    </>
  );

  const shouldRenderResults = !isCompiling && compilationResult;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {shouldRenderResults ? renderResults() : renderLoading()}
      </DialogContent>
    </Dialog>
  );
}
