export type UserInfo = {
  provider: string,
  name: string,
  nickname: string,
  uid: string,
  image: string,
}

export type Token = {
  accessToken: string,
  client: string,
  uid: string,
  expiry: string,
}

export type Query = {
  [key: string]: string
}

export type Game = {
  title: string,
  desc: string,
  lang: string,
  char_count: number,
  id?: number,
  user_id?: number,
}
