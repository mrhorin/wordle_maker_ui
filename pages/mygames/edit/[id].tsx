import type { UserInfo, Token, Game } from 'types/global'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useContext, useMemo } from 'react'
import { useAlert } from 'react-alert'
import nprogress from 'nprogress'

import Head from 'next/head'
import nookies from 'nookies'

import Sidemenu from 'components/sidemenu'
import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'
import Summary from 'components/mygames/edit/summary'
import AddWords from 'components/mygames/edit/add_words'
import EditWords from 'components/mygames/edit/edit_words'

import CurrentTokenContext from 'contexts/current_token'
import CurrentUserInfoContext from 'contexts/current_user_info'

import validate from 'scripts/validate'

const tabs: string[] = ['Summary', 'Add Words', 'Edit Words','Delete Game']

type Props = { token: Token, userInfo: UserInfo, game: Game }

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = nookies.get(context)
  // Token
  const token: Token = {
    accessToken: cookies['accessToken'],
    client: cookies['client'],
    uid: cookies['uid'],
    expiry: cookies['expiry'],
  }
  // UserInfo
  const userInfo: UserInfo = {
    provider: cookies['provider'],
    name: cookies['name'],
    nickname: cookies['nickname'],
    uid: cookies['uid'],
    image: cookies['image'],
  }
  // Game
  let game: Game | null = null
  const gameId: string = context.query.id as string
  const res = await fetch(`http://api:3000/api/v1/games/${gameId}`)
  if (res.status == 200) {
    const json = await res.json()
    if (json.ok) game = json.data as Game
  }
  // Redirect to / if Game doesn't exist or an user doesn't sign in
  if (validate.token(token) && validate.userInfo(userInfo) && game) {
    return { props: { token: token, userInfo: userInfo, game: game } }
  } else {
    return {
      props: { token: token, userInfo: userInfo, game: game },
      redirect: {
        statusCode: 302,
        destination: '/',
      }
    }
  }
}

const MygamesEdit = (props: Props) => {
  /*
   * [Common]
   * game:
   *  This state will be changed after updating the game by fetching API. */
  const [game, setGame] = useState<Game>(props.game)
  /* currentTab:
   *  The value indicates which tab is active at the time.
   *  It depends on tabs variable, a list of tab names. */
  const [currentTab, setCurrentTab] = useState<string>('Summary')
  /* showOverLay:
   *  The flag indicates whether LoadingOverlay component is shown or not. */
  const [showOverlay, setShowOverlay] = useState<boolean>(false)
  /*
   * [Delete Game]
   * checkedConfirmation:
   *  The flag indicates whether an user agreed to delete the game or not. */
  const [checkedConfirmation, setCheckedConfirmation] = useState<boolean>(false)
  /* shoModal:
   *  The flag indicates whether a modal window to confirm deleting the game is shown or not. */
  const [showModal, setShowModal] = useState<boolean>(false)

  /********* Context *********/
  const currentTokenContext = useContext(CurrentTokenContext)
  const currentUserInfoContext = useContext(CurrentUserInfoContext)
  /*********** Memo ***********/
  const handleConfirmation = useMemo(() => {
    return () => {
      setCheckedConfirmation(!checkedConfirmation);
    }
  }, [checkedConfirmation])

  const router = useRouter()
  const alert = useAlert()

  function signOut(): void{
    currentTokenContext.setCurrentToken(null)
    currentTokenContext.destroyTokenCookies()
    currentUserInfoContext.setCurrentUserInfo(null)
    currentUserInfoContext.destroyUserInfoCookies()
    router.replace('/signup')
  }

  function createTabsComponent(): JSX.Element{
    const tabComponents = tabs.map((t, index) => {
      let style = 'tab'
      if (currentTab == t) style += ' tab-active'
      return <div className={style} onClick={() => { setCurrentTab(t) }} key={index}>{t}</div>
    })
    return (
      <div className='tabs-container'>{tabComponents}</div>
    )
  }

  function createDeleteGameComponent(): JSX.Element{
    return (
      <div className='game-edit-delete' style={{ marginTop: '1rem' }}>
        <button className='btn btn-danger' onClick={() => { setShowModal(true) }}>Delete Game</button>
      </div>
    )
  }

  function handleClickDelete(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      setShowOverlay(true)
      nprogress.start()
      fetch(`http://localhost:3000/api/v1/games/${props.game.id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          'access-token': currentTokenContext.currentToken.accessToken,
          'client': currentTokenContext.currentToken.client,
          'uid': currentTokenContext.currentToken.uid
        }
      }).then(res => res.json())
        .then(json => {
          if (json.ok) {
            alert.show('DELETED', {type: 'success'})
            router.replace('/mygames/edit')
          } else {
            alert.show('FAILED', {type: 'error'})
            console.error(json.message)
          }
        })
        .catch(error => console.log(error))
        .finally(() => {
          nprogress.done()
          setShowOverlay(false)
        })
    }
  }

  return (
    <main id='main'>
      <Head>
        <title>Edit {`${game.title}`}: WORDLE MAKER APP</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Modal */}
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className='modal-window-container'>
          <div className='modal-window-header'>
            Delete Game
          </div>
          <div className='modal-window-body'>
            <p>Are you sure?</p>
            <ol>
              <li>The game will be deleted.</li>
              <li>We can't recover it.</li>
              <li>If you send an inquiry to us about it, we can't reply to you.</li>
            </ol>
            <div>
            <input type="checkbox" id="confirmation" checked={checkedConfirmation} onChange={handleConfirmation} />
            <span style={{ fontWeight: '500' }}>I agree.</span>
          </div>
          </div>
          <div className='modal-window-footer'>
            <button className='btn btn-danger' disabled={!checkedConfirmation} onClick={handleClickDelete}>Delete</button>
            <button className='btn btn-default' onClick={()=>setShowModal(false)}>Close</button>
          </div>
        </div>
      </Modal>

      <div className='container'>
        <div id='sidemenu-container'>
          <Sidemenu activeMenu={'edit'}/>
          <div id='sidemenu-main'>
            <h1 className='title'>Edit games</h1>
            {createTabsComponent()}
            {(() => {
              if (currentTab == tabs[0]) return <Summary game={game} setGame={setGame} signOut={signOut} />
              if (currentTab == tabs[1]) return <AddWords game={game} signOut={signOut} />
              if (currentTab == tabs[2]) return <EditWords game={game} />
              if (currentTab == tabs[3]) return createDeleteGameComponent()
            })()}
            <LoadingOverlay showOverlay={showOverlay} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesEdit
