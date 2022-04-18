export const up = async function (knex) {
  await knex.schema.createTable('credential', table => {
    table.uuid('id', 36).index()
    table.uuid('source_id', 64).index()
    table.string('source', 25).index().notNullable()
    table.string('type', 25).index().notNullable()
    table.string('created_at', 28).notNullable()
    table.string('updated_at', 28)
  })
}

export const down = async function (knex) {
  await knex.schema.dropTableIfExists('credential')
}
