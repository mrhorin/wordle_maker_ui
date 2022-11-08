import type { Token, Game } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useEffect, useContext } from 'react'

import useSignOut from 'hooks/useSignOut'
import useLocale from 'hooks/useLocale'

import ReactLoading from 'react-loading'
import Head from 'next/head'
import Link from 'next/link'

import AccountStatusContext from 'contexts/account_status'

import SlideoutMenu from 'components/slideout_menu'
import Sidemenu from 'components/sidemenu'
import GameIndexItem from 'components/game_index_item'

import cookie from 'scripts/cookie'
import { getCurrentGames } from 'scripts/api'
import validate from 'scripts/validate'

const MygamesEditIndex = () => {
  /********** State **********/
  const [games, setGames] = useState<Game[] | null>(null)
  /********* Context *********/
  const accountStatusContext = useContext(AccountStatusContext)

  const router = useRouter()
  const { t } = useLocale()
  const signOut = useSignOut()

  useEffect(() => {
    const token: Token | null = cookie.client.loadToken()
    if (accountStatusContext.accountStatus == 'LOGGEDIN' && validate.token(token)) {
      getCurrentGames(token).then((json) => {
        if (json.ok) {
          setGames(json.data.map((item: Game) => item))
        } else if (json.code == 1001) {
          setGames([])
        } else {
          // JSONでUnauthorizedエラーを見て認証されませんエラーを表示する
          setGames([])
          signOut(() => router.replace('/signin'))
        }
      })
    } else if (accountStatusContext.accountStatus == 'SIGNIN') {
      signOut(() => router.replace('/signin'))
    }
  }, [accountStatusContext.accountStatus])

  function GameIndex(): JSX.Element{
    if (accountStatusContext.accountStatus == 'INITIALIZING') {
      // Loading
      return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
    } else if (accountStatusContext.accountStatus == 'SUSPENDED') {
      return <p className='sidemenu-main-msg'>{t.MY_GAMES.EDIT.INDEX.SUSPENDED_ACCOUNT}</p>
    } else if (accountStatusContext.accountStatus == 'SIGNIN') {
      return <p className='sidemenu-main-msg'>{t.ALERT.YOU_ARE_NOT_SIGNED_IN}</p>
    }
    if (games && games.length > 0) {
      // Game List
      const gameComponents: JSX.Element[] = games.map((game: Game, index: number) => {
        const titleElement: JSX.Element = <Link href={{
          pathname: '/mygames/edit/[id]',
          query: { id: game.id, t: '1' }
        }}><a>{ game.title }</a></Link>
        return <GameIndexItem game={game} key={index} titleElement={titleElement} />
      })
      return <div className='game-index'>{gameComponents}</div>
    } else {
      // No Game yet
      return (
        <p className='sidemenu-main-msg'>{t.MY_GAMES.EDIT.INDEX.NO_GAME}</p>
      )
    }
  }

  return (
    <main id='main'>
      <Head>
        <title>{`${t.MY_GAMES.EDIT.TITLE} | ${t.APP_NAME}`}</title>
      </Head>

      <SlideoutMenu />

      <div className='container'>
        <div id='sidemenu-container'>
          <Sidemenu activeMenu={'edit' }/>

          <div id='sidemenu-main'>
            <div className='title'>
              <div className='title-text'>{ t.MY_GAMES.EDIT.TITLE }</div>
            </div>

            <GameIndex />
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesEditIndex
