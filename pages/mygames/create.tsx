import type { UserInfo, Token, Game } from 'types/global'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useContext } from 'react'
import { useAlert } from 'react-alert'
import nookies from 'nookies'
import Head from 'next/head'

import Sidemenu from 'components/sidemenu'
import LoadingOverlay from 'components/loading_overlay'

import validate from 'scripts/validate'

import CurrentTokenContext from 'contexts/current_token'
import CurrentUserInfoContext from 'contexts/current_user_info'

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

const defaultGame: Game = {
  title: '',
  desc: '',
  lang: 'en',
  char_count: 5,
}

const MygamesCreate = (props: Props) => {
  const [game, setGame] = useState<Game>(defaultGame)
  const [showOverlay, setShowOverlay] = useState<boolean>(false)
  const currentTokenContext = useContext(CurrentTokenContext)
  const currentUserInfoContext = useContext(CurrentUserInfoContext)
  const router = useRouter()
  const alert = useAlert()

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

  function handleClickSubmit(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      if (validateTitle()) {
        const langElement: HTMLSelectElement = document.querySelector('#game-lang') as HTMLSelectElement
        const body = {
          game: {
            'title': game.title,
            'desc': game.desc,
            'char_count': game.char_count,
            'lang': langElement.value
          }
        }
        setShowOverlay(true)
        fetch('http://localhost:3000/api/v1/games/create', {
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
              alert.show('CREATED', {type: 'success'})
              router.replace(`/games/${json.data.id}`)
            } else {
              alert.show('FAILED', {type: 'error'})
              console.error(json)
            }
          })
          .catch(error => { setShowOverlay(false) })
      }
    } else {
      // Delete stored token and user info
      currentTokenContext.setCurrentToken(null)
      currentTokenContext.destroyTokenCookies()
      currentUserInfoContext.setCurrentUserInfo(null)
      currentUserInfoContext.destroyUserInfoCookies()
      router.replace('/signup')
    }
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
    setGame(nextGame)
  }

  return (
    <main id='main'>
      <Head>
        <title>My Games | WORDLE MAKER APP</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='container'>
        <div id='sidemenu-container'>
          {/* Sidemenu */}
          <Sidemenu activeMenu={'create' }/>
          {/* Main */}
          <div id='sidemenu-main'>
            <h1 className='title'>Create a game</h1>
            {/* Game Form */}
            <form id='game-form' onSubmit={e => e.preventDefault()}>
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
              {/* Language */}
              <div className='form-group'>
                <label>Language</label>
                <select id='game-lang' value={game.lang} onChange={e => handleChangeGameForm(e)}>
                  <option value='en'>English</option>
                  <option value='ja'>Japanese</option>
                </select>
              </div>
              {/* Character count */}
              <div className='form-group'>
                <label>Character count</label>
                <select id='game-charcount' value={game.char_count} onChange={e => handleChangeGameForm(e)}>
                  <option value='2'>2</option>
                  <option value='3'>3</option>
                  <option value='4'>4</option>
                  <option value='5'>5</option>
                  <option value='6'>6</option>
                  <option value='7'>7</option>
                  <option value='8'>8</option>
                  <option value='9'>9</option>
                  <option value='10'>10</option>
                </select>
              </div>
              {/* Submit */}
              <button type='button' id='game-submit' className='btn btn-defalt' onClick={handleClickSubmit}>Submit</button>
            </form>
            <LoadingOverlay showOverlay={showOverlay} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesCreate
