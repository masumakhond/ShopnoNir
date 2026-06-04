import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  createToken,
  hashPassword,
  normalizeLoginId,
  requireSession,
  setAuthCookie,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  memberProfilePatch,
  profileFromUser,
  profileUpdateSchema,
  userProfilePatch,
} from "@/lib/profile";

export async function GET() {
  const session = await requireSession(["MEMBER", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { member: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ profile: profileFromUser(user, user.member) });
}

export async function PATCH(request: Request) {
  const session = await requireSession(["MEMBER", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = profileUpdateSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { member: true },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const normalizedEmail = body.email ? normalizeLoginId(body.email) : undefined;

    if (normalizedEmail && normalizedEmail !== user.email) {
      const taken = await prisma.user.findFirst({
        where: { email: normalizedEmail, id: { not: user.id } },
      });
      if (taken) {
        return NextResponse.json({ error: "Email or username is already in use" }, { status: 409 });
      }
    }

    const memberPatch = memberProfilePatch(body);
    if (user.member && Object.keys(memberPatch).length > 0) {
      await prisma.member.update({
        where: { id: user.member.id },
        data: memberPatch,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...userProfilePatch(body),
        name: body.name ?? user.name,
        email: normalizedEmail ?? user.email,
        ...(body.password ? { passwordHash: await hashPassword(body.password) } : {}),
      },
      include: { member: true },
    });

    const token = await createToken({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      memberId: updatedUser.memberId,
    });
    await setAuthCookie(token);

    return NextResponse.json({
      ok: true,
      profile: profileFromUser(updatedUser, updatedUser.member),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email or username is already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
