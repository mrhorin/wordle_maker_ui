import type { UserInfo, Token, Lang } from '../../types/global'
import { useState, useLayoutEffect, useEffect, useContext } from 'react'
import { GetServerSideProps } from 'next'
import nookies from 'nookies'
import Head from 'next/head'

import MygamesSidebar from '../../components/mygames_sidebar'

import validate from '../../validate'

import CurrentTokenContext from '../../contexts/current_token'

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
        destination: 'signup',
      }
    }
  }
}

const MygamesCreate = (props: Props) => {
  const [inputTitle, setInputTitle] = useState<string>('Pokemon Gen 2')
  const [inputCharCount, setInputCharCount] = useState<string>('5')
  const currentTokenContext = useContext(CurrentTokenContext)
  const langs: Lang[] = [{ code: 'en', name:'English' }, {code: 'ja', name: 'Japanese'}]

  function optionLanguageComponent(): JSX.Element {
    let options = langs.map((lang, index) => {
      return <option value={lang["code"]} key={index}>{ lang["name"] }</option>
    })
    return (
      <select id='create-game-language'>{ options }</select>
    )
  }

  function handleSubmmit(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      const titleElement: HTMLInputElement = document.querySelector('#create-game-title') as HTMLInputElement
      const charCountElement: HTMLInputElement = document.querySelector('#create-game-char-count') as HTMLInputElement
      const languageElement: HTMLSelectElement = document.querySelector('#create-game-language') as HTMLSelectElement
      const body = {
        game: {
          'title': titleElement.value,
          'char_count': charCountElement.value,
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
  }

  return (
    <main id='main'>
      <Head>
        <title>My Games | WORDLE MAKER APP</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='container'>
        <div id='sidebar-container'>
          <MygamesSidebar activeMenu={'create' }/>

          <div id='sidebar-main'>
            <h1 className='title'>Create a game</h1>
            <form id='create-game-form'>
              <div className='form-group'>
                <label>Title</label>
                <input type='text' id='create-game-title' maxLength={20} value={inputTitle} onChange={(e) => setInputTitle(e.target.value)} />
              </div>
              <div className='form-group'>
                <label>Language</label>
                { optionLanguageComponent() }
              </div>
              <div className='form-group'>
                <label>Character count</label>
                <input type='text' id='create-game-char-count' maxLength={2} value={inputCharCount} onChange={(e) => setInputCharCount(e.target.value)} />
              </div>
              <button type='button' id='create-game-submmit' className='btn btn-defalt' onClick={handleSubmmit}>Submmit</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesCreate
