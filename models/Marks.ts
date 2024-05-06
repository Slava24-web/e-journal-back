export interface IMark {
    id: number
    student_id: number
    event_id: number
    discipline_id: number
    mark?: string
    note?: string
}

export type MarkInfo = Omit<IMark, 'id'>