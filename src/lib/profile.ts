import { z } from "zod";
import type { Member, User } from "@prisma/client";
import { loginUsernameFromEmail } from "@/lib/auth";

const optionalText = z
  .string()
  .nullable()
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    const t = (v ?? "").trim();
    return t === "" ? null : t;
  });

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2)
    .optional()
    .transform((v) => (v === undefined ? undefined : v.trim())),
  email: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
  phone: optionalText,
  nominee: optionalText,
  nomineePhone: optionalText,
  nidNumber: optionalText,
  address: optionalText,
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export type ProfileDto = {
  name: string;
  email: string;
  username: string;
  phone: string | null;
  nominee: string | null;
  nomineePhone: string | null;
  nidNumber: string | null;
  address: string | null;
  memberNumber: number | null;
  role: string;
  memberId: string | null;
};

export function profileFromUser(user: User, member: Member | null): ProfileDto {
  const phone = user.phone ?? member?.phone ?? null;
  const nominee = user.nominee ?? member?.nominee ?? null;
  const nomineePhone = user.nomineePhone ?? member?.nomineePhone ?? null;
  const nidNumber = user.nidNumber ?? member?.nidNumber ?? null;
  const address = user.address ?? member?.address ?? null;

  return {
    name: member?.name ?? user.name,
    email: user.email,
    username: loginUsernameFromEmail(user.email),
    phone,
    nominee,
    nomineePhone,
    nidNumber,
    address,
    memberNumber: member?.memberNumber ?? null,
    role: user.role,
    memberId: member?.id ?? user.memberId,
  };
}

export function userProfilePatch(data: ProfileUpdateInput) {
  const patch: {
    name?: string;
    phone?: string | null;
    nominee?: string | null;
    nomineePhone?: string | null;
    nidNumber?: string | null;
    address?: string | null;
  } = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.phone !== undefined) patch.phone = data.phone;
  if (data.nominee !== undefined) patch.nominee = data.nominee;
  if (data.nomineePhone !== undefined) patch.nomineePhone = data.nomineePhone;
  if (data.nidNumber !== undefined) patch.nidNumber = data.nidNumber;
  if (data.address !== undefined) patch.address = data.address;
  return patch;
}

export function memberProfilePatch(data: ProfileUpdateInput) {
  const patch: {
    name?: string;
    phone?: string | null;
    nominee?: string | null;
    nomineePhone?: string | null;
    nidNumber?: string | null;
    address?: string | null;
  } = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.phone !== undefined) patch.phone = data.phone;
  if (data.nominee !== undefined) patch.nominee = data.nominee;
  if (data.nomineePhone !== undefined) patch.nomineePhone = data.nomineePhone;
  if (data.nidNumber !== undefined) patch.nidNumber = data.nidNumber;
  if (data.address !== undefined) patch.address = data.address;
  return patch;
}
