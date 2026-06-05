import { ElectionStatus } from "@prisma/client"

export function getCalculatedElectionStatus(startTime: Date, endTime: Date): ElectionStatus {
  const now = new Date()
  
  if (now < startTime) {
    return ElectionStatus.UPCOMING
  }
  
  if (now >= startTime && now <= endTime) {
    return ElectionStatus.ACTIVE
  }
  
  return ElectionStatus.COMPLETED
}
