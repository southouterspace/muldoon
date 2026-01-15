"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/lib/types/database";
import { formatCents } from "@/lib/utils/currency";

/**
 * Result type for checkout operations
 */
interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Zod schema for validating submitOrder input
 */
const submitOrderSchema = z.object({
  note: z.string().optional(),
});

/**
 * Submit the order: change status to PAID and send email notification
 */
export async function submitOrder(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get user from database
  // Note: PostgreSQL lowercases unquoted column names
  const { data: dbUser } = await supabase
    .from("User")
    .select("id, email")
    .eq("supabaseid", user.id)
    .single();

  if (!dbUser) {
    return { success: false, error: "User not found" };
  }

  // Validate input
  const parsed = submitOrderSchema.safeParse({
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { note } = parsed.data;

  // Get the user's OPEN order with items
  const { data: order } = await supabase
    .from("Order")
    .select(
      `
      *,
      orderItems:OrderItem(
        *,
        item:Item(*)
      )
    `
    )
    .eq("userId", dbUser.id)
    .eq("status", "OPEN")
    .single();

  if (!order || order.orderItems.length === 0) {
    return { success: false, error: "Cart is empty" };
  }

  // Update order status to PAID and save note
  const { error: updateError } = await supabase
    .from("Order")
    .update({
      status: "PAID",
      note: note ?? null,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateError) {
    return { success: false, error: "Failed to submit order" };
  }

  // Send email notification to admin
  const adminEmail = process.env.ADMIN_EMAIL;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (adminEmail && resendApiKey) {
    const resend = new Resend(resendApiKey);

    // Build line items HTML
    const lineItemsHtml = (order.orderItems as CartItem[])
      .map((item) => {
        const details: string[] = [];
        if (item.size) {
          details.push(`Size: ${item.size}`);
        }
        if (item.playerName) {
          details.push(`Player: ${item.playerName}`);
        }
        if (item.playerNumber) {
          details.push(`#${item.playerNumber}`);
        }
        details.push(`Qty: ${item.quantity}`);

        return `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${details.join(" | ")}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCents(item.lineTotalCents)}</td>
          </tr>
        `;
      })
      .join("");

    const emailHtml = `
      <h2>New Order Received</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${dbUser.email}</p>
      <p><strong>Total:</strong> ${formatCents(order.totalCents)}</p>
      ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}

      <h3>Order Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 8px; text-align: left;">Item</th>
            <th style="padding: 8px; text-align: left;">Details</th>
            <th style="padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 8px; font-weight: bold;">Order Total</td>
            <td style="padding: 8px; font-weight: bold; text-align: right;">${formatCents(order.totalCents)}</td>
          </tr>
        </tfoot>
      </table>
    `;

    try {
      await resend.emails.send({
        from: "Raptors Store <onboarding@resend.dev>",
        to: adminEmail,
        subject: `New Order #${order.id} from ${dbUser.email}`,
        html: emailHtml,
      });
    } catch (emailError) {
      // Log email error but don't fail the order
      console.error("Failed to send order notification email:", emailError);
    }
  }

  // Revalidate paths
  revalidatePath("/cart");
  revalidatePath("/checkout");

  // Redirect to confirmation page
  redirect(`/order-confirmation/${order.id}`);
}
