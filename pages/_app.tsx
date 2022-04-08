import type { AppProps } from 'next/app'
import type { UserInfo, Token, Query } from 'types/global'
import { useState, useLayoutEffect } from 'react'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import CurrentTokenContext from 'contexts/current_token'
import CurrentUserInfoContext from 'contexts/current_user_info'
import ShowAccountMenuContext from 'contexts/show_account_menu'

import validate from 'validate'

import Layout from 'components/layout'
import 'styles/globals.scss'

const cookieOptions = { maxAge: 30 * 24 * 60 * 60, path: '/' }

export default function MyApp({ Component, pageProps }: AppProps) {
  const [currentToken, setCurrentToken] = useState<Token | null>(null)
  const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo | null>(null)
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false)

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
      if (validate.token(prevToken) && validate.userInfo(prevUserInfo) && new Date(Number(prevToken.expiry.padEnd(13, '0'))) > new Date()) {
        // Restore user info
        setCurrentToken(prevToken)
        setCurrentUserInfo(prevUserInfo)
      } else {
        // Delete stored token and user info
        destroyTokenCookies()
        destroyUserInfoCookies()
        setCurrentToken(null)
        setCurrentUserInfo(null)
      }
    }
  }, [])

  return (
    <CurrentTokenContext.Provider value={{ currentToken, setCurrentToken, destroyTokenCookies }}>
      <CurrentUserInfoContext.Provider value={{ currentUserInfo, setCurrentUserInfo, destroyUserInfoCookies }}>
        <ShowAccountMenuContext.Provider value={{ showAccountMenu, setShowAccountMenu }}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ShowAccountMenuContext.Provider>
      </CurrentUserInfoContext.Provider>
    </CurrentTokenContext.Provider>
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
  setCookie(null, 'provider', userInfo.provider, cookieOptions)
  setCookie(null, 'name', userInfo.name, cookieOptions)
  setCookie(null, 'nickname', userInfo.nickname, cookieOptions)
  setCookie(null, 'uid', userInfo.uid, cookieOptions)
  setCookie(null, 'image', userInfo.image, cookieOptions)
}

function destroyUserInfoCookies(): void{
  destroyCookie(null, 'provider', cookieOptions)
  destroyCookie(null, 'name', cookieOptions)
  destroyCookie(null, 'nickname', cookieOptions)
  destroyCookie(null, 'image', cookieOptions)
  const cookies = parseCookies()
  if (!cookies['accessToken']) destroyCookie(null, 'uid', cookieOptions)
}

function loadUserInfo(): UserInfo | null{
  const cookies = parseCookies()
  const userInfo = {
    provider: cookies['provider'],
    name: cookies['name'],
    nickname: cookies['nickname'],
    uid: cookies['uid'],
    image: cookies['image'],
  }
  if (validate.userInfo(userInfo)) {
    return userInfo as UserInfo
  } else {
    return null
  }
}

function saveToken(token: Token): void {
  setCookie(null, 'accessToken', token.accessToken, cookieOptions)
  setCookie(null, 'client', token.client, cookieOptions)
  setCookie(null, 'uid', token.uid, cookieOptions)
  setCookie(null, 'expiry', token.expiry, cookieOptions)
}

function destroyTokenCookies(): void{
  destroyCookie(null, 'accessToken', cookieOptions)
  destroyCookie(null, 'client', cookieOptions)
  destroyCookie(null, 'expiry', cookieOptions)
  const cookies = parseCookies()
  if (!cookies['nickname']) destroyCookie(null, 'uid', cookieOptions)
}

function loadToken(): Token | null{
  const cookies = parseCookies()
  const token = {
    accessToken: cookies['accessToken'],
    client: cookies['client'],
    uid: cookies['uid'],
    expiry: cookies['expiry'],
  }
  if (validate.token(token)) {
    return token as Token
  } else {
    return null
  }
}

function getQuery(): Query{
  const url_search: string[] = location.search.slice(1).split('&')
	let key: string[] = []
  let query: Query = {}
  for (let i = 0; i < url_search.length; i++){
		key = url_search[i].split("=")
		query[key[0]] = key[1]
  }
  return query
}
