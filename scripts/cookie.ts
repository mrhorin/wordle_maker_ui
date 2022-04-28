import { Token, UserInfo } from 'types/global'
import { GetServerSidePropsContext } from 'next'
import nookies from 'nookies'

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

export class Client{
}