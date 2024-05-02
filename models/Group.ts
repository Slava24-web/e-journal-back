export interface IGroup {
    id: number
    level_id: number
    spec_id: number
    course: number
    number: string
}

export type GroupInfo = Omit<IGroup, 'id'>
