import pool from "../db";

class UserRepository {
    /** Создание нового пользователя */
    static async createUser({ email, hashedPassword, username }: { email: string; hashedPassword: string; username: string }) {
        const response = await pool.query(
            'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *',
            [email, hashedPassword, username]
        )

        return response.rows[0]
    }

    /** Получение данных о пользователе по email */
    static async getUserData(email: string) {
        const response = await pool.query('SELECT * FROM users WHERE email = $1', [email])

        if (!response.rows.length) {
            return null
        }

        return response.rows[0]
    }

    /** Получение данных о пользователе по id */
    static async getUserDataById(id: number) {
        const response = await pool.query('SELECT * FROM users WHERE id = $1', [id])

        if (!response.rows.length) {
            return null
        }

        return response.rows[0]
    }
}

export default UserRepository