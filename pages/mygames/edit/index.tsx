import type { Token, Game } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

import useSignOut from 'hooks/useSignOut'
import useLocale from 'hooks/useLocale'

import ReactLoading from 'react-loading'
import Head from 'next/head'

import SlideoutMenu from 'components/slideout_menu'
import Sidemenu from 'components/sidemenu'
import GameIndexItem from 'components/game_index_item'

import { ClientSideCookies } from 'scripts/cookie'
import { getCurrentGames } from 'scripts/api'
import validate from 'scripts/validate'

const MygamesEditIndex = () => {
  const [games, setGames] = useState<Game[] | null>(null)
  const [isSuspended, setIsSuspended] = useState<boolean>(false)
  const router = useRouter()
  const { t } = useLocale()
  const signOut = useSignOut()

  useEffect(() => {
    const token: Token | null = ClientSideCookies.loadToken()
    if (validate.token(token)) {
      getCurrentGames(token).then((json) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <main id='main'>
      <Head>
        <title>{t.MY_GAMES.EDIT.TITLE} | {t.APP_NAME}</title>
        <meta name="description" content={t.APP_DESC.FIRST_LINE + t.APP_DESC.SECOND_LINE} />
        <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0" />
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
