import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { requireSession, hashPassword, normalizeLoginId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMemberWithFinancials } from "@/lib/services";
import {
  memberProfilePatch,
  profileUpdateSchema,
  userProfilePatch,
} from "@/lib/profile";

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

  const data = await getMemberWithFinancials(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}

const updateSchema = profileUpdateSchema.extend({
  active: z.boolean().optional(),
  monthlyAmount: z.number().positive().optional(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const body = updateSchema.parse(await request.json());
    const member = await prisma.member.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.role !== undefined) {
      if (!member.user) {
        return NextResponse.json({ error: "Member has no login account" }, { status: 400 });
      }
      if (member.user.id === session.id) {
        return NextResponse.json(
          { error: "You cannot change your own admin access on this page" },
          { status: 400 },
        );
      }
      if (body.role === "MEMBER" && member.user.role === Role.ADMIN) {
        const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "At least one administrator must remain" },
            { status: 400 },
          );
        }
      }
      await prisma.user.update({
        where: { id: member.user.id },
        data: { role: body.role },
      });
    }

    await prisma.member.update({
      where: { id },
      data: {
        ...memberProfilePatch(body),
        ...(body.active !== undefined ? { active: body.active } : {}),
        ...(body.monthlyAmount !== undefined ? { monthlyAmount: body.monthlyAmount } : {}),
      },
    });

    if (member.user) {
      const normalizedEmail = body.email ? normalizeLoginId(body.email) : undefined;
      await prisma.user.update({
        where: { id: member.user.id },
        data: {
          ...userProfilePatch(body),
          name: body.name ?? member.name,
          ...(normalizedEmail ? { email: normalizedEmail } : {}),
          ...(body.password ? { passwordHash: await hashPassword(body.password) } : {}),
        },
      });
    }

    const updated = await prisma.member.findUnique({
      where: { id },
      include: { user: { select: { role: true } } },
    });

    return NextResponse.json({
      ok: true,
      role: updated?.user?.role ?? null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
