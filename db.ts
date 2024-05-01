import pg from 'pg'

const pool = new pg.Pool({
    user: 'slavashubin',
    password: '1234',
    host: 'localhost',
    port: 5432,
    database: 'ejournal'
})

export default pool