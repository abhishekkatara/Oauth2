import dotenv from 'dotenv'

if (process.env.ENV === 'local') {
  dotenv.config()
}

export default {
  client: 'mysql2',
  connection: () => ({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  }),
  migrations: {
    directory: './migrations',
    tableName: 'knex_talent_migrations'
  },
  seeds: {
    directory: './seeds'
  },
  pool: {
    min: process.env.DB_POOL_MIN || 1,
    max: process.env.DB_POOL_MAX || 10
  }
}
