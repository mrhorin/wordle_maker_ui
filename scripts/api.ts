import type { Token, Game, Word } from 'types/global'
import { GetServerSidePropsContext } from 'next'
import cookie from 'scripts/cookie'
import validate from 'scripts/validate'

const API_URL: string = `${process.env.API_PROTOCOL}://${process.env.API_DOMAIN}`
const NEXT_PUBLIC_API_URL: string = `${process.env.NEXT_PUBLIC_API_PROTOCOL}://${process.env.NEXT_PUBLIC_API_DOMAIN}`

function saveToken(headers: Headers, ctx?: GetServerSidePropsContext) {
  const token = {
    accessToken: headers.get('access-token'),
    client: headers.get('client'),
    uid: headers.get('uid'),
    expiry: headers.get('expiry'),
  }
  if (validate.token(token)) {
    if (typeof window === 'undefined' && ctx) {
      // When server side
      cookie.client.saveToken(token as Token, ctx)
    } else {
      // When client side
      cookie.client.saveToken(token as Token)
    }
  }
}

export async function deleteSignOut(token: Token) {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/auth/sign_out`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    }
  })
  cookie.client.destroyToken()
  return await res.json()
}

// ******************** User ********************
// users#current
export async function getCuurentUser(token: Token) {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/users/current`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    }
  })
  saveToken(res.headers)
  return res.json()
}

// users#destroy
export async function deleteCurrentUser(token: Token) {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/auth/`, {
    method: 'DELETE',
    headers: {
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    }
  })
  cookie.client.destroyToken()
  return await res.json()
}

// ******************** Game ********************
// games#show
export async function getGame(gameId: number, token?: Token, ctx?: GetServerSidePropsContext) {
  const url: string = typeof window === 'undefined' ? `${API_URL}/api/v1/games/${gameId}` : `${NEXT_PUBLIC_API_URL}/api/v1/games/${gameId}`
  const res = token ? await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid,
    }
  }) : await fetch(url)
  if (token) {
    ctx ? saveToken(res.headers, ctx) : saveToken(res.headers)
  }
  return await res.json()
}

// games#index
export async function getGames() {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/games/`)
  return await res.json()
}

// games#current_user_index
export async function getCurrentGames(token: Token) {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/games/current-user-index`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    }
  })
  saveToken(res.headers)
  return await res.json()
}

// games#create
export async function postGame(token: Token, game: Game) {
  const body = {
    game: {
      'title': game.title,
      'desc': game.desc,
      'challenge_count': game.challenge_count,
      'char_count': game.char_count,
      'lang': game.lang
    }
  }
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    },
    body: JSON.stringify(body)
  })
  saveToken(res.headers)
  return await res.json()
}

// games#update
export async function putGame(token: Token, game: Game) {
  const body = {
    game: {
      'id': game.id,
      'title': game.title,
      'desc': game.desc,
      'challenge_count': game.challenge_count,
      'is_published': game.is_published,
    }
  }
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/games/${game.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    },
    body: JSON.stringify(body)
  })
  saveToken(res.headers)
  return await res.json()
}

// games#destroy
export async function deleteGame(token: Token, game: Game) {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/games/${game.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    }
  })
  saveToken(res.headers)
  return await res.json()
}

// ******************** Word ********************
// words#index
export async function getGameWords(gameId: number, token?: Token, ctx?: GetServerSidePropsContext) {
  const url: string = typeof window === 'undefined' ? `${API_URL}/api/v1/games/${gameId}/words` : `${NEXT_PUBLIC_API_URL}/api/v1/games/${gameId}/words`
  const res = token ? await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    }
  }) : await fetch(url)
  if (token) {
    ctx ? saveToken(res.headers, ctx) : saveToken(res.headers)
  }
  return await res.json()
}

// words#today
export async function getWordsToday(gameId: number, token?: Token, ctx?: GetServerSidePropsContext) {
  const url: string = typeof window === 'undefined' ? `${API_URL}/api/v1/words/today/${gameId}` : `${NEXT_PUBLIC_API_URL}/api/v1/words/today/${gameId}`
  const res = token ? await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    }
  }) : await fetch(url)
  if (token) {
    ctx ? saveToken(res.headers, ctx) : saveToken(res.headers)
  }
  return await res.json()
}

// words#edit
export async function getCurrentWords(token: Token, game: Game, params?: string) {
  let url: string = `${NEXT_PUBLIC_API_URL}/api/v1/games/${game.id}/words/edit`
  params ? url += params : url += '?page=1'
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    }
  })
  saveToken(res.headers)
  return await res.json()
}

// words#create
export async function postWords(token: Token, game: Game, words: string[]) {
  const body = { words: words, game_id: game.id }
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/words`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    },
    body: JSON.stringify(body)
  })
  saveToken(res.headers)
  return await res.json()
}

// words#update
export async function putWord(token: Token, word: Word) {
  const body = {
    word: {
      'id': word.id,
      'name': word.name,
    }
  }
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/words/${word.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    },
    body: JSON.stringify(body)
  })
  saveToken(res.headers)
  return await res.json()
}

// words#destroy
export async function deleteWord(token: Token, word_id: number | number[]) {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/words/${word_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    }
  })
  saveToken(res.headers)
  return await res.json()
}
