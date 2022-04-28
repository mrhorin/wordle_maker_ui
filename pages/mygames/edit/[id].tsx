import type { UserInfo, Token, Game, Tab } from 'types/global'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useContext, useEffect } from 'react'

import Head from 'next/head'

import Sidemenu from 'components/sidemenu'
import Summary from 'components/mygames/edit/summary'
import AddWords from 'components/mygames/edit/add_words'
import EditWords from 'components/mygames/edit/edit_words'
import DeleteGame from 'components/mygames/edit/delete_game'

import CurrentTokenContext from 'contexts/current_token'
import CurrentUserInfoContext from 'contexts/current_user_info'

import { ServerSideCookies, ClientSideCookies } from 'scripts/cookie'
import validate from 'scripts/validate'

const tabs: Tab[] = [
  { name: 'Summary', hash: 'summary' },
  { name: 'Add Words', hash: 'add-words' },
  { name: 'Edit Words', hash: 'edit-words' },
  { name: 'Delete Game', hash: 'delete-game' },
]

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
   *  The value indicates which tab is active.
   *  It depends on tabs variable, a list of tab names,
   *  and is initialized in useEffect. */
  const [currentHash, setCurrentHash] = useState<string>('')

  /********* Context *********/
  const currentTokenContext = useContext(CurrentTokenContext)
  const currentUserInfoContext = useContext(CurrentUserInfoContext)

  const router = useRouter()

  useEffect(() => {
    // Initialize currentHash
    if (location.hash) {
      setCurrentHash(location.hash.replace(/#/g, ''))
    } else {
      setCurrentHash(tabs[0].hash)
      router.replace(`#${tabs[0].hash}`)
    }
  }, [])

  useEffect(() => {
    // Bind hashChangeStart event
    const handleHashChangeStart = (url: string) => {
      setCurrentHash(url.split('#')[1])
    }
    router.events.on('hashChangeStart', handleHashChangeStart);
    return () => {
      router.events.off('hashChangeStart', handleHashChangeStart)
    }
  }, [router.events])

  function signOut(): void{
    currentTokenContext.setCurrentToken(null)
    ClientSideCookies.destroyTokenCookies()
    currentUserInfoContext.setCurrentUserInfo(null)
    ClientSideCookies.destroyUserInfoCookies()
    router.replace('/signup')
  }

  const tabComponents = tabs.map((t, index) => {
    return <TabComponent key={index} tab={t} isActive={currentHash == t.hash} />
  })

  return (
    <main id='main'>
      <Head>
        <title>Edit {`${game.title}`}: WORDLE MAKER APP</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='container'>
        <div id='sidemenu-container'>
          <Sidemenu activeMenu={'edit'}/>
          <div id='sidemenu-main'>
            <h1 className='title'>Edit games</h1>
            <div className='tabs-container'>
              {tabComponents}
            </div>
            {(() => {
              if (currentHash == tabs[0].hash) return <Summary game={game} setGame={setGame} signOut={signOut} />
              if (currentHash == tabs[1].hash) return <AddWords game={game} signOut={signOut} />
              if (currentHash == tabs[2].hash) return <EditWords game={game} />
              if (currentHash == tabs[3].hash) return <DeleteGame game={game} />
            })()}
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesEdit
