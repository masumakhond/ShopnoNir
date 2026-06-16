import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserByEmail, normalizeLoginId } from "@/lib/auth";
import { apiErrorMessage } from "@/lib/api-error";
import { createPasswordResetToken } from "@/lib/password-reset";

const schema = z.object({
  email: z.string().min(3),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const email = normalizeLoginId(body.email);
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "No account found with that username or email." },
        { status: 404 }
      );
    }

    const token = await createPasswordResetToken(user.email);
    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/update-password?token=${encodeURIComponent(token)}`;

    return NextResponse.json({
      ok: true,
      resetUrl,
      message:
        "Use the link below to set a new password. It expires in 1 hour.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter your username or email." }, { status: 400 });
    }
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: apiErrorMessage(error, "Could not start password reset.") },
      { status: 500 }
    );
  }
}
