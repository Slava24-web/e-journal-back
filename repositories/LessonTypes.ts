import pool from "../db.ts";

class LessonTypesRepository {
    static async getAllLessonTypes() {
        const response = await pool.query('SELECT * FROM lesson_types')

        return response.rows
    }
}

export default LessonTypesRepository
