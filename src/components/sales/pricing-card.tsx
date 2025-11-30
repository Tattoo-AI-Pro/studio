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
import type { AiBook } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

interface PricingCardProps {
    book: AiBook;
}

export function PricingCard({ book }: PricingCardProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [price, setPrice] = useState(book.price ?? 0);
    const [promoPrice, setPromoPrice] = useState(book.promoPrice ?? 0);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        const bookRef = doc(firestore, "ai_books", book.id);
        
        updateDocumentNonBlocking(bookRef, { price, promoPrice });

        // We don't await the result, so we show success immediately
        // and handle errors via the global listener
        setTimeout(() => {
            toast({
                title: "Preços salvos",
                description: "As informações de preço foram atualizadas.",
            });
            setIsSaving(false);
        }, 500); // Simulate a quick save
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Monetização</CardTitle>
        <CardDescription className="font-body text-base">
          Defina o preço da sua coleção e crie ofertas promocionais.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="price" className="font-headline">Preço Padrão (BRL)</Label>
                <Input id="price" type="number" placeholder="99.90" value={price} onChange={e => setPrice(Number(e.target.value))}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="promo-price" className="font-headline">Preço Promocional (BRL)</Label>
                <Input id="promo-price" type="number" placeholder="49.90" value={promoPrice} onChange={e => setPromoPrice(Number(e.target.value))} />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="coupon" className="font-headline">Cupom de Lançamento</Label>
            <div className="flex gap-2">
                <Input id="coupon" placeholder="LANCAMENTO25" />
                <Button variant="outline" size="icon">
                    <Tag className="w-4 h-4" />
                </Button>
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
