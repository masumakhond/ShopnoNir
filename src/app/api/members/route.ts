import { NextResponse } from "next/server";
import { requireSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MONTHLY_CONTRIBUTION_BDT } from "@/lib/constants";
import { z } from "zod";

const optionalText = z
  .string()
  .nullable()
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    const t = (v ?? "").trim();
    return t === "" ? null : t;
  });

async function getNextMemberNumber() {
  const latest = await prisma.member.findFirst({
    orderBy: { memberNumber: "desc" },
    select: { memberNumber: true },
  });
  return Math.max(1000, (latest?.memberNumber ?? 999) + 1);
}

export async function GET() {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await prisma.member.findMany({
    orderBy: { memberNumber: "asc" },
    include: {
      user: { select: { email: true, phone: true } },
      _count: { select: { contributions: true, batchMembers: true } },
    },
  });

  return NextResponse.json({ members });
}

const createSchema = z.object({
  name: z.string().min(2),
  phone: optionalText,
  nominee: optionalText,
  nomineePhone: optionalText,
  nidNumber: optionalText,
  address: optionalText,
  monthlyAmount: z.number().positive().optional(),
});

export async function POST(request: Request) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = createSchema.parse(await request.json());
    const memberNumber = await getNextMemberNumber();
    const loginUsername = `member${memberNumber}`;
    const loginEmail = `${loginUsername}@samiti.local`;
    const plainPassword = `Member@${memberNumber}`;
    const passwordHash = await hashPassword(plainPassword);

    const member = await prisma.member.create({
      data: {
        memberNumber,
        name: body.name,
        phone: body.phone ?? null,
        nominee: body.nominee ?? null,
        nomineePhone: body.nomineePhone ?? null,
        nidNumber: body.nidNumber ?? null,
        address: body.address ?? null,
        monthlyAmount: body.monthlyAmount ?? MONTHLY_CONTRIBUTION_BDT,
        user: {
          create: {
            email: loginEmail,
            passwordHash,
            role: "MEMBER",
            name: body.name,
            phone: body.phone ?? null,
            nominee: body.nominee ?? null,
            nomineePhone: body.nomineePhone ?? null,
            nidNumber: body.nidNumber ?? null,
            address: body.address ?? null,
          },
        },
      },
      include: { user: { select: { email: true } } },
    });

    return NextResponse.json(
      {
        member,
        credentials: {
          username: loginUsername,
          email: loginEmail,
          password: plainPassword,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not create member" }, { status: 500 });
  }
}
