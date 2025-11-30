
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
      setTagsInput(image.tags.join(", "));
    }
  }, [image]);

  if (!image) return null;

  const handleSave = () => {
    onSave({
      ...formData,
      tags: tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean),
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
          <SheetTitle className="font-semibold text-2xl">
            Edit Image Details
          </SheetTitle>
          <SheetDescription className="font-sans text-base flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <span>AI suggestions are pre-filled. Adjust as needed.</span>
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-3">
            <Label htmlFor="title" className="font-semibold">Suggested Name</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-3">
              <Label htmlFor="theme" className="font-semibold">Theme</Label>
              <Input
                id="theme"
                name="theme"
                value={formData.theme || ""}
                onChange={handleChange}
              />
            </div>
             <div className="grid gap-3">
              <Label htmlFor="style" className="font-semibold">Style</Label>
              <Input
                id="style"
                name="style"
                value={formData.style || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="description" className="font-semibold">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              className="min-h-[100px] font-sans"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="tags" className="font-semibold">SEO Tags</Label>
            <Input
              id="tags"
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
            <Label htmlFor="instagramCaption" className="font-semibold">Instagram Caption</Label>
            <Textarea
              id="instagramCaption"
              name="instagramCaption"
              value={formData.instagramCaption || ""}
              onChange={handleChange}
              className="min-h-[120px] font-sans"
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
