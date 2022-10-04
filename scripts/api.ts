import type { Token, Game, Word } from 'types/global'
import { ClientSideCookies } from 'scripts/cookie'
import validate from 'scripts/validate'

const API_URL: string = `${process.env.NEXT_PUBLIC_API_PROTOCOL}://${process.env.NEXT_PUBLIC_API_DOMAIN}`

function saveToken(headers: Headers) {
  const token = {
    accessToken: headers.get('access-token'),
    client: headers.get('client'),
    uid: headers.get('uid'),
    expiry: headers.get('expiry'),
  }
  if (validate.token(token)) {
    ClientSideCookies.saveToken(token as Token)
  }
}

export async function deleteSignOut(token: Token) {
  const res = await fetch(`${API_URL}/api/v1/auth/sign_out`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    }
  })
  ClientSideCookies.destroyToken()
  return await res.json()
}

// ********** User **********
export async function getCuurentUser(token: Token) {
  const res = await fetch(`${API_URL}/api/v1/users/current`, {
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

export async function deleteCurrentUser(token: Token) {
  const res = await fetch(`${API_URL}/api/v1/auth/`, {
    method: 'DELETE',
    headers: {
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    }
  })
  ClientSideCookies.destroyToken()
  return await res.json()
}

// ********** Game **********
export async function getGame(gameId: number) {
  const res = await fetch(`${API_URL}/api/v1/games/${gameId}`)
  return await res.json()
}


export async function getGames() {
  const res = await fetch(`${API_URL}/api/v1/games/`)
  return await res.json()
}

export async function getCurrentGames(token: Token) {
  const res = await fetch(`${API_URL}/api/v1/games/current_user_index`, {
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
  const res = await fetch(`${API_URL}/api/v1/games`, {
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

export async function putGame(token: Token, game: Game) {
  const body = {
    game: {
      'id': game.id,
      'title': game.title,
      'desc': game.desc,
      'challenge_count': game.challenge_count,
    }
  }
  const res = await fetch(`${API_URL}/api/v1/games/${game.id}`, {
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

export async function deleteGame(token: Token, game: Game) {
  const res = await fetch(`${API_URL}/api/v1/games/${game.id}`, {
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

// ********** Word **********
export async function getCurrentWords(token: Token, game: Game, page: number) {
  const res = await fetch(`${API_URL}/api/v1/games/${game.id}/words/edit?page=${page}`, {
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

export async function postWords(token: Token, game: Game, words: string[]) {
  const body = { words: words, game_id: game.id }
  const res = await fetch(`${API_URL}/api/v1/words`, {
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

export async function putWord(token: Token, word: Word) {
  const body = {
    word: {
      'id': word.id,
      'name': word.name,
    }
  }
  const res = await fetch(`${API_URL}/api/v1/words/${word.id}`, {
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

export async function deleteWord(token: Token, word_id: number) {
  const res = await fetch(`${API_URL}/api/v1/words/${word_id}`, {
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
