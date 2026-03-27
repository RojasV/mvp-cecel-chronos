import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EvolutionWhatsAppAdapter } from "@/infrastructure/whatsapp/evolution-whatsapp-adapter";

const DEFAULT_ORG_ID = "1cbb0d7b-f3a3-4e9d-931e-fd2e3e4001d1";

function formatWatchMessage(watch: {
  brand: string;
  model: string;
  reference?: string;
  asking_price_cents: number;
  condition?: string;
  case_material?: string;
  dial_color?: string;
  movement?: string;
  year_of_production?: number;
  accessories?: string;
  description?: string;
}): string {
  const price = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(watch.asking_price_cents / 100);

  const lines = [`⌚ *${watch.brand} ${watch.model}*`, ""];
  if (watch.reference) lines.push(`📋 Ref: ${watch.reference}`);
  if (watch.condition) lines.push(`✨ Condição: ${watch.condition}`);
  if (watch.case_material) lines.push(`🔩 Material: ${watch.case_material}`);
  if (watch.dial_color) lines.push(`🎨 Mostrador: ${watch.dial_color}`);
  if (watch.movement) lines.push(`⚙️ Movimento: ${watch.movement}`);
  if (watch.year_of_production) lines.push(`📅 Ano: ${watch.year_of_production}`);
  if (watch.accessories) lines.push(`📦 Acessórios: ${watch.accessories}`);
  lines.push("", `💰 *${price}*`);
  if (watch.description) {
    lines.push("", watch.description);
  }
  return lines.join("\n");
}

export async function POST(req: Request) {
  try {
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME;

    if (!apiUrl || !apiKey || !instanceName) {
      return NextResponse.json(
        { error: "Evolution API not configured" },
        { status: 500 },
      );
    }

    const { watchIds, phones } = await req.json();

    if (!watchIds?.length || !phones?.length) {
      return NextResponse.json(
        { error: "watchIds and phones are required arrays" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const adapter = new EvolutionWhatsAppAdapter(apiUrl, apiKey, instanceName);

    // Fetch watches with primary image
    const { data: watches, error } = await supabase
      .from("watches")
      .select(`
        id, brand, model, reference, asking_price_cents,
        condition, case_material, dial_color, movement,
        year_of_production, accessories, description,
        watch_images!inner (url, is_primary)
      `)
      .in("id", watchIds)
      .eq("org_id", DEFAULT_ORG_ID);

    if (error || !watches?.length) {
      return NextResponse.json(
        { error: "No watches found" },
        { status: 404 },
      );
    }

    const results: { watchId: string; phone: string; success: boolean; error?: string }[] = [];

    for (const watch of watches) {
      const message = formatWatchMessage(watch);
      const primaryImage = (watch.watch_images as { url: string; is_primary: boolean }[])
        ?.find((img) => img.is_primary);

      for (const phone of phones) {
        try {
          let result;
          if (primaryImage?.url) {
            result = await adapter.sendMedia({
              phone,
              mediaUrl: primaryImage.url,
              caption: message,
              mimeType: "image/jpeg",
            });
          } else {
            result = await adapter.sendText({ phone, text: message });
          }

          const success = result.isOk();
          results.push({
            watchId: watch.id,
            phone,
            success,
            error: result.isErr() ? result.error.message : undefined,
          });

          // Log to whatsapp_messages
          await supabase.from("whatsapp_messages").insert({
            org_id: DEFAULT_ORG_ID,
            watch_id: watch.id,
            recipient_phone: phone,
            message_type: primaryImage ? "media" : "text",
            content_text: message,
            media_url: primaryImage?.url || null,
            status: success ? "sent" : "failed",
            evolution_message_id: result.isOk() ? result.value.messageId : null,
            error_message: result.isErr() ? result.error.message : null,
            sent_at: success ? new Date().toISOString() : null,
          });

          // Small delay between messages to avoid rate limiting
          await new Promise((r) => setTimeout(r, 1000));
        } catch (err) {
          results.push({
            watchId: watch.id,
            phone,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      total: results.length,
      sent: successCount,
      failed: failCount,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
