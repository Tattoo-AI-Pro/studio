"use client";

import { Save, Tag } from "lucide-react";
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

interface PricingCardProps {
    book: AiBook;
}

export function PricingCard({ book }: PricingCardProps) {
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Pricing Saved",
            description: "Your pricing information has been updated.",
        });
    }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Monetization</CardTitle>
        <CardDescription className="font-body text-base">
          Set the price for your AI-Book and create promotional offers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="price" className="font-headline">Standard Price (BRL)</Label>
                <Input id="price" type="number" placeholder="99.90" defaultValue={book.price}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="promo-price" className="font-headline">Promotional Price (BRL)</Label>
                <Input id="promo-price" type="number" placeholder="49.90" defaultValue={book.promoPrice} />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="coupon" className="font-headline">Launch Coupon</Label>
            <div className="flex gap-2">
                <Input id="coupon" placeholder="LAUNCH25" />
                <Button variant="outline" size="icon">
                    <Tag className="w-4 h-4" />
                </Button>
            </div>
        </div>
      </CardContent>
      <CardFooter>
          <Button className="w-full" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Pricing
          </Button>
      </CardFooter>
    </Card>
  );
}
