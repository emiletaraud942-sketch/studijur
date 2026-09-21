import { NextResponse } from "next/server";
import { anthropicConfigured, currentModel } from "@/lib/anthropic";
import { pushConfigured } from "@/lib/push";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    anthropic: anthropicConfigured,
    supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID),
    push: pushConfigured && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    model: anthropicConfigured ? currentModel() : "",
  });
}
