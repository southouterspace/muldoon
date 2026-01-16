/**
 * Order status enum matching the PostgreSQL OrderStatus type
 */
export type OrderStatus = "OPEN" | "PAID" | "ORDERED" | "RECEIVED";

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
  number: number;
  name: string;
  costCents: number;
  active: boolean;
  imageStoragePath: string | null;
  imageUrl: string | null;
  sizes: string[] | null;
  link: string | null;
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
 * Item numbers that require player name and number fields
 * These are personalized items (jerseys, hoodies with player number)
 */
export const PLAYER_INFO_REQUIRED_ITEMS = [1, 2, 10, 19] as const;

/**
 * Check if an item requires player name and number
 * @param itemNumber - The item's number field
 * @returns true if the item requires player info
 */
export function requiresPlayerInfo(itemNumber: number): boolean {
  return (PLAYER_INFO_REQUIRED_ITEMS as readonly number[]).includes(itemNumber);
}
