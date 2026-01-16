"use client";

import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Item } from "@/lib/types/database";

interface ItemFormProps {
  item?: Item;
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string }>;
}

export function ItemForm({
  item,
  onSubmit,
}: ItemFormProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(item?.active ?? true);

  // Image state tracking
  const [newFile, setNewFile] = useState<File | null>(null);
  const [existingUrl, setExistingUrl] = useState<string | null>(
    item?.imageUrl ?? null
  );
  const [shouldDelete, setShouldDelete] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isEditMode = Boolean(item);

  // Create and cleanup object URL for new file preview
  useEffect(() => {
    if (newFile) {
      const url = URL.createObjectURL(newFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [newFile]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setNewFile(acceptedFiles[0]);
      setShouldDelete(false);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setNewFile(null);
    if (existingUrl) {
      setShouldDelete(true);
      setExistingUrl(null);
    }
  }, [existingUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: false,
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("active", active.toString());

    if (newFile) {
      formData.set("image", newFile);
    }

    if (shouldDelete) {
      formData.set("deleteImage", "true");
    }

    startTransition(async () => {
      const result = await onSubmit(formData);
      if (!result.success && result.error) {
        setError(result.error);
      }
    });
  }

  // Convert cents to dollars for display
  const priceInDollars = item ? (item.costCents / 100).toFixed(2) : "";

  // Convert sizes array to comma-separated string
  const sizesString = item?.sizes?.join(", ") ?? "";

  function getButtonText(): string {
    if (isPending) {
      return isEditMode ? "Updating..." : "Creating...";
    }
    return isEditMode ? "Update" : "Create";
  }

  function getDropzoneClasses(): string {
    const baseClasses =
      "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors";
    if (isDragActive) {
      return `${baseClasses} border-primary bg-primary/10`;
    }
    return `${baseClasses} border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50`;
  }

  // Determine what image to display
  const displayImageUrl = previewUrl ?? existingUrl;
  // Blob URLs need unoptimized rendering
  const isLocalPreview = Boolean(previewUrl);

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Item" : "Create Item"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Product Image</Label>
            {displayImageUrl ? (
              <div className="relative inline-block">
                <Image
                  alt="Product preview"
                  className="rounded-lg border object-contain"
                  height={200}
                  src={displayImageUrl}
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                  unoptimized={isLocalPreview}
                  width={200}
                />
                <button
                  aria-label="Remove image"
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                  onClick={handleRemoveImage}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div {...getRootProps()} className={getDropzoneClasses()}>
                <input {...getInputProps()} />
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-muted-foreground text-sm">
                    Drop the image here...
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Drag & drop an image here, or click to select
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              defaultValue={item?.name ?? ""}
              disabled={isPending}
              id="name"
              name="name"
              placeholder="e.g., Jersey"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD) *</Label>
            <Input
              defaultValue={priceInDollars}
              disabled={isPending}
              id="price"
              min="0"
              name="price"
              placeholder="e.g., 49.99"
              required
              step="0.01"
              type="number"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={active}
              disabled={isPending}
              id="active"
              onCheckedChange={(checked) => setActive(checked === true)}
            />
            <Label className="cursor-pointer" htmlFor="active">
              Active
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sizes">Sizes (comma-separated)</Label>
            <Input
              defaultValue={sizesString}
              disabled={isPending}
              id="sizes"
              name="sizes"
              placeholder="e.g., S, M, L, XL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link (optional)</Label>
            <Input
              defaultValue={item?.link ?? ""}
              disabled={isPending}
              id="link"
              name="link"
              placeholder="e.g., https://example.com/product"
              type="url"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={isPending} type="submit">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getButtonText()}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
