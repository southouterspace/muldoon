-- Add DRAFT status to OrderStatus enum
-- Note: This must be in a separate transaction from statements that use the new value
ALTER TYPE "OrderStatus" ADD VALUE 'DRAFT' BEFORE 'OPEN';
