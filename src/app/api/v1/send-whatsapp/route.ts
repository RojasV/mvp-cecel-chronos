import { NextResponse } from "next/server";
import { EvolutionWhatsAppAdapter } from "@/infrastructure/whatsapp/evolution-whatsapp-adapter";

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

    const { phone, text, imageBase64 } = await req.json();

    if (!phone || !text) {
      return NextResponse.json(
        { error: "phone and text are required" },
        { status: 400 },
      );
    }

    const adapter = new EvolutionWhatsAppAdapter(apiUrl, apiKey, instanceName);

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const result = await adapter.sendMedia({
        phone,
        mediaUrl: cleanBase64,
        caption: text,
        mimeType: "image/jpeg",
      });

      if (result.isErr()) {
        return NextResponse.json(
          { error: result.error.message, code: result.error.code },
          { status: 422 },
        );
      }

      return NextResponse.json({
        success: true,
        messageId: result.value.messageId,
        status: result.value.status,
      });
    }

    const result = await adapter.sendText({ phone, text });

    if (result.isErr()) {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.value.messageId,
      status: result.value.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
