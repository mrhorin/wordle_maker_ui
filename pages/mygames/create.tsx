import type { UserInfo, Token } from '../../types/global'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useContext } from 'react'
import nookies from 'nookies'
import Head from 'next/head'

import Sidemenu from '../../components/sidemenu'

import validate from '../../validate'

import CurrentTokenContext from '../../contexts/current_token'
import CurrentUserInfoContext from '../../contexts/current_user_info'

type Props = {
  token: Token,
  userInfo: UserInfo,
}

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

const MygamesCreate = (props: Props) => {
  const [inputTitle, setInputTitle] = useState<string>('')
  const [inputDesc, setInputDesc] = useState<string>('')
  const [inputLanguage, setInputLanguage] = useState<string>('English')
  const [inputCharCount, setInputCharCount] = useState<string>('5')
  const currentTokenContext = useContext(CurrentTokenContext)
  const currentUserInfoContext = useContext(CurrentUserInfoContext)
  const router = useRouter()

  function validateTitle(): boolean{
    const titleLength: number = Number(inputTitle.length)
    const titleInvalidFeedback: HTMLElement | null = document.querySelector('#create-game-title-invalid-feedback')
    if (titleLength < 1) {
      document.querySelector('#create-game-title')?.classList.add('input-invalid')
      if (titleInvalidFeedback) titleInvalidFeedback.innerHTML = '* Title is required.'
      return false
    } else if (titleLength > 20) {
      document.querySelector('#create-game-title')?.classList.add('input-invalid')
      if (titleInvalidFeedback?.innerHTML) titleInvalidFeedback.innerHTML = '* Title must be 20 characters or less.'
      return false
    } else {
      document.querySelector('#create-game-title')?.classList.remove('input-invalid')
      if (titleInvalidFeedback?.innerHTML) titleInvalidFeedback.innerHTML = ''
      return true
    }
  }

  function handleClickSubmit(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      if (validateTitle()) {
        const languageElement: HTMLSelectElement = document.querySelector('#create-game-language') as HTMLSelectElement
        const body = {
          game: {
            'title': inputTitle,
            'desc': inputDesc,
            'char_count': inputCharCount,
            'language': languageElement.value
          }
        }
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
          .then(json => console.log(json))
          .catch(error => console.log(error))
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

  return (
    <main id='main'>
      <Head>
        <title>My Games | WORDLE MAKER APP</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='container'>
        <div id='sidemenu-container'>
          <Sidemenu activeMenu={'create' }/>

          <div id='sidemenu-main'>
            <h1 className='title'>Create a game</h1>
            <form id='create-game-form' onSubmit={e => e.preventDefault()}>
              {/* Title */}
              <div className='form-group'>
                <label>Title</label>
                <input type='text' id='create-game-title' className='' maxLength={20} value={inputTitle} onChange={e => setInputTitle(e.target.value)} />
                <div id='create-game-title-invalid-feedback' className='form-group-invalid-feedback'></div>
              </div>
              {/* Description */}
              <div className='form-group'>
                <label>Description</label>
                <textarea id='create-game-desc' rows={3} className='' maxLength={100} value={inputDesc} onChange={e => setInputDesc(e.target.value)} />
                <div id='create-game-title-invalid-feedback' className='form-group-invalid-feedback'></div>
              </div>
              {/* Languagte */}
              <div className='form-group'>
                <label>Language</label>
                <select id='create-game-language' value={inputLanguage} onChange={e => setInputLanguage(e.target.value)}>
                  <option value='en'>English</option>
                  <option value='ja'>Japanese</option>
                </select>
              </div>
              {/* Character count */}
              <div className='form-group'>
                <label>Character count</label>
                <select id='create-game-charcount' value={inputCharCount} onChange={e => setInputCharCount(e.target.value)}>
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
              <button type='button' id='create-game-submit' className='btn btn-defalt' onClick={handleClickSubmit}>Submit</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesCreate
