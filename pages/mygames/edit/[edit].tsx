import type { UserInfo, Token, Game } from '../../../types/global'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useLayoutEffect, useContext } from 'react'
import ReactLoading from 'react-loading'
import Link from 'next/link'
import Head from 'next/head'
import nookies from 'nookies'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'

import Sidemenu from '../../../components/sidemenu'
import GameForm from '../../../components/game/form'

import CurrentTokenContext from '../../../contexts/current_token'
import CurrentUserInfoContext from '../../../contexts/current_user_info'

import validate from '../../../validate'

type Props = {
  token: Token,
  userInfo: UserInfo
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = nookies.get(context)
  const token: Token = {
    accessToken: cookies['accessToken'],
    client: cookies['client'],
    uid: cookies['uid'],
    expiry: cookies['expiry'],
  }
  const userInfo: UserInfo = {
    provider: cookies['provider'],
    name: cookies['name'],
    nickname: cookies['nickname'],
    uid: cookies['uid'],
    image: cookies['image'],
  }
  const props: Props = {
    token: token,
    userInfo: userInfo
  }

  if (validate.token(props.token) && validate.userInfo(props.userInfo)) {
    return { props: props }
  } else {
    return {
      props: props,
      redirect: {
        statusCode: 302,
        destination: '/signup',
      }
    }
  }
}

const defaultGame: Game = {
  id: '',
  title: '',
  desc: '',
  lang: 'en',
  char_count: 5,
}

const MygamesEdit = (props: Props) => {
  const [game, setGame] = useState<Game>(defaultGame)
  const currentTokenContext = useContext(CurrentTokenContext)
  const currentUserInfoContext = useContext(CurrentUserInfoContext)
  const router = useRouter()

  useLayoutEffect(() => {
    if (validate.token(props.token)) {
      const gameId: string = location.pathname.split('/')[3]
      fetchGame(props.token, gameId).then((json) => {
        if (json.ok) setGame(json.data)
      })
    } else {
      // Delete stored token and user info
      currentTokenContext.setCurrentToken(null)
      currentTokenContext.destroyTokenCookies()
      currentUserInfoContext.setCurrentUserInfo(null)
      currentUserInfoContext.destroyUserInfoCookies()
      router.replace('/signup')
    }
  }, [])

  function createEditGameComponent(): JSX.Element{
    if (game) {
      return <GameForm game={game} setGame={setGame} handleClickSubmit={handleClickSubmit}/>
    } else {
      return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
    }
  }

  function validateTitle(): boolean{
    const titleLength: number = Number(game.title.length)
    const titleInvalidFeedback: HTMLElement | null = document.querySelector('#game-title-invalid-feedback')
    if (titleLength < 1) {
      document.querySelector('#game-title')?.classList.add('input-invalid')
      if (titleInvalidFeedback) titleInvalidFeedback.innerHTML = '* Title is required.'
      return false
    } else if (titleLength > 100) {
      document.querySelector('#game-title')?.classList.add('input-invalid')
      if (titleInvalidFeedback?.innerHTML) titleInvalidFeedback.innerHTML = '* Title must be 100 characters or less.'
      return false
    } else {
      document.querySelector('#game-title')?.classList.remove('input-invalid')
      if (titleInvalidFeedback?.innerHTML) titleInvalidFeedback.innerHTML = ''
      return true
    }
  }

  function handleClickSubmit(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      if (validateTitle()) {
        const langElement: HTMLSelectElement = document.querySelector('#game-lang') as HTMLSelectElement
        const body = {
          game: {
            'title': game.title,
            'desc': game.desc,
            'char_count': game.char_count,
            'lang': langElement.value
          }
        }
        fetch('http://localhost:3000/api/v1/games/create', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            'access-token': currentTokenContext.currentToken.accessToken,
            'client': currentTokenContext.currentToken.client,
            'uid': currentTokenContext.currentToken.uid
          },
          body: JSON.stringify(body)
        }).then(res => res.json())
          .then(json => console.log(json))
          .catch(error => console.log(error))
      }
    } else {
      // Delete stored token and user info
      currentTokenContext.setCurrentToken(null)
      currentTokenContext.destroyTokenCookies()
      currentUserInfoContext.setCurrentUserInfo(null)
      currentUserInfoContext.destroyUserInfoCookies()
      router.replace('/signup')
    }
  }

  async function fetchGame(token: Token, gameId: string) {
    const res = await fetch(`http://localhost:3000/api/v1/games/${gameId}`, {
      method: 'GET',
      headers: {
        'access-token': token.accessToken,
        'client': token.client,
        'uid': token.uid
      }
    })
    return await res.json()
  }

  return (
    <main id='main'>
      <Head>
        <title>Edit | My Games | WORDLE MAKER APP</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='container'>
        <div id='sidemenu-container'>
          <Sidemenu activeMenu={'edit'}/>

          <div id='sidemenu-main'>
            <h1 className='title'>Edit games</h1>
            <div style={{display: 'inline-block', marginRight: '0.5rem'}}>Game URL:</div>
            <Link href={`/games/${game.id}`}>
              <a className='sidemenu-item sidemenu-item-mygames-create'>
                {`http://localhost:8000/games/${game.id}`}
              </a>
            </Link>
            {createEditGameComponent()}
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesEdit
