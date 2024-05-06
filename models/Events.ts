// Событие календаря
export interface IEvent {
    id: number
    group_id: number
    lesson_type_id: number
    user_id: number
    discipline_id: number
    start_datetime: number
    end_datetime: number
    room?: string
    description?: string
}

export interface EventInfo extends Omit<IEvent, 'id' | 'user_id'> {
    discipline_name?: string
}
