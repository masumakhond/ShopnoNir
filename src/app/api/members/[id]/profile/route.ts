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

async function loadMember(id: string) {
  return prisma.member.findUnique({
    where: { id },
    include: { user: true },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(["ADMIN", "MEMBER"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (session.role === "MEMBER" && session.memberId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const member = await loadMember(id);
  if (!member?.user) {
    return NextResponse.json({ error: "Member login not found" }, { status: 404 });
  }

  return NextResponse.json({ profile: profileFromUser(member.user, member) });
}

const adminExtrasSchema = profileUpdateSchema.extend({
  active: z.boolean().optional(),
  monthlyAmount: z.number().positive().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const body = adminExtrasSchema.parse(await request.json());
    const member = await loadMember(id);
    if (!member?.user) {
      return NextResponse.json({ error: "Member login not found" }, { status: 404 });
    }

    const normalizedEmail = body.email ? normalizeLoginId(body.email) : undefined;
    if (normalizedEmail && normalizedEmail !== member.user.email) {
      const taken = await prisma.user.findFirst({
        where: { email: normalizedEmail, id: { not: member.user.id } },
      });
      if (taken) {
        return NextResponse.json({ error: "Email or username is already in use" }, { status: 409 });
      }
    }

    await prisma.member.update({
      where: { id: member.id },
      data: {
        ...memberProfilePatch(body),
        ...(body.active !== undefined ? { active: body.active } : {}),
        ...(body.monthlyAmount !== undefined ? { monthlyAmount: body.monthlyAmount } : {}),
      },
    });

    const updatedUser = await prisma.user.update({
      where: { id: member.user.id },
      data: {
        ...userProfilePatch(body),
        name: body.name ?? member.user.name,
        email: normalizedEmail ?? member.user.email,
        ...(body.password ? { passwordHash: await hashPassword(body.password) } : {}),
      },
      include: { member: true },
    });

    if (session.id === member.user.id) {
      const token = await createToken({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        memberId: updatedUser.memberId,
      });
      await setAuthCookie(token);
    }

    const refreshed = await loadMember(id);
    return NextResponse.json({
      ok: true,
      profile: profileFromUser(refreshed!.user!, refreshed!),
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
