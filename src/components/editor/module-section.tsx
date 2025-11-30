"use client";

import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Module, ImageItem } from "@/lib/types";
import { ImageCard } from "./image-card";
import { Separator } from "@/components/ui/separator";

interface ModuleSectionProps {
  module: Module;
  onEditImage: (image: ImageItem) => void;
}

export function ModuleSection({ module, onEditImage }: ModuleSectionProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl">{module.name}</CardTitle>
            <CardDescription className="font-body mt-1 text-base">
              {module.description}
            </CardDescription>
          </div>
          <Button variant="outline">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Images
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {module.images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onEdit={() => onEditImage(image)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
