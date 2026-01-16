# PRD: Item Image Upload

## Introduction

Add image upload functionality to the admin item form using react-dropzone. This allows admins to upload product images that are stored in Supabase Storage and displayed on product cards throughout the application.

## Goals

- Enable admins to upload product images via drag-and-drop or click-to-select
- Store images in a Supabase Storage bucket with organized paths
- Display image preview in the form with ability to remove
- Update `imageStoragePath` and `imageUrl` database columns on form submit
- Show uploaded images on product cards in the storefront

## User Stories

### US-001: Create Supabase Storage bucket for product images
**Description:** As a developer, I need a Supabase Storage bucket to store product images.

**Acceptance Criteria:**
- [ ] Create `product-images` storage bucket in Supabase
- [ ] Configure bucket with public read access (images need to be publicly viewable)
- [ ] Document bucket setup in README or migration notes

### US-002: Add react-dropzone to item form
**Description:** As an admin, I want to drag-and-drop an image onto the item form so I can easily add product photos.

**Acceptance Criteria:**
- [ ] Install `react-dropzone` package
- [ ] Add dropzone component at the top of the item form (before Name field)
- [ ] Dropzone accepts any image type with no size limit
- [ ] Dropzone shows visual feedback on drag hover
- [ ] Clicking the dropzone opens file picker
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-003: Display image preview with remove option
**Description:** As an admin, I want to see a preview of the selected/existing image and be able to remove it.

**Acceptance Criteria:**
- [ ] Show thumbnail preview of selected image file
- [ ] Show existing image from `imageUrl` when editing an item
- [ ] Display "Remove" button overlay on image preview
- [ ] Clicking remove clears the selected image
- [ ] When no image selected, show placeholder/dropzone instructions
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-004: Upload image on form submit
**Description:** As an admin, when I submit the item form, the image should be uploaded to Supabase Storage and the database should be updated.

**Acceptance Criteria:**
- [ ] On form submit, upload new image file to `product-images` bucket
- [ ] Use path format: `items/{itemId}/{filename}` for organized storage
- [ ] Generate public URL for the uploaded image
- [ ] Update `imageStoragePath` with storage path
- [ ] Update `imageUrl` with public URL
- [ ] If image removed (was set, now cleared), delete old image from storage and set columns to null
- [ ] Handle upload errors gracefully with user-friendly message
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-005: Display product images in storefront
**Description:** As a customer, I want to see product images on the product cards.

**Acceptance Criteria:**
- [ ] Product cards display `imageUrl` when available
- [ ] Show placeholder image when no `imageUrl` exists
- [ ] Images are properly sized and don't break card layout
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: The system must provide a `product-images` Supabase Storage bucket with public read access
- FR-2: The item form must include a react-dropzone component positioned before the Name field
- FR-3: The dropzone must accept any image file type with no size restrictions
- FR-4: The dropzone must display the currently selected or existing image as a preview thumbnail
- FR-5: The dropzone must provide a "Remove" button to clear the selected image
- FR-6: When the form is submitted with a new image, the system must upload it to Supabase Storage at path `items/{itemId}/{filename}`
- FR-7: When the form is submitted, the system must update `imageStoragePath` and `imageUrl` columns in the Item table
- FR-8: When an image is removed and form submitted, the system must delete the old file from storage and set columns to null
- FR-9: Product cards must display the product image when `imageUrl` is available, otherwise show a placeholder

## Non-Goals

- No image cropping or editing functionality
- No multiple images per product (single image only)
- No image optimization/resizing on upload
- No drag-to-reorder (only one image)
- No image alt text field (use product name)

## Design Considerations

- Dropzone should match existing form styling (use Card/shadcn components where possible)
- Preview should be reasonably sized (e.g., 200x200 max) with aspect ratio preserved
- Remove button should be clearly visible but not obstructive (overlay on hover or corner X)
- Use existing Lucide icons for upload/remove actions
- Placeholder state should have dashed border with upload icon and instructional text

## Technical Considerations

- The `Item` type already has `imageStoragePath: string | null` and `imageUrl: string | null` fields
- Use Supabase client's `storage.from('product-images').upload()` and `getPublicUrl()` methods
- Server action `updateItem` needs to handle file upload (may need to convert to handle FormData with File objects or use separate upload endpoint)
- Consider using `createClient` from `@/lib/supabase/server` for server-side uploads
- For new items, need to handle case where itemId doesn't exist yet (upload after insert, or use temp ID)

## Success Metrics

- Admins can upload an image in under 3 interactions (drop or click + select)
- Image preview displays within 1 second of selection
- Form submission with image completes without errors
- Product images display correctly on storefront product cards

## Open Questions

- Should there be a loading indicator during image upload on form submit?
- For new items (create flow), should we generate a UUID for the item before insert to use in the storage path, or upload to a temp location first?
