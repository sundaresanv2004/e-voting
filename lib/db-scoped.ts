/**
 * B3: Scoped DB helper — automatically injects organizationId into every query.
 * Use this instead of raw `db` for any election-related queries in server actions.
 *
 * Usage:
 *   const scopedDb = getScopedDb(organizationId)
 *   const elections = await scopedDb.election.findMany({ where: { status: "ACTIVE" } })
 */
import { db } from "@/lib/db"
import type { Prisma } from "@prisma/client"

export function getScopedDb(organizationId: string) {
  return {
    election: {
      findMany: <T extends Omit<Prisma.ElectionFindManyArgs, "where"> & { where?: Prisma.ElectionWhereInput }>(
        args?: T
      ) =>
        db.election.findMany({
          ...args,
          where: { ...args?.where, organizationId, deletedAt: null },
        }),

      findFirst: <T extends Omit<Prisma.ElectionFindFirstArgs, "where"> & { where?: Prisma.ElectionWhereInput }>(
        args?: T
      ) =>
        db.election.findFirst({
          ...args,
          where: { ...args?.where, organizationId, deletedAt: null },
        }),

      findUnique: (args: Prisma.ElectionFindUniqueArgs) =>
        db.election.findFirst({
          ...args,
          where: { ...(args.where as object), organizationId, deletedAt: null } as Prisma.ElectionWhereInput,
        }),

      count: (args?: { where?: Prisma.ElectionWhereInput }) =>
        db.election.count({
          ...args,
          where: { ...args?.where, organizationId, deletedAt: null },
        }),
    },

    candidate: {
      findMany: <T extends Omit<Prisma.CandidateFindManyArgs, "where"> & { where?: Prisma.CandidateWhereInput }>(
        args?: T
      ) =>
        db.candidate.findMany({
          ...args,
          where: { ...args?.where, deletedAt: null },
        }),
    },

    ballot: {
      findMany: <T extends Omit<Prisma.BallotFindManyArgs, "where"> & { where?: Prisma.BallotWhereInput }>(
        args?: T
      ) =>
        db.ballot.findMany({
          ...args,
          where: { ...args?.where, deletedAt: null },
        }),

      findFirst: <T extends Omit<Prisma.BallotFindFirstArgs, "where"> & { where?: Prisma.BallotWhereInput }>(
        args?: T
      ) =>
        db.ballot.findFirst({
          ...args,
          where: { ...args?.where, deletedAt: null },
        }),
    },
  }
}
