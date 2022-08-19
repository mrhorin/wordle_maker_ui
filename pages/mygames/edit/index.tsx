import type { UserInfo, Token, Game } from 'types/global'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useLayoutEffect } from 'react'

import useSignOut from 'hooks/useSignOut'
import useLocale from 'hooks/useLocale'

import ReactLoading from 'react-loading'
import Head from 'next/head'

import SlideoutMenu from 'components/slideout_menu'
import Sidemenu from 'components/sidemenu'
import GameIndexItem from 'components/game_index_item'

import { ServerSideCookies } from 'scripts/cookie'
import validate from 'scripts/validate'

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
  const [isSuspended, setIsSuspended] = useState<boolean>(false)
  const router = useRouter()
  const { t } = useLocale()
  const signOut = useSignOut()

  useLayoutEffect(() => {
    if (validate.token(props.token)) {
      fetchListCurrentGames(props.token).then((json) => {
        if (json.ok) {
          setGames(json.data.map((item: Game) => item))
        } else if (json.isSuspended) {
          setIsSuspended(true)
          setGames([])
        } else {
          setGames([])
        }
      })
    } else {
      signOut(() => router.replace('/signup'))
    }
  }, [])

  function createGameComponents(): JSX.Element[] | JSX.Element{
    if (isSuspended) {
      return <p style={{ textAlign: 'center', margin: '10rem auto' }}>{t.MY_GAMES.EDIT.INDEX.SUSPENDED_ACCOUNT}</p>
    } else if (games && games.length > 0) {
      const gameComponents: JSX.Element[] = games.map((game: Game, index: number) => {
        return <GameIndexItem game={game} href={`/mygames/edit/${game.id}#summary`} key={index} />
      })
      return gameComponents
    } else if (games == null) {
      return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
    } else {
      return <p style={{ textAlign: 'center', margin: '10rem auto' }}>{t.MY_GAMES.EDIT.INDEX.NO_GAME}</p>
    }
  }

  async function fetchListCurrentGames(token: Token) {
    const res = await fetch('http://localhost:3000/api/v1/games/current_user_index', {
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
        <title>{t.MY_GAMES.EDIT.TITLE} | {t.APP_NAME}</title>
        <meta name="description" content={t.APP_DESC} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SlideoutMenu />

      <div className='container'>
        <div id='sidemenu-container'>
          <Sidemenu activeMenu={'edit' }/>

          <div id='sidemenu-main'>
            <div className='title'>
              <div className='title-text'>{ t.MY_GAMES.EDIT.TITLE }</div>
            </div>

            <div className='game-index'>{createGameComponents()}</div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesEditIndex
