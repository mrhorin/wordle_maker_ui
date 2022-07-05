import type { UserInfo, Token, Game } from 'types/global'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useLayoutEffect } from 'react'

import useSignOut from 'hooks/useSignOut'

import ReactLoading from 'react-loading'
import Head from 'next/head'

import SlideoutMenu from 'components/slideout_menu'
import Sidemenu from 'components/sidemenu'

import { ServerSideCookies } from 'scripts/cookie'
import validate from 'scripts/validate'

import Link from 'next/link'

type Props = {
  token: Token,
  userInfo: UserInfo,
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = new ServerSideCookies(context)
  const props: Props = { token: cookies.token, userInfo: cookies.userInfo }

  if (validate.token(props.token) && validate.userInfo(props.userInfo)) {
    return { props: props }
  } else {
    return {
      props: props,
      redirect: { statusCode: 302, destination: '/signup' }
    }
  }
}

const MygamesEditIndex = (props: Props) => {
  const [games, setGames] = useState<Game[] | null>(null)
  const router = useRouter()
  const signOut = useSignOut()

  useLayoutEffect(() => {
    if (validate.token(props.token)) {
      fetchListCurrentGames(props.token).then((json) => {
        if (json.ok) setGames(json.data.map((item: Game) => item))
      })
    } else {
      signOut(() => router.replace('/signup'))
    }
  }, [])

  function createGameComponents(): JSX.Element[] | JSX.Element{
    if (games && games.length > 0) {
      const gameComponents: JSX.Element[] = games.map((game: Game, index: number) => {
        return (
          <div className='game-index-item' key={index}>
            {/* Title */}
            <div className='game-index-item-title'>
              <Link href={`/mygames/edit/${game.id}#summary`}><a>{game.title}</a></Link>
            </div>
            {/* Description */}
            <div className='game-index-item-desc'>{game.desc}</div>
            <div className='game-index-item-attrs'>
              {/* Language */}
              <div className='game-index-item-attrs-item'>
                <div className='game-index-item-attrs-item-label'>Language:</div>
                <div className='game-index-item-attrs-item-value'>{game.lang.toUpperCase()}</div>
              </div>
              {/* Character count */}
              <div className='game-index-item-attrs-item'>
                <div className='game-index-item-attrs-item-label'>Character count:</div>
                <div className='game-index-item-attrs-item-value'>{game.char_count}</div>
              </div>
            </div>
          </div>
        )
      })
      return gameComponents
    }else if(games == null){
      return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
    } else {
      return <p style={{textAlign: 'center', margin: '10rem auto'}}>Looks like you haven't created anything yet..?</p>
    }
  }

  async function fetchListCurrentGames(token: Token) {
    const res = await fetch('http://localhost:3000/api/v1/games/list_current_games', {
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
        <SlideoutMenu />
        <div id='sidemenu-container'>
          <Sidemenu activeMenu={'edit' }/>

          <div id='sidemenu-main'>
            <div className='title'>
              <div className='title-text'>Edit games</div>
            </div>

            <div className='game-index'>{createGameComponents()}</div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesEditIndex
