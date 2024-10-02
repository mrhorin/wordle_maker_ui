import type { Token, Game } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useEffect, useContext } from 'react'

import useSignOut from 'hooks/useSignOut'
import useLocale from 'hooks/useLocale'

import ReactLoading from 'react-loading'
import Head from 'next/head'

import AccountContext from 'contexts/account'

import Sidemenu from 'components/sidemenu'
import GameIndexItem from 'components/game_index_item'

import cookie from 'scripts/cookie'
import { getCurrentGames } from 'scripts/api'
import validate from 'scripts/validate'

const MygamesEditIndex = () => {
  /********** State **********/
  const [games, setGames] = useState<Game[] | null>(null)
  /********* Context *********/
  const accountContext = useContext(AccountContext)

  const router = useRouter()
  const { t } = useLocale()
  const signOut = useSignOut()

  useEffect(() => {
    const token: Token | null = cookie.client.loadToken()
    if (accountContext.status == 'LOGGEDIN' && validate.token(token)) {
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
    } else if (accountContext.status == 'SIGNIN') {
      signOut(() => router.replace('/signin'))
    }
  }, [accountContext.status])

  function GameIndex(): JSX.Element {
    if (accountContext.status == 'SUSPENDED') {
      return <p className='sidemenu-main-msg'>{t.MY_GAMES.EDIT.INDEX.SUSPENDED_ACCOUNT}</p>
    } else if (accountContext.status == 'SIGNIN') {
      return <p className='sidemenu-main-msg'>{t.ALERT.YOU_ARE_NOT_SIGNED_IN}</p>
    } else if (accountContext.status == 'INITIALIZING' || games == null) {
      // Loading
      return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
    }
    if (games && games.length > 0) {
      // Game List
      const gameComponents: JSX.Element[] = games.map((game: Game, index: number) => {
        const href = {
          pathname: '/mygames/edit/[id]',
          query: { id: game.id, t: '1' }
        }
        return <GameIndexItem game={game} key={index} href={href} />
      })
      return <div className='game-index'>{gameComponents}</div>
    }
    // No Game yet
    return (
      <p className='sidemenu-main-msg'>{t.MY_GAMES.EDIT.INDEX.NO_GAME}</p>
    )
  }

  return (
    <main id='main'>
      <Head>
        <title>{`${t.MY_GAMES.EDIT.TITLE} | ${t.APP_NAME}`}</title>
      </Head>

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
