/**
 * Order status enum matching the PostgreSQL OrderStatus type
 */
export type OrderStatus = "DRAFT" | "OPEN" | "ORDERED" | "RECEIVED";

/**
 * User record from the User table
 * Note: PostgreSQL lowercases unquoted column names, so we use lowercase here
 */
export interface User {
  id: number;
  supabaseid: string;
  email: string;
  isadmin: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Item record from the Item table (product catalog)
 */
export interface Item {
  id: string;
  name: string;
  costCents: number;
  active: boolean;
  imageStoragePath: string | null;
  imageUrl: string | null;
  sizes: string[] | null;
  link: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order record from the Order table
 */
export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  paid: boolean;
  totalCents: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * OrderItem record from the OrderItem table (line items)
 */
export interface OrderItem {
  id: number;
  orderId: number;
  itemId: string;
  quantity: number;
  size: string | null;
  playerName: string | null;
  playerNumber: string | null;
  lineTotalCents: number;
  createdAt: string;
}

/**
 * Cart item with joined Item data for display
 */
export interface CartItem extends OrderItem {
  item: Item;
}

/**
 * Cart (Order) with joined OrderItems and their Items for cart view
 */
export interface CartWithItems extends Order {
  orderItems: CartItem[];
}

/**
 * Player record from the Player table
 */
export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * UserPlayer junction record from the UserPlayer table
 * Links users to players (many-to-many relationship)
 */
export interface UserPlayer {
  userId: number;
  playerId: string;
  createdAt: string;
}

/**
 * Item IDs (UUIDs) that require player info
 * These are personalized items (jerseys, hoodies) where player name/number
 * are automatically derived from the linked player
 */
export const PLAYER_INFO_REQUIRED_ITEMS: readonly string[] = [];

/**
 * Check if an item requires player info (derived from linked player)
 * @param itemId - The item's UUID
 * @returns true if the item requires player info
 */
export function requiresPlayerInfo(itemId: string): boolean {
  return PLAYER_INFO_REQUIRED_ITEMS.includes(itemId);
}
