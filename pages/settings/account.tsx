import type { UserInfo, Token } from '../../types/global'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useMemo, useContext } from 'react'
import nookies from 'nookies'
import Head from 'next/head'

import Sidemenu from '../../components/sidemenu'

import validate from '../../validate'

import CurrentTokenContext from '../../contexts/current_token'
import CurrentUserInfoContext from '../../contexts/current_user_info'

type Props = {
  token: Token,
  userInfo: UserInfo
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

const Account = (props: Props) => {
  const currentTokenContext = useContext(CurrentTokenContext)
  const currentUserInfoContext = useContext(CurrentUserInfoContext)
  const [checkedConfirmation, setCheckedConfirmation] = useState<boolean | undefined>(false)
  const handleConfirmation = useMemo(() => {
    return () => {
      setCheckedConfirmation(!checkedConfirmation);
    }
  }, [checkedConfirmation])
  const router = useRouter()

  function showModal(): void{
    let modalOverlay = document.querySelector('.modal-overlay')
    let modalWindow = document.querySelector('.modal-window')
    modalOverlay?.classList.remove('hidden')
    modalWindow?.classList.remove('hidden')
  }

  function hideModal(): void{
    let modalOverlay = document.querySelector('.modal-overlay')
    let modalWindow = document.querySelector('.modal-window')
    modalOverlay?.classList.add('hidden')
    modalWindow?.classList.add('hidden')
  }

  async function fetchDeleteAccount(token: Token) {
    const res = await fetch('http://localhost:3000/api/v1/auth/', {
      method: 'DELETE',
      headers: {
        'access-token': token.accessToken,
        'client': token.client,
        'uid': token.uid
      }
    })
    return await res.json()
  }

  function handleDeleteAccount(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      fetchDeleteAccount(currentTokenContext.currentToken).then(json => {
        console.log(json)
        if (json.status == 'success') {
          currentTokenContext.setCurrentToken(null)
          currentTokenContext.destroyTokenCookies()
          currentUserInfoContext.setCurrentUserInfo(null)
          currentUserInfoContext.destroyUserInfoCookies()
          router.replace('/')
        } else {
          console.error('Error', json)
        }
      }).catch(error => {
        console.error(error)
      })
    }
  }

  return (
    <main id='main'>
      <Head>
        <title>Account | WORDLE MAKER APP</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Modal */}
      <div className='modal-overlay hidden' onClick={hideModal}>
      </div>
      <div className='modal-window hidden'>
        <div className='modal-window-header'>
          Delete Account
        </div>
        <div className='modal-window-body'>
          <p>Are you sure?</p>
          <ol>
            <li>Your account and related information will be deleted.</li>
            <li>We can't recover your account and related information you deleted.</li>
            <li>If you send an inquiry to us about it, We can't reply to you.</li>
          </ol>
          <div>
          <input type="checkbox" id="confirmation" checked={checkedConfirmation} onChange={handleConfirmation} />
          <label>I agree.</label>
        </div>
        </div>
        <div className='modal-window-footer'>
          <button className='btn btn-danger' onClick={handleDeleteAccount} disabled={!checkedConfirmation}>Delete Account</button>
          <button className='btn btn-default' onClick={hideModal}>Close</button>
        </div>
      </div>

      <div className='container'>
        <div id='sidemenu-container'>
          {/* Sidemenu */}
          <Sidemenu activeMenu={'account'} />

          {/* Main */}
          <div id='sidemenu-main'>
            <h1 className='title'>Account</h1>
            <button className='btn btn-danger' onClick={showModal}>Delete Account</button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Account
