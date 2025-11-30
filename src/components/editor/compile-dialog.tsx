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

interface CompileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCompiling: boolean;
  bookName: string;
}

export function CompileDialog({
  open,
  onOpenChange,
  isCompiling,
  bookName,
}: CompileDialogProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${label} has been copied.`,
    });
  };

  const renderLoading = () => (
    <>
      <DialogHeader>
        <DialogTitle className="sr-only">Compiling AI-Book</DialogTitle>
        <DialogDescription asChild>
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <LoaderCircle className="w-12 h-12 text-primary animate-spin" />
            <h3 className="font-headline text-2xl">
              Compiling your AI-Book...
            </h3>
            <p className="font-body text-muted-foreground text-center">
              The AI is working its magic: generating PDFs, cover art, and more.
              <br />
              This may take a moment.
            </p>
          </div>
        </DialogDescription>
      </DialogHeader>
    </>
  );

  const renderResults = () => (
    <>
      <DialogHeader className="text-center items-center">
        <PartyPopper className="w-12 h-12 text-primary" />
        <DialogTitle className="font-headline text-3xl">
          Compilation Complete!
        </DialogTitle>
        <DialogDescription className="font-body text-base">
          Your AI-Book "{bookName}" and all its assets have been generated.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <p className="font-headline text-lg">PDF Version</p>
              <p className="text-sm text-muted-foreground">Ready for download</p>
            </div>
          </div>
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <ImageIcon className="w-6 h-6 text-primary" />
            <div>
              <p className="font-headline text-lg">Cover Art</p>
              <p className="text-sm text-muted-foreground">High-resolution image</p>
            </div>
          </div>
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <Globe className="w-6 h-6 text-primary" />
            <div>
              <p className="font-headline text-lg">Web Version &amp; Mini-Site</p>
              <a href="#" className="text-sm text-primary underline">
                view-live-site.com
              </a>
            </div>
          </div>
           <Button size="sm" variant="ghost" onClick={() => copyToClipboard('https://view-live-site.com', 'Site URL')}>
            <Copy className="mr-2 h-4 w-4" /> Copy URL
          </Button>
        </div>
        <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <div>
                        <p className="font-headline text-lg">Marketing Copy</p>
                        <p className="text-sm text-muted-foreground">Ready to use in your campaigns</p>
                    </div>
                </div>
                 <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`Discover "${bookName}", a stunning collection...`, 'Marketing Copy')}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-md font-code text-sm">
                <p>Discover "{bookName}", a stunning collection of mystical tattoos and their meanings, curated by AI...</p>
            </div>
        </div>
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {isCompiling ? renderLoading() : renderResults()}
      </DialogContent>
    </Dialog>
  );
}