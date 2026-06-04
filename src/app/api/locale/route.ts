import { NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/locale";
import { isLocale } from "@/lib/locale";

export async function POST(request: Request) {
  const body = await request.json();
  const locale = body?.locale;

  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
