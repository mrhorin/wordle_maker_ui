import type { AppProps } from 'next/app'
import { useState, useLayoutEffect, createContext } from 'react'
import Ajv from 'ajv'

import Layout from '../components/layout'
import '../styles/globals.scss'

/*-----------------------------------------
  contexts
-----------------------------------------*/
export const CurrentUserInfoContext = createContext<UserInfo | undefined>(undefined)

/*-----------------------------------------
  Ajv schemas
-----------------------------------------*/
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

/*-----------------------------------------
  components
-----------------------------------------*/
export default function MyApp({ Component, pageProps }: AppProps) {
  const [currenttoken, setCurrentToken] = useState<Token>()
  const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo>()

  useLayoutEffect(() => {
    const query: Query = getQuery()
    if (validate.queryToken(query)) {
      // When query has a token, fetch user info with the token
      const token: Token = {
        accessToken: query['auth_token'],
        client: query['client_id'],
        uid: query['uid'],
        expiry: query['expiry']
      }
      fetchCurrentUser(token).then(json => {
        if (json && json.isLoggedIn) {
          saveToken(token)
          setCurrentToken(token)
          const userInfo: UserInfo = {
            provider: json.data.provider,
            name: json.data.name,
            nickname: json.data.nickname,
            uid: json.data.uid,
            image: json.data.image
          }
          saveUserInfo(userInfo)
          setCurrentUserInfo(userInfo)
        }
      })
    } else {
      // When query doesn't have a token
      let prevToken: Token | null = loadToken()
      let prevUserInfo: UserInfo | null = loadUserInfo()
      if (prevToken && prevUserInfo) {
        // Restore user info
        setCurrentToken(prevToken)
        setCurrentUserInfo(prevUserInfo)
      } else {
        // Delete stored token and user info
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
      }
    }
  }, [])

  return (
    <CurrentUserInfoContext.Provider value={currentUserInfo}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </CurrentUserInfoContext.Provider>
  )
}

/*-----------------------------------------
  functions
-----------------------------------------*/
async function fetchCurrentUser(token: Token) {
  const res = await fetch('http://localhost:3000/api/v1/users/current', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    }
  })
  return await res.json()
}

function saveUserInfo(userInfo: UserInfo): void{
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
}

function loadUserInfo(): UserInfo | null{
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (validate.userInfo(userInfo)) {
    return userInfo as UserInfo
  } else {
    return null
  }
}

function saveToken(token: Token): void {
  localStorage.setItem('token', JSON.stringify(token))
}

function loadToken(): Token | null{
  const token = JSON.parse(localStorage.getItem('token') || '{}')
  if (validate.token(token)) {
    return token as Token
  } else {
    return null
  }
}

function getQuery(): Query{
  const url_search: string[] = location.search.slice(1).split('&')
	let key: string[] = []
  let query: { [key: string]: string } = {}
  for (let i = 0; i < url_search.length; i++){
		key = url_search[i].split("=")
		query[key[0]] = key[1]
  }
  return query
}

/*-----------------------------------------
  types
-----------------------------------------*/
type Token = {
  accessToken: string,
  client: string,
  uid: string,
  expiry: string,
}

type UserInfo = {
  provider: string,
  name: string,
  nickname: string,
  uid: string,
  image: string,
}

type Query = {
  [key: string]: string
}

