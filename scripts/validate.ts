import Ajv from 'ajv'

const ajv = new Ajv()

const schema = {
  token: {
    type: 'object',
    properties: {
      accessToken: { type: 'string' },
      client: { type: 'string' },
      uid: { type: 'string' },
      expiry: { type: 'string' },
    },
    required: ['accessToken', 'client', 'uid', 'expiry'],
    additionalProperties: false,
  },
  queryToken: {
    type: 'object',
    properties: {
      auth_token: { type: 'string' },
      client_id: { type: 'string' },
      uid: { type: 'string' },
      expiry: { type: 'string' },
    },
    required: ['auth_token', 'client_id', 'uid', 'expiry'],
    additionalProperties: true,
  },
  userInfo: {
    type: 'object',
    properties: {
      provider: { type: 'string' },
      name: { type: 'string' },
      nickname: { type: 'string' },
      uid: { type: 'string' },
      image: { type: 'string' },
    },
    required: ['provider', 'name', 'nickname', 'uid', 'image'],
    additionalProperties: false,
  },
}

const validate = {
  token: ajv.compile(schema.token),
  queryToken: ajv.compile(schema.queryToken),
  userInfo: ajv.compile(schema.userInfo)
}

export default validate