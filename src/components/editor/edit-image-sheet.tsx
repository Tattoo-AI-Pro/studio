"use client";

import { useEffect, useState } from "react";
import { Bot, Save } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ImageItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface EditImageSheetProps {
  image: ImageItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (image: ImageItem) => void;
}

export function EditImageSheet({
  image,
  open,
  onOpenChange,
  onSave,
}: EditImageSheetProps) {
  const [formData, setFormData] = useState<Partial<ImageItem>>({});
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (image) {
      setFormData(image);
      setTagsInput(image.aiSeoTags.join(", "));
    }
  }, [image]);

  if (!image) return null;

  const handleSave = () => {
    onSave({
      ...formData,
      aiSeoTags: tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean),
    } as ImageItem);
    onOpenChange(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-headline text-2xl">
            Edit Image Details
          </SheetTitle>
          <SheetDescription className="font-body text-base flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <span>AI suggestions are pre-filled. Adjust as needed.</span>
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-3">
            <Label htmlFor="aiTitle" className="font-headline">Suggested Name</Label>
            <Input
              id="aiTitle"
              name="aiTitle"
              value={formData.aiTitle || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-3">
              <Label htmlFor="aiTheme" className="font-headline">Theme</Label>
              <Input
                id="aiTheme"
                name="aiTheme"
                value={formData.aiTheme || ""}
                onChange={handleChange}
              />
            </div>
             <div className="grid gap-3">
              <Label htmlFor="aiStyle" className="font-headline">Style</Label>
              <Input
                id="aiStyle"
                name="aiStyle"
                value={formData.aiStyle || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="aiDescription" className="font-headline">Description</Label>
            <Textarea
              id="aiDescription"
              name="aiDescription"
              value={formData.aiDescription || ""}
              onChange={handleChange}
              className="min-h-[100px] font-body"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="aiSeoTags" className="font-headline">SEO Tags</Label>
            <Input
              id="aiSeoTags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. minimalist, fine-line, floral"
            />
            <div className="flex flex-wrap gap-2">
              {tagsInput.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, i) => (
                <Badge key={i} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="aiInstagramCaption" className="font-headline">Instagram Caption</Label>
            <Textarea
              id="aiInstagramCaption"
              name="aiInstagramCaption"
              value={formData.aiInstagramCaption || ""}
              onChange={handleChange}
              className="min-h-[120px] font-body"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
