import { ElectionStatus } from "@prisma/client"

/**
 * Calculates the current status of an election based on the given start and end times.
 * 
 * @param startTime The start time of the election.
 * @param endTime The end time of the election.
 * @returns The calculated ElectionStatus.
 */
export function getCalculatedElectionStatus(startTime: Date, endTime: Date): ElectionStatus {
  const now = new Date()

  if (now < startTime) {
    return ElectionStatus.UPCOMING
  } else if (now > endTime) {
    return ElectionStatus.COMPLETED
  } else {
    return ElectionStatus.ACTIVE
  }
}
