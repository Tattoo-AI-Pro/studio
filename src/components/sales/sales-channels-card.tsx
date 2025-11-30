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
const KiwifyLogo = () => <svg viewBox="0 0 100 20"><text y="15">Kiwify</text></svg>;
const HotmartLogo = () => <svg viewBox="0 0 100 20"><text y="15">Hotmart</text></svg>;
const ShopifyLogo = () => <svg viewBox="0 0 100 20"><text y="15">Shopify</text></svg>;
const GumroadLogo = () => <svg viewBox="0 0 100 20"><text y="15">Gumroad</text></svg>;


export function SalesChannelsCard() {
    const { toast } = useToast();

    const copyLink = () => {
        navigator.clipboard.writeText("https://your-ai-book-factory.com/sale/1");
        toast({
            title: "Link Copied",
            description: "Your universal sales link has been copied.",
        });
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Sales Channels</CardTitle>
        <CardDescription className="font-body text-base">
          Integrate with your favorite platform or use our universal link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md h-20">
                <KiwifyLogo />
            </div>
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md h-20">
                <HotmartLogo />
            </div>
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md h-20">
                <ShopifyLogo />
            </div>
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md h-20">
                <GumroadLogo />
            </div>
        </div>
      </CardContent>
       <CardFooter className="flex-col gap-2">
          <Button className="w-full" onClick={copyLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Universal Sales Link
          </Button>
          <p className="text-xs text-muted-foreground font-body">Use this link anywhere you want to sell.</p>
      </CardFooter>
    </Card>
  );
}
