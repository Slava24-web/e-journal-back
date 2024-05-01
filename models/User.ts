export interface User {
    id: number
    email: string
    password: string
    username: string
}

export type TokenPayloadData = {
    id: number,
    email: string,
    username: string
}