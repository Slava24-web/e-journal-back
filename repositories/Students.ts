import { StudentInfo } from "../models/Student";
import pool from "../db";

class StudentsRepository {
    static async addStudent(studentInfo: StudentInfo) {
        const { name, group_id, elder } = studentInfo

        const response = await pool.query(
            'INSERT INTO students (name, group_id, elder) VALUES ($1, $2, $3) RETURNING *',
            [name, group_id, elder ? 1 : 0]
        )

        return response.rows[0]
    }

    static async getStudentsByGroupId(group_id: number) {
        const response = await pool.query('SELECT * FROM students WHERE group_id = $1', [group_id])

        if (!response.rows.length) {
            return null
        }

        return response.rows
    }
}

export default StudentsRepository