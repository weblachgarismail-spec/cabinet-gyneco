import { prisma } from "./prisma";

export async function logAction(params: {
  userId: string;
  username: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
}) {
  try {
    await prisma.log.create({ data: params });
  } catch {
    // silent fail — logging should never break the main flow
  }
}
