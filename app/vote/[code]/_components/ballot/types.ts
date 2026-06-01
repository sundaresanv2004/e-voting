export interface BallotCandidate {
    id: string
    name: string
    profileImage?: string | null
    symbolImage?: string | null
    isNota?: boolean
}

export interface BallotRole {
    id: string
    name: string
    order: number
    candidates: BallotCandidate[]
}

export interface BallotElection {
    id: string
    name: string
    settings: {
        showCandidateProfiles: boolean
        showCandidateSymbols: boolean
        shuffleCandidates: boolean
        allowNota: boolean
        allowMultipleVotes: boolean
        maxVotesPerUser: number
    }
    roles: BallotRole[]
}

export interface VoterData {
    id: string
    uniqueId: string
    name: string
    image?: string | null
    additionalDetails?: unknown
    ballotsCount: number
    maxVotes: number
}
