import { NextRequest, NextResponse } from "next/server";
import { parseTelegramMessage } from "../../../../lib/telegramParser";
import { dbService } from "../../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if message exists
    const messageText = body?.message?.text || body?.channel_post?.text;
    if (!messageText) {
      return NextResponse.json({ success: false, error: "No message text found" }, { status: 400 });
    }

    // Parse message
    const { matched, station, type, description } = parseTelegramMessage(messageText);

    if (!matched || !station || !type) {
      return NextResponse.json({
        success: true,
        status: "ignored",
        reason: "Message did not match any station name and alert keywords.",
        parsed: { matched, station: station?.name || null, type }
      });
    }

    // Insert alert into database
    // Note: If running locally without Supabase, dbService.addReport will update the server-side mock state.
    // In production, it writes directly to Supabase.
    const report = await dbService.addReport(station.id, type, description);

    return NextResponse.json({
      success: true,
      status: "published",
      report,
      parsed: {
        station: station.name,
        type,
        description
      }
    });

  } catch (err: unknown) {
    console.error("Error in Telegram Webhook API:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// Simple GET status endpoint to verify the webhook route is live
export async function GET() {
  return NextResponse.json({ status: "live", service: "BCN Metro Telegram Webhook Parser" });
}
