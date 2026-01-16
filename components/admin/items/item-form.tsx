"use client";

import { DollarSign, ImagePlus, Loader2, X } from "lucide-react";
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
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
      return isEditMode ? "Saving..." : "Creating...";
    }
    return isEditMode ? "Save Changes" : "Create Item";
  }

  // Determine what image to display
  const displayImageUrl = previewUrl ?? existingUrl;
  // Blob URLs need unoptimized rendering
  const isLocalPreview = Boolean(previewUrl);

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Image Upload Section */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Product Image</CardTitle>
          </CardHeader>
          <CardContent>
            {displayImageUrl ? (
              <div className="group relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  alt="Product preview"
                  className="object-contain p-4"
                  fill
                  sizes="320px"
                  src={displayImageUrl}
                  unoptimized={isLocalPreview}
                />
                <button
                  aria-label="Remove image"
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 shadow-sm ring-1 ring-border backdrop-blur-sm transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                  onClick={handleRemoveImage}
                  type="button"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="rounded-full bg-muted p-3">
                    <ImagePlus className="size-6" />
                  </div>
                  <div className="text-center text-sm">
                    {isDragActive ? (
                      <p className="font-medium text-primary">
                        Drop image here
                      </p>
                    ) : (
                      <>
                        <p className="font-medium">Drop image here</p>
                        <p className="text-muted-foreground/70">
                          or click to browse
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Fields Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Item Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  defaultValue={item?.name ?? ""}
                  disabled={isPending}
                  id="name"
                  name="name"
                  placeholder="e.g., Team Jersey"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="price">Price</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>
                      <DollarSign className="size-4" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    defaultValue={priceInDollars}
                    disabled={isPending}
                    id="price"
                    min="0"
                    name="price"
                    placeholder="0.00"
                    required
                    step="0.01"
                    type="number"
                  />
                </InputGroup>
              </Field>

              <Separator />

              <Field orientation="horizontal">
                <Checkbox
                  checked={active}
                  disabled={isPending}
                  id="active"
                  onCheckedChange={(checked) => setActive(checked === true)}
                />
                <FieldLabel className="cursor-pointer" htmlFor="active">
                  <span>Active</span>
                  <FieldDescription>
                    Active items are visible in the store
                  </FieldDescription>
                </FieldLabel>
              </Field>

              <Separator />

              <Field>
                <FieldLabel htmlFor="sizes">Available Sizes</FieldLabel>
                <Input
                  defaultValue={sizesString}
                  disabled={isPending}
                  id="sizes"
                  name="sizes"
                  placeholder="S, M, L, XL"
                />
                <FieldDescription>
                  Enter sizes separated by commas
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="link">External Link</FieldLabel>
                <Input
                  defaultValue={item?.link ?? ""}
                  disabled={isPending}
                  id="link"
                  name="link"
                  placeholder="https://..."
                  type="url"
                />
                <FieldDescription>
                  Optional link to external product page
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="border-t bg-muted/30 px-6 py-4">
            <Button className="ml-auto" disabled={isPending} type="submit">
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {getButtonText()}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
