
"use client";

import { useState } from "react";
import { Save, Tag, LoaderCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Serie } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";

interface PricingCardProps {
    book: Serie;
}

export function PricingCard({ book }: PricingCardProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [price, setPrice] = useState(book.preco ?? 0);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        const bookRef = doc(firestore, "series", book.id);
        
        updateDocumentNonBlocking(bookRef, { 
            preco: price,
            data_atualizacao: serverTimestamp()
        });

        // The non-blocking update is very fast, so we can show the toast almost immediately.
        // A short delay can make the UI feel more responsive.
        setTimeout(() => {
            toast({
                title: "Preços salvos",
                description: "As informações de preço foram atualizadas.",
            });
            setIsSaving(false);
        }, 500); 
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-2xl">Monetização</CardTitle>
        <CardDescription className="font-sans text-base">
          Defina o preço da sua coleção e crie ofertas promocionais.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
                <Label htmlFor="price" className="font-semibold">Preço Padrão (BRL)</Label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">R$</span>
                    <Input id="price" type="number" placeholder="99,90" value={price} onChange={e => setPrice(Number(e.target.value))} className="pl-9"/>
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter>
          <Button className="w-full" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
            ) : (
                <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Preços
          </Button>
      </CardFooter>
    </Card>
  );
}
