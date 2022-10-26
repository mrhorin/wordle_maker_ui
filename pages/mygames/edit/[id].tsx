import type { Game, Token } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import nprogress from 'nprogress'

import Head from 'next/head'
import Link from 'next/link'
import ReactLoading from 'react-loading'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft} from '@fortawesome/free-solid-svg-icons'

import SlideoutMenu from 'components/slideout_menu'
import Sidemenu from 'components/sidemenu'
import Settings from 'components/mygames/edit/settings'
import AddWords from 'components/mygames/edit/add_words'
import EditWords from 'components/mygames/edit/edit_words'
import DeleteGame from 'components/mygames/edit/delete_game'

import useLocale from 'hooks/useLocale'
import useSignOut from 'hooks/useSignOut'

import validate from 'scripts/validate'
import { getGame } from 'scripts/api'
import cookie from 'scripts/cookie'

type TabStatus = 'INITIALIZING' | 'FAILED' | 'SETTINGS' | 'ADD_WORDS' | 'EDIT_WORDS' | 'DELETE_GAME'

const MygamesEdit = () => {
  /*
   * game:
   *  This state will be changed after updating the game by fetching API. */
  const [game, setGame] = useState<Game | null>(null)
  const [tabStatus, setTabStatus] = useState<TabStatus>('INITIALIZING')
  const { t } = useLocale()
  const signOut = useSignOut()
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const token: Token | null = cookie.client.loadToken()
    if (validate.token(token)) {
      nprogress.start()
      getGame(Number(router.query.id), token).then(json => {
        if (json.ok) {
          setGame(json.data)
          initializeTabStatus()
        } else {
          setTabStatus('FAILED')
        }
      }).catch(error => {
        console.log(error)
        setTabStatus('FAILED')
      }).finally(
        () => nprogress.done()
      )
    } else {
      signOut(() => router.replace('/signin'))
    }
  }, [])

  useEffect(() => {
    // t query should be changed after tabStatus changes
    if (tabStatus != 'INITIALIZING' && tabStatus != 'FAILED') initializeTQuery()
  }, [tabStatus])

  useEffect(() => {
    // tabStatus should be changed after t query changes
    if (tabStatus != 'INITIALIZING' && tabStatus != 'FAILED') initializeTabStatus()
  }, [router.query.t])

  // tabStatus depends on t query
  function initializeTabStatus(): void{
    if (!router.isReady) return
    const t = router.query.t
    if (t == '1' && tabStatus != 'SETTINGS') setTabStatus('SETTINGS')
    if (t == '2' && tabStatus != 'ADD_WORDS') setTabStatus('ADD_WORDS')
    if (t == '3' && tabStatus != 'EDIT_WORDS') setTabStatus('EDIT_WORDS')
    if (t == '4' && tabStatus != 'DELETE_GAME') setTabStatus('DELETE_GAME')
  }

  // t query depends on tabStatus
  function initializeTQuery(): void{
    if (!router.isReady) return
    const query = new Proxy(router.query, {
      get: (target: any, prop: string) => target[prop]
    })
    if (tabStatus == 'SETTINGS') query.t = '1'
    if (tabStatus == 'ADD_WORDS') query.t = '2'
    if (tabStatus == 'EDIT_WORDS') query.t = '3'
    if (tabStatus == 'DELETE_GAME') query.t = '4'
    router.push({ pathname: router.pathname, query: query })
  }

  function getTabClassName(tab: TabStatus): string {
    if (tab == 'SETTINGS') {
      return tabStatus == 'SETTINGS' ? 'tab tab-active' : 'tab'
    } else if (tab == 'ADD_WORDS') {
      return tabStatus == 'ADD_WORDS' ? 'tab tab-active' : 'tab'
    } else if (tab == 'EDIT_WORDS') {
      return tabStatus == 'EDIT_WORDS' ? 'tab tab-active' : 'tab'
    } else if (tab == 'DELETE_GAME') {
      return tabStatus == 'DELETE_GAME' ? 'tab tab-active' : 'tab'
    } else {
      return 'tab'
    }
  }

  function handleClickTab(nextTabStatus: TabStatus): void{
    if (tabStatus != 'INITIALIZING' && tabStatus != 'FAILED') setTabStatus(nextTabStatus)
  }

  function Title(): JSX.Element{
    const text: JSX.Element = (() => {
      if (game) return <>{game.title}</>
      if (tabStatus == 'INITIALIZING') {
        return <ReactLoading type={'spin'} color={'#008eff'}
          height={'25px'} width={'25px'} className='loading-center' />
      }
      return <></>
    })()
    return (
      <div className='title'>
        <div className='title-button'>
          <Link href="/mygames/edit"><a><FontAwesomeIcon icon={faArrowLeft} /></a></Link>
        </div>
        <div className='title-text'>{text}</div>
      </div>
    )
  }

  function Main(): JSX.Element{
    const currentPage: JSX.Element = (() => {
      if (game) {
        if (tabStatus == 'SETTINGS') return <Settings game={game} setGame={setGame} />
        if (tabStatus == 'ADD_WORDS') return <AddWords game={game}/>
        if (tabStatus == 'EDIT_WORDS') return <EditWords game={game} />
        if (tabStatus == 'DELETE_GAME') return <DeleteGame game={game} />
      }
      if (tabStatus == 'INITIALIZING') {
        return <ReactLoading type={'spin'} color={'#008eff'}
          height={'25px'} width={'25px'} className='loading-center' />
      }
      return <p>{t.API.FAILED}</p>
    })()
    return <div className='mygames-edit-main'>{currentPage}</div>
  }

  return (
    <main id='main'>
      <Head>
        <title>{`${t.MY_GAMES.EDIT.TITLE} | ${t.APP_NAME}`}</title>
      </Head>

      <SlideoutMenu />

      <div className='container'>
        <div id='sidemenu-container'>
          {/* Sidemenu */}
          <Sidemenu activeMenu={'edit'} />
          {/* Sidemenu Main */}
          <div id='sidemenu-main' className='mygames-edit'>
            {/* Mygames Edit Header */}
            <div className='mygames-edit-header'>
              {/* Title */}
              <Title />
              {/* Tabs */}
              <div className='tabs-container'>
                <div className={getTabClassName('SETTINGS')} onClick={() => handleClickTab('SETTINGS')}>
                  {t.MY_GAMES.EDIT.TABS.SETTINGS}
                </div>
                <div className={getTabClassName('ADD_WORDS')} onClick={() => handleClickTab('ADD_WORDS')}>
                  {t.MY_GAMES.EDIT.TABS.ADD_WORDS}
                </div>
                <div className={getTabClassName('EDIT_WORDS')} onClick={() => handleClickTab('EDIT_WORDS')}>
                  {t.MY_GAMES.EDIT.TABS.EDIT_WORDS}
                </div>
                <div className={getTabClassName('DELETE_GAME')} onClick={() => handleClickTab('DELETE_GAME')}>
                  {t.MY_GAMES.EDIT.TABS.DELETE_GAME}
                </div>
              </div>
            </div>
            {/* Main */}
            <Main />
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesEdit
