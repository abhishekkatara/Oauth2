import { Model, snakeCaseMappers } from 'objection'
import Knex from 'knex'

import client from '../../knexfile.js'

const knex = Knex(client)

Model.knex(knex)

class Credential extends Model {
  static get tableName () {
    return 'credential'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'source'],
      properties: {
        id: { type: 'string', maxLength: 36 },
        sourceId: { type: 'string', maxLength: 64 },
        source: { type: 'string', enum: ['google', 'facebook', 'instagram', 'email', 'phone'] },
        type: { type: 'string', enum: ['admin', 'talent', 'advertiser'] },
        jti: { type: 'string', maxLength: 32 }
      }
    }
  }

  $beforeUpdate () {
    this.updated_at = new Date().toISOString()
  }

  $beforeInsert () {
    this.created_at = new Date().toISOString()
  }

  static get columnNameMappers () {
    return snakeCaseMappers()
  }
}

export default Credential
