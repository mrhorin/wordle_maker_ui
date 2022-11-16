export type User = {
  provider: string,
  name: string,
  nickname: string,
  uid: string,
  image: string,
  isSuspended: boolean,
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
  id: number, // id has to be unique
  value: string,
  isValid: boolean,
}

export type Game = {
  title: string,
  desc: string,
  lang: string,
  char_count: number,
  challenge_count: number,
  is_published: boolean,
  id?: number,
  user_id?: number,
  is_suspended?: boolean,
  words_count?: number,
}

export type Word = {
  id: number,
  name: string,
  game_id?: number,
}

export type Pagination = {
  total_count: number,
  limit_value: number,
  total_pages: number,
  current_page: number,
}

export type Tab = {
  name: string,
  hash: string,
}

export type Tile = {
  letter: string,
  status: TileStatus
}

export type AccountStatus = 'INITIALIZING' | 'LOGGEDIN' | 'SIGNIN' | 'SUSPENDED'

export type TileStatus = 'EMPTY' |'CORRECT' | 'PRESENT' | 'ABSENT'

export type KeyType = 'CHARACTER' | 'MODIFIER'

type Locale = 'en' | 'ja'

type Theme = 'system' | 'light' | 'dark'