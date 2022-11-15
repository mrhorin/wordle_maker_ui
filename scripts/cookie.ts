import type { Token, UserInfo, Locale, Theme } from 'types/global'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { GetServerSidePropsContext } from 'next'

import validate from 'scripts/validate'

interface CookieOptions{
  maxAge: number,
  path: string,
  secure: boolean,
}

export class ClientSideCookies{

  static get cookieOptions(): CookieOptions {
    let secure: boolean = true
    if (process.env.NEXT_PUBLIC_CLIENT_COOKIE_SECURE == 'false') secure = false
    return {
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
      secure: secure
    }
  }

  static saveTheme(theme: Theme): void{
    setCookie(null, 'theme', theme, this.cookieOptions)
  }

  static loadTheme(): Theme | null{
    const cookies = parseCookies()
    return cookies['theme'] == 'dark' || cookies['theme'] == 'light' || cookies['theme'] == 'system' ? cookies['theme'] as Theme : null
  }

  static saveLocale(locale: Locale): void{
    setCookie(null, 'locale', locale, this.cookieOptions)
  }

  static loadLocale(): Locale | null{
    const cookies = parseCookies()
    return cookies['locale'] == 'en' || cookies['locale'] == 'ja' ? cookies['locale'] as Locale : null
  }

  static saveUserInfo(userInfo: UserInfo): void{
    setCookie(null, 'provider', userInfo.provider, this.cookieOptions)
    setCookie(null, 'name', userInfo.name, this.cookieOptions)
    setCookie(null, 'nickname', userInfo.nickname, this.cookieOptions)
    setCookie(null, 'uid', userInfo.uid, this.cookieOptions)
    setCookie(null, 'image', userInfo.image, this.cookieOptions)
    const isSuspended: '1' | '0' = userInfo.isSuspended ? '1' : '0'
    setCookie(null, 'isSuspended', isSuspended, this.cookieOptions)
  }

  static destroyUserInfo(): void{
    destroyCookie(null, 'provider', this.cookieOptions)
    destroyCookie(null, 'name', this.cookieOptions)
    destroyCookie(null, 'nickname', this.cookieOptions)
    destroyCookie(null, 'image', this.cookieOptions)
    destroyCookie(null, 'isSuspended', this.cookieOptions)
    const cookies = parseCookies()
    // uid is also used with Token
    if (!cookies['accessToken']) destroyCookie(null, 'uid', this.cookieOptions)
  }

  static loadUserInfo(): UserInfo | null{
    const cookies = parseCookies()
    const isSuspended: boolean = cookies['isSuspended'] == '1' ? true : false
    const userInfo = {
      provider: cookies['provider'],
      name: cookies['name'],
      nickname: cookies['nickname'],
      uid: cookies['uid'],
      image: cookies['image'],
      isSuspended: isSuspended,
    }
    if (validate.userInfo(userInfo)) {
      return userInfo as UserInfo
    } else {
      return null
    }
  }

  static saveToken(token: Token, ctx?: GetServerSidePropsContext): void {
    setCookie(ctx, 'accessToken', token.accessToken, this.cookieOptions)
    setCookie(ctx, 'client', token.client, this.cookieOptions)
    setCookie(ctx, 'uid', token.uid, this.cookieOptions)
    setCookie(ctx, 'expiry', token.expiry, this.cookieOptions)
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

const cookie = { client: ClientSideCookies }

export default cookie