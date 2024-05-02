export interface Student {
    id: number
    name: string
    group_id: number
    elder?: boolean
}

export type StudentInfo = Omit<Student, 'id'>