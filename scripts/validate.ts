import type { Game } from 'types/global'
import Language from 'scripts/language'
import Ajv from 'ajv'

const ajv = new Ajv()

const schema = {
  token: {
    type: 'object',
    properties: {
      accessToken: { type: 'string', minLength: 1 },
      client: { type: 'string', minLength: 1 },
      uid: { type: 'string', minLength: 1 },
      expiry: { type: 'string', minLength: 1 },
    },
    required: ['accessToken', 'client', 'uid', 'expiry'],
    additionalProperties: false,
  },
  queryToken: {
    type: 'object',
    properties: {
      auth_token: { type: 'string', minLength: 1 },
      client_id: { type: 'string', minLength: 1 },
      uid: { type: 'string', minLength: 1 },
      expiry: { type: 'string', minLength: 1 },
    },
    required: ['auth_token', 'client_id', 'uid', 'expiry'],
    additionalProperties: true,
  },
  user: {
    type: 'object',
    properties: {
      provider: { type: 'string', minLength: 1 },
      name: { type: 'string', minLength: 1 },
      nickname: { type: 'string', minLength: 1 },
      uid: { type: 'string', minLength: 1 },
      image: { type: 'string', minLength: 1 },
      isSuspended: { type: 'boolean'},
    },
    required: ['provider', 'name', 'nickname', 'uid', 'image', 'isSuspended'],
    additionalProperties: false,
  },
  word: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      name: { type: 'string', minLength: 1 },
      game_id: { type: 'number' },
      created_at: { type: 'string' },
      updated_at: { type: 'string' },
    },
    required: ['id', 'name'],
    additionalProperties: false,
  }
}

const validateWordWithGame = (word: string, game: Game) => {
  const language = new Language(game.lang)
  return word.length == game.char_count && language.validateWord(word)
}

const validate = {
  token: ajv.compile(schema.token),
  queryToken: ajv.compile(schema.queryToken),
  user: ajv.compile(schema.user),
  word: ajv.compile(schema.word),
  wordWithGame: validateWordWithGame,
}

export default validate