import { prisma } from "@/lib/prisma";

/**
 * Finds a 1:1 DM thread between two users in a workspace, or creates it.
 */
export async function ensureDmThread(
  workspaceId: string,
  userIdA: string,
  userIdB: string,
): Promise<string> {
  if (userIdA === userIdB) {
    throw new Error("Cannot start a DM with yourself");
  }

  const candidates = await prisma.dmThread.findMany({
    where: {
      workspaceId,
      AND: [
        { participants: { some: { userId: userIdA } } },
        { participants: { some: { userId: userIdB } } },
      ],
    },
    include: { participants: true },
  });

  const pair = candidates.find((t) => t.participants.length === 2);
  if (pair) return pair.id;

  return prisma.$transaction(async (tx) => {
    const thread = await tx.dmThread.create({ data: { workspaceId } });
    await tx.dmParticipant.createMany({
      data: [
        { threadId: thread.id, userId: userIdA },
        { threadId: thread.id, userId: userIdB },
      ],
    });
    return thread.id;
  });
}

export async function getDmThreadIdForPair(
  workspaceId: string,
  userIdA: string,
  userIdB: string,
): Promise<string | null> {
  if (userIdA === userIdB) return null;
  const candidates = await prisma.dmThread.findMany({
    where: {
      workspaceId,
      AND: [
        { participants: { some: { userId: userIdA } } },
        { participants: { some: { userId: userIdB } } },
      ],
    },
    include: { participants: true },
  });
  const pair = candidates.find((t) => t.participants.length === 2);
  return pair?.id ?? null;
}
