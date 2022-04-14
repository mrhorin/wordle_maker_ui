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

export type Chip = {
  value: string,
  isValid: boolean,
}

export type Game = {
  title: string,
  desc: string,
  lang: string,
  char_count: number | string,
  id?: number |string,
  user_id?: number | string,
}

export type Word = {
  value: string,
  isValid: boolean,
}