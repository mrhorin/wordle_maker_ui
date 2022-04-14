import type { UserInfo, Token, Game } from 'types/global'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useLayoutEffect, useContext, useMemo } from 'react'
import { useAlert } from 'react-alert'
import ReactLoading from 'react-loading'
import Link from 'next/link'
import Head from 'next/head'
import nookies from 'nookies'

import Sidemenu from 'components/sidemenu'
import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'
import ChipTextarea from 'components/form/chip_textarea'

import CurrentTokenContext from 'contexts/current_token'
import CurrentUserInfoContext from 'contexts/current_user_info'

import validate from 'scripts/validate'
import Language from 'scripts/language'

const defaultGame: Game = { id: '', title: '', desc: '', lang: 'en', char_count: 5, }

type Props = { token: Token, userInfo: UserInfo }

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = nookies.get(context)
  const token: Token = {
    accessToken: cookies['accessToken'],
    client: cookies['client'],
    uid: cookies['uid'],
    expiry: cookies['expiry'],
  }
  const userInfo: UserInfo = {
    provider: cookies['provider'],
    name: cookies['name'],
    nickname: cookies['nickname'],
    uid: cookies['uid'],
    image: cookies['image'],
  }
  const props: Props = {
    token: token,
    userInfo: userInfo
  }

  if (validate.token(props.token) && validate.userInfo(props.userInfo)) {
    return { props: props }
  } else {
    return {
      props: props,
      redirect: {
        statusCode: 302,
        destination: '/signup',
      }
    }
  }
}

const MygamesEdit = (props: Props) => {
  const [game, setGame] = useState<Game>(defaultGame)
  const [words, setWords] = useState<string[]>([])
  const [isChanged, setIsChanged] = useState<boolean>(false)
  const [currentTab, setCurrentTab] = useState<string>('Summary')
  const [checkedConfirmation, setCheckedConfirmation] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showOverlay, setShowOverlay] = useState<boolean>(false)
  const currentTokenContext = useContext(CurrentTokenContext)
  const currentUserInfoContext = useContext(CurrentUserInfoContext)
  const handleConfirmation = useMemo(() => {
    return () => {
      setCheckedConfirmation(!checkedConfirmation);
    }
  }, [checkedConfirmation])
  const router = useRouter()
  const alert = useAlert()
  const tabs = ['Summary', 'Words', 'Delete']
  const language: Language = new Language(game.lang)

  useLayoutEffect(() => {
    if (validate.token(props.token)) {
      const gameId: string = location.pathname.split('/')[3]
      fetchGame(props.token, gameId).then((json) => {
        if (json.ok) setGame(json.data)
      })
    } else {
      signOut()
    }
  }, [])

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

  function createSummaryComponent(): JSX.Element{
    return (
      <form id='game-form' onSubmit={e => e.preventDefault()}>
        {/* Gmae Link */}
        {createGameLinkComponent()}
        {/* Title */}
        <div className='form-group'>
          <label>Title</label>
          <div className='form-countable-input-group'>
            <input type='text' id='game-title' maxLength={100} value={game.title} onChange={e => handleChangeGameForm(e)} />
            <div className='form-countable-input-counter'>{`${game.title.length} / 100`}</div>
          </div>
          <div id='game-title-invalid-feedback' className='form-group-invalid-feedback'></div>
        </div>
        {/* Description */}
        <div className='form-group'>
          <label>Description</label>
          <div className='form-countable-input-group'>
            <textarea id='game-desc' rows={3} maxLength={200} value={game.desc} onChange={e => handleChangeGameForm(e)} />
            <div className='form-countable-input-counter'>{`${game.desc.length} / 200`}</div>
          </div>
          <div id='game-title-invalid-feedback' className='form-group-invalid-feedback'></div>
        </div>
        {/* Submit */}
        <button type='button' id='game-submit' className='btn btn-default' disabled={!isChanged} onClick={handleClickUpdate}>Update</button>
      </form>
    )
  }

  function createWordsComponent(): JSX.Element {
    return (
      <div className='words'>
        {createGameLinkComponent()}
        <div className='form-group'>
          <label>Words</label>
          <div className='form-countable-input-group'>
            <ChipTextarea game={game} words={words} setWords={setWords}></ChipTextarea>
            <div className='form-countable-input-counter'>{`${words.join('').length} / 5000`}</div>
          </div>
        </div>
        <button className='btn btn-default' onClick={handleClickSubmit}>Submit</button>
      </div>
    )
  }

  function createDeleteComponent(): JSX.Element{
    return (
      <div className='edit-delte' style={{ marginTop: '1rem' }}>
        {createGameLinkComponent()}
        <button className='btn btn-danger' onClick={() => { setShowModal(true) }}>Delete Game</button>
      </div>
    )
  }

  function createGameLinkComponent(): JSX.Element{
    return (
      <div className='edit-game-link' style={{margin: '2rem 0'}}>
        <div style={{ display: 'inline-block', marginRight: '0.5rem' }}>Game Link:</div>
        <Link href={`/games/${game.id}`}>
          <a className='sidemenu-item sidemenu-item-mygames-create'>
            {`http://localhost:8000/games/${game.id}`}
          </a>
        </Link>
      </div>
    )
  }

  function validateTitle(): boolean{
    const titleLength: number = Number(game.title.length)
    const titleInvalidFeedback: HTMLElement | null = document.querySelector('#game-title-invalid-feedback')
    if (titleLength < 1) {
      document.querySelector('#game-title')?.classList.add('input-invalid')
      if (titleInvalidFeedback) titleInvalidFeedback.innerHTML = '* Title is required.'
      return false
    } else if (titleLength > 100) {
      document.querySelector('#game-title')?.classList.add('input-invalid')
      if (titleInvalidFeedback?.innerHTML) titleInvalidFeedback.innerHTML = '* Title must be 100 characters or less.'
      return false
    } else {
      document.querySelector('#game-title')?.classList.remove('input-invalid')
      if (titleInvalidFeedback?.innerHTML) titleInvalidFeedback.innerHTML = ''
      return true
    }
  }

  function validateWords(): boolean{
    const language: Language = new Language(game.lang)
    let isValid: boolean = true
    for (const w of words){
      if (w.length != game.char_count || !language.validateWord(w)) {
        isValid = false
        break
      }
    }
    return isValid
  }

  function handleChangeGameForm(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void{
    const nextGame: Game = {
      title: game.title,
      desc: game.desc,
      lang: game.lang,
      char_count: game.char_count,
      id: game.id,
      user_id: game.user_id,
    }
    if (event.target.id == 'game-title') nextGame.title = event.target.value
    if (event.target.id == 'game-desc') nextGame.desc = event.target.value
    if (event.target.id == 'game-lang') nextGame.lang = event.target.value
    if (event.target.id == 'game-charcount') nextGame.char_count = Number(event.target.value)
    if (game != nextGame) {
      setGame(nextGame)
      setIsChanged(true)
    }
  }

  function handleClickUpdate(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      if (validateTitle()) {
        const body = {
          game: {
            'id': game.id,
            'title': game.title,
            'desc': game.desc,
          }
        }
        setShowOverlay(true)
        fetch(`http://localhost:3000/api/v1/games/${game.id}`, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            'access-token': currentTokenContext.currentToken.accessToken,
            'client': currentTokenContext.currentToken.client,
            'uid': currentTokenContext.currentToken.uid
          },
          body: JSON.stringify(body)
        }).then(res => res.json())
          .then(json => {
            if (json.ok) {
              alert.show('UPDATED', { type: 'success' })
              setIsChanged(false)
            } else {
              alert.show('FAILED', {type: 'error'})
            }
          })
          .catch(error => console.log(error))
          .finally(() => setShowOverlay(false))
      }
    } else {
      signOut()
    }
  }

  function handleClickSubmit(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      if (validateWords() && game.id) {
        const body = { words: words, game: { game_id: game.id } }
        fetch(`http://localhost:3000/api/v1/subjects/create`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            'access-token': currentTokenContext.currentToken.accessToken,
            'client': currentTokenContext.currentToken.client,
            'uid': currentTokenContext.currentToken.uid
          },
          body: JSON.stringify(body)
        }).then(res => res.json())
          .then(json => {
            if (json.ok) {
              setWords([])
              alert.show(language.succeedMsg, { type: 'success' })
            } else if (json.data.length > 0) {
              // json.dataをinvalid-chip
              setWords(json.data)
              alert.show(language.getInvalidMsg(game.char_count), { type: 'error' })
            } else {
              alert.show(language.failedMsg, { type: 'error' })
            }
          })
          .catch(error => console.log(error))
      } else {
        alert.show(language.getInvalidMsg(game.char_count), { type: 'error' })
      }
    } else {
      signOut()
    }
  }

  function handleClickDelete(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      if (validateTitle()) {
        setShowOverlay(true)
        fetch(`http://localhost:3000/api/v1/games/${game.id}`, {
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
          .catch(error => { setShowOverlay(false) })
      }
    }
  }

  async function fetchGame(token: Token, gameId: string) {
    const res = await fetch(`http://localhost:3000/api/v1/games/${gameId}`, {
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
            <label>I agree.</label>
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
              if (game && game.id) {
                if (currentTab == tabs[0]) return createSummaryComponent()
                if (currentTab == tabs[1]) return createWordsComponent()
                if (currentTab == tabs[2]) return createDeleteComponent()
              } else {
                return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
              }
            })()}
            <LoadingOverlay showOverlay={showOverlay} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesEdit
