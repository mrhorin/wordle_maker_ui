import type { UserInfo, Token, Game, Tab } from 'types/global'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import useHash from 'hooks/useHash'

import Head from 'next/head'
import Link from 'next/link'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft} from '@fortawesome/free-solid-svg-icons'

import SlideoutMenu from 'components/slideout_menu'
import Sidemenu from 'components/sidemenu'
import Summary from 'components/mygames/edit/summary'
import AddWords from 'components/mygames/edit/add_words'
import EditWords from 'components/mygames/edit/edit_words'
import Settings from 'components/mygames/edit/settings'

import useLocale from 'hooks/useLocale'

import { ServerSideCookies } from 'scripts/cookie'
import validate from 'scripts/validate'

type TabComponentProps = {
  tab: Tab,
  isActive: boolean,
}

type MygamesEditProps = {
  token: Token,
  userInfo: UserInfo,
  game: Game,
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = new ServerSideCookies(context)
  const token: Token = cookies.token
  const userInfo: UserInfo = cookies.userInfo

  let game: Game | null = null
  const gameId: string = context.query.id as string
  const res = await fetch(`http://api:3000/api/v1/games/${gameId}`)
  if (res.status == 200) {
    const json = await res.json()
    if (json.ok) game = json.data as Game
  } else if (res.status == 403 || res.status == 404) {
    return { notFound: true }
  }

  if (validate.token(token) && validate.userInfo(userInfo) && game) {
    return { props: { token: token, userInfo: userInfo, game: game } }
  } else {
    return {
      props: { token: token, userInfo: userInfo, game: game },
      redirect: { statusCode: 302, destination: '/' }
    }
  }
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

const MygamesEdit = (props: MygamesEditProps) => {
  /*
   * game:
   *  This state will be changed after updating the game by fetching API. */
  const [game, setGame] = useState<Game>(props.game)
  /* currentHash:
   *  This value indicates which tab is active.
   *  It depends on tabs variable, a list of tab names,
   *  and is initialized in useEffect. */
  const [currentHash, setCurrentHash] = useHash()
  const router = useRouter()
  const { t } = useLocale()

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tabComponents = tabs.map((t, index) => {
    return <TabComponent key={index} tab={t} isActive={currentHash == t.hash} />
  })

  return (
    <main id='main'>
      <Head>
        <title>{t.MY_GAMES.EDIT.TITLE}: {`${game.title}`} | {t.APP_NAME}</title>
        <meta name="description" content={t.APP_DESC} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SlideoutMenu />

      <div className='container'>
        <div id='sidemenu-container'>
          <Sidemenu activeMenu={'edit'}/>
          <div id='sidemenu-main' className='mygames-edit'>
            <div className='mygames-edit-header'>
              <div className='title'>
                <div className='title-button'>
                  <Link href="/mygames/edit"><a><FontAwesomeIcon icon={faArrowLeft} /></a></Link>
                </div>
                <div className='title-text'>{props.game.title}</div>
              </div>
              <div className='tabs-container'>{tabComponents}</div>
            </div>

            {(() => {
              if (currentHash == tabs[0].hash) return <Summary game={game} setGame={setGame}/>
              if (currentHash == tabs[1].hash) return <AddWords game={game}/>
              if (currentHash == tabs[2].hash) return <EditWords game={game} />
              if (currentHash == tabs[3].hash) return <Settings game={game} />
            })()}
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesEdit
