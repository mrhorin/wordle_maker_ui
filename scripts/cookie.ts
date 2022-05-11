import { Token, UserInfo } from 'types/global'
import { GetServerSidePropsContext } from 'next'
import nookies from 'nookies'
import { parseCookies, setCookie, destroyCookie } from 'nookies'

import validate from './validate'

export class ServerSideCookies{
  public context: GetServerSidePropsContext
  public cookies: { [key: string]: string }

  public constructor(context: GetServerSidePropsContext) {
    this.context = context
    this.cookies = nookies.get(context)
  }

  public get token(): Token{
    return {
      accessToken: this.cookies['accessToken'],
      client: this.cookies['client'],
      uid: this.cookies['uid'],
      expiry: this.cookies['expiry'],
    }
  }

  public get userInfo(): UserInfo{
    return {
      provider: this.cookies['provider'],
      name: this.cookies['name'],
      nickname: this.cookies['nickname'],
      uid: this.cookies['uid'],
      image: this.cookies['image'],
    }
  }
}

export class ClientSideCookies{
  static readonly cookieOptions = { maxAge: 30 * 24 * 60 * 60, path: '/' }

  static saveUserInfo(userInfo: UserInfo): void{
    setCookie(null, 'provider', userInfo.provider, this.cookieOptions)
    setCookie(null, 'name', userInfo.name, this.cookieOptions)
    setCookie(null, 'nickname', userInfo.nickname, this.cookieOptions)
    setCookie(null, 'uid', userInfo.uid, this.cookieOptions)
    setCookie(null, 'image', userInfo.image, this.cookieOptions)
  }

  static destroyUserInfo(): void{
    destroyCookie(null, 'provider', this.cookieOptions)
    destroyCookie(null, 'name', this.cookieOptions)
    destroyCookie(null, 'nickname', this.cookieOptions)
    destroyCookie(null, 'image', this.cookieOptions)
    const cookies = parseCookies()
    // uid is also used with Token
    if (!cookies['accessToken']) destroyCookie(null, 'uid', this.cookieOptions)
  }

  static loadUserInfo(): UserInfo | null{
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

  static saveToken(token: Token): void {
    setCookie(null, 'accessToken', token.accessToken, this.cookieOptions)
    setCookie(null, 'client', token.client, this.cookieOptions)
    setCookie(null, 'uid', token.uid, this.cookieOptions)
    setCookie(null, 'expiry', token.expiry, this.cookieOptions)
  }

  static destroyToken(): void{
    destroyCookie(null, 'accessToken', this.cookieOptions)
    destroyCookie(null, 'client', this.cookieOptions)
    destroyCookie(null, 'expiry', this.cookieOptions)
    const cookies = parseCookies()
    if (!cookies['nickname']) destroyCookie(null, 'uid', this.cookieOptions)
  }

  static loadToken(): Token | null{
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
}