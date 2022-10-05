import type { Game, Tab } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import useHash from 'hooks/useHash'
import nprogress from 'nprogress'

import Head from 'next/head'
import Link from 'next/link'
import ReactLoading from 'react-loading'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft} from '@fortawesome/free-solid-svg-icons'

import SlideoutMenu from 'components/slideout_menu'
import Sidemenu from 'components/sidemenu'
import Summary from 'components/mygames/edit/summary'
import AddWords from 'components/mygames/edit/add_words'
import EditWords from 'components/mygames/edit/edit_words'
import Settings from 'components/mygames/edit/settings'

import useLocale from 'hooks/useLocale'

import { getGame } from 'scripts/api'

type TabComponentProps = {
  tab: Tab,
  isActive: boolean,
}

const TabComponent = (props: TabComponentProps) => {
  const router = useRouter()

  function handleClickTab(): void{
    router.push(`#${props.tab.hash}`)
  }

  let style = 'tab'
  if (props.isActive) style += ' tab-active'
  return (
    <div className={style} onClick={handleClickTab}>
      { props.tab.name }
    </div>
  )
}

const MygamesEdit = () => {
  /*
   * game:
   *  This state will be changed after updating the game by fetching API. */
  const [game, setGame] = useState<Game | null>(null)
  /* currentHash:
   *  This value indicates which tab is active.
   *  It depends on tabs variable, a list of tab names,
   *  and is initialized in useEffect. */
  const [currentHash, setCurrentHash] = useHash()
  const { t } = useLocale()
  const router = useRouter()
  const { id } = router.query

  const tabs: Tab[] = [
    { name: t.MY_GAMES.EDIT.TABS.SUMMARY, hash: 'summary' },
    { name: t.MY_GAMES.EDIT.TABS.ADD_WORDS, hash: 'add-words' },
    { name: t.MY_GAMES.EDIT.TABS.EDIT_WORDS, hash: 'edit-words' },
    { name: t.MY_GAMES.EDIT.TABS.DELETE_GAME, hash: 'settings' },
  ]

  useEffect(() => {
    // Initialize currentHash
    if (location.hash) {
      setCurrentHash(location.hash.replace(/#/g, ''))
    } else {
      setCurrentHash(tabs[0].hash)
      router.replace(`#${tabs[0].hash}`)
    }
    if (game == null && id) {
      nprogress.start()
      getGame(Number(id)).then(json => {
        if (json.ok) setGame(json.data)
      }).catch(error => {
        console.log(error)
      }).finally(
        () => nprogress.done()
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function createTabComponent(): JSX.Element{
    if (game) {
      return (
        <>
          <div className='mygames-edit-header'>
            <div className='title'>
              <div className='title-button'>
                <Link href="/mygames/edit"><a><FontAwesomeIcon icon={faArrowLeft} /></a></Link>
              </div>
              <div className='title-text'>{game.title}</div>
            </div>
            <div className='tabs-container'>{tabComponents}</div>
          </div>

          {(() => {
            if (currentHash == tabs[0].hash) return <Summary game={game} setGame={setGame}/>
            if (currentHash == tabs[1].hash) return <AddWords game={game}/>
            if (currentHash == tabs[2].hash) return <EditWords game={game} />
            if (currentHash == tabs[3].hash) return <Settings game={game} />
          })()}
        </>
      )
    } else {
      return (
        <div className='mygames-edit-header'>
          <div className='title'>
            <div className='title-button'>
              <Link href="/mygames/edit"><a><FontAwesomeIcon icon={faArrowLeft} /></a></Link>
            </div>
            <div className='title-text'>
              <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
            </div>
          </div>
          <div className='tabs-container'>{tabComponents}</div>
          <div style={{ marginTop: '2rem' }}>
            <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
          </div>
        </div>
      )
    }
  }

  const tabComponents = tabs.map((t, index) => {
    return <TabComponent key={index} tab={t} isActive={currentHash == t.hash} />
  })

  return (
    <main id='main'>
      <Head>
        <title>{t.MY_GAMES.EDIT.TITLE} | {t.APP_NAME}</title>
        <meta name="description" content={t.APP_DESC.FIRST_LINE + t.APP_DESC.SECOND_LINE} />
        <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SlideoutMenu />

      <div className='container'>
        <div id='sidemenu-container'>
          <Sidemenu activeMenu={'edit'}/>
          <div id='sidemenu-main' className='mygames-edit'>
            {createTabComponent()}
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesEdit
