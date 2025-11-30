
"use client";

import Image from "next/image";
import type { Tatuagem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface ImageCardProps {
  image: Tatuagem;
  onEdit: () => void;
}

export function ImageCard({ image, onEdit }: ImageCardProps) {
  return (
    <Card
      className="overflow-hidden group cursor-pointer aspect-[3/4] relative"
      onClick={onEdit}
    >
      <CardContent className="p-0">
        <Image
          src={image.capa_url}
          alt={image.titulo}
          width={300}
          height={400}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          data-ai-hint="tattoo design"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white font-semibold text-center p-2">Edit</p>
        </div>
      </CardContent>
    </Card>
  );
}
