import type { Game } from 'types/global'
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

import { getGame } from 'scripts/api'

type TabStatus = 'SETTINGS' | 'ADD_WORDS' | 'EDIT_WORDS' | 'DELETE_GAME'

const MygamesEdit = () => {
  /*
   * game:
   *  This state will be changed after updating the game by fetching API. */
  const [game, setGame] = useState<Game | null>(null)
  const [tabStatus, setTabStatus] = useState<TabStatus>('SETTINGS')
  const { t } = useLocale()
  const router = useRouter()

  useEffect(() => {
    if (router.isReady && router.query.id) {
      if (game == null && router.query.id) {
        nprogress.start()
        getGame(Number(router.query.id)).then(json => {
          if (json.ok) setGame(json.data)
        }).catch(error => {
          console.log(error)
        }).finally(
          () => nprogress.done()
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  function getTabClassName(tab: TabStatus): string{
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

  return (
    <main id='main'>
      <Head>
        <title>{t.MY_GAMES.EDIT.TITLE} | {t.APP_NAME}</title>
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
              <div className='title'>
                <div className='title-button'>
                  <Link href="/mygames/edit"><a><FontAwesomeIcon icon={faArrowLeft} /></a></Link>
                </div>
                <div className='title-text'>
                  {(() => {
                    if (game == null) {
                      return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
                    } else {
                      return game.title
                    }
                  })()}
                </div>
              </div>
              {/* Tabs */}
              <div className='tabs-container'>
                <div className={getTabClassName('SETTINGS')} onClick={() => setTabStatus('SETTINGS')}>{t.MY_GAMES.EDIT.TABS.SETTINGS}</div>
                <div className={getTabClassName('ADD_WORDS')} onClick={() => setTabStatus('ADD_WORDS')}>{t.MY_GAMES.EDIT.TABS.ADD_WORDS}</div>
                <div className={getTabClassName('EDIT_WORDS')} onClick={() => setTabStatus('EDIT_WORDS')}>{t.MY_GAMES.EDIT.TABS.EDIT_WORDS}</div>
                <div className={getTabClassName('DELETE_GAME')} onClick={() => setTabStatus('DELETE_GAME')}>{t.MY_GAMES.EDIT.TABS.DELETE_GAME}</div>
              </div>
            </div>
            {/* Main */}
            <div className='mygames-edit-main sp-padding'>
              {(() => {
                if (game == null) {
                  return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
                } else {
                  if (tabStatus == 'SETTINGS') return <Settings game={game} setGame={setGame}/>
                  if (tabStatus == 'ADD_WORDS') return <AddWords game={game}/>
                  if (tabStatus == 'EDIT_WORDS') return <EditWords game={game} />
                  if (tabStatus == 'DELETE_GAME') return <DeleteGame game={game} />
                }
              })()}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesEdit
