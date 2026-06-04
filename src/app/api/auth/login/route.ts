import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createToken,
  getUserByEmail,
  setAuthCookie,
  verifyPassword,
} from "@/lib/auth";

const schema = z.object({
  email: z.string().min(3),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const user = await getUserByEmail(body.email);

    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.role === "MEMBER" && user.member && !user.member.active) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 });
    }

    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      memberId: user.memberId,
    };

    const token = await createToken(session);
    await setAuthCookie(token);

    return NextResponse.json({
      user: session,
      redirect: user.role === "ADMIN" ? "/admin" : "/dashboard/cooperative",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("Login error:", error);
    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message.includes("Can't reach database")
          ? "Database not connected. Stop the server (Ctrl+C), then run: npm run dev:fresh"
          : error.message
        : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
