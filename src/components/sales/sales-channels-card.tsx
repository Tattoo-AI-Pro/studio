"use client";

import { Link as LinkIcon, Copy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const channels = [
    { name: 'Kiwify', logo: '/channels/kiwify.svg' },
    { name: 'Hotmart', logo: '/channels/hotmart.svg' },
    { name: 'Shopify', logo: '/channels/shopify.svg' },
    { name: 'Gumroad', logo: '/channels/gumroad.svg' },
];

// Dummy SVGs as files can't be created
const KiwifyLogo = () => <svg className="w-24 h-auto" viewBox="0 0 100 20"><text y="15" fontSize="12" fill="currentColor">Kiwify</text></svg>;
const HotmartLogo = () => <svg className="w-24 h-auto" viewBox="0 0 100 20"><text y="15" fontSize="12" fill="currentColor">Hotmart</text></svg>;
const ShopifyLogo = () => <svg className="w-24 h-auto" viewBox="0 0 100 20"><text y="15" fontSize="12" fill="currentColor">Shopify</text></svg>;
const GumroadLogo = () => <svg className="w-24 h-auto" viewBox="0 0 100 20"><text y="15" fontSize="12" fill="currentColor">Gumroad</text></svg>;


export function SalesChannelsCard() {
    const { toast } = useToast();

    const copyLink = () => {
        navigator.clipboard.writeText("https://seuestudio.com/vender/123-abc");
        toast({
            title: "Link Copiado",
            description: "Seu link de vendas universal foi copiado.",
        });
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Canais de Venda</CardTitle>
        <CardDescription className="font-body text-base">
          Integre com sua plataforma favorita ou use nosso link universal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md h-20 text-muted-foreground">
                <KiwifyLogo />
            </div>
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md h-20 text-muted-foreground">
                <HotmartLogo />
            </div>
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md h-20 text-muted-foreground">
                <ShopifyLogo />
            </div>
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md h-20 text-muted-foreground">
                <GumroadLogo />
            </div>
        </div>
      </CardContent>
       <CardFooter className="flex-col gap-2">
          <Button className="w-full" onClick={copyLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar Link de Vendas Universal
          </Button>
          <p className="text-xs text-muted-foreground font-body">Use este link onde você quiser vender.</p>
      </CardFooter>
    </Card>
  );
}
