import pool from "../db";

class DisciplinesRepository {
    static async getAllDisciplines() {
        const response = await pool.query('SELECT * FROM disciplines')

        if (!response.rows.length) {
            return null
        }

        return response.rows
    }

    static async addDiscipline(name: string) {
        const response = await pool.query(
            'INSERT INTO disciplines (name) VALUES ($1) RETURNING *',
            [name]
        )

        return response.rows[0]
    }
}

export default DisciplinesRepository