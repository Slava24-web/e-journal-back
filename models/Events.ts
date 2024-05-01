// Событие календаря
export interface IEvent {
    id: number
    group_id: number
    lesson_type_id: number
    user_id: number
    title: string
    start_datetime: number
    end_datetime: number
    room?: string
    description?: string
}

export type EventInfo = Omit<IEvent, 'id' | 'user_id'>
