import type { UserInfo, Token } from 'types/global'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useMemo, useContext } from 'react'
import { useAlert } from 'react-alert'
import nprogress from 'nprogress'

import Head from 'next/head'

import Sidemenu from 'components/sidemenu'
import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'

import { ServerSideCookies } from 'scripts/cookie'
import validate from 'scripts/validate'

import CurrentTokenContext from 'contexts/current_token'
import CurrentUserInfoContext from 'contexts/current_user_info'

type Props = {
  token: Token,
  userInfo: UserInfo,
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = new ServerSideCookies(context)
  const props: Props = { token: cookies.token, userInfo: cookies.userInfo }

  if (validate.token(props.token) && validate.userInfo(props.userInfo)) {
    return { props: props }
  } else {
    return {
      props: props,
      redirect: { statusCode: 302, destination: '/signup' }
    }
  }
}

const Account = (props: Props) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false)
  const currentTokenContext = useContext(CurrentTokenContext)
  const currentUserInfoContext = useContext(CurrentUserInfoContext)
  const [checkedConfirmation, setCheckedConfirmation] = useState<boolean | undefined>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const handleConfirmation = useMemo(() => {
    return () => {
      setCheckedConfirmation(!checkedConfirmation);
    }
  }, [checkedConfirmation])
  const router = useRouter()
  const alert = useAlert()

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

  function handleClickDeleteAccount(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      setShowOverlay(true)
      nprogress.start()
      fetchDeleteAccount(currentTokenContext.currentToken).then(json => {
        if (json.status == 'success') {
          currentTokenContext.setCurrentToken(null)
          currentTokenContext.destroyTokenCookies()
          currentUserInfoContext.setCurrentUserInfo(null)
          currentUserInfoContext.destroyUserInfoCookies()
          alert.show('DELETED', {type: 'success'})
          router.replace('/')
        } else {
          alert.show('FAILED', {type: 'error'})
          console.error('Error', json)
        }
      }).catch(error => {
        console.error(error)
      }).finally(() => {
        nprogress.done()
        setShowOverlay(false)
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
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className='modal-window-container'>
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
            <button className='btn btn-danger' onClick={handleClickDeleteAccount} disabled={!checkedConfirmation}>Delete Account</button>
            <button className='btn btn-default' onClick={()=>setShowModal(false)}>Close</button>
          </div>
        </div>
      </Modal>

      <LoadingOverlay showOverlay={showOverlay} />

      <div className='container'>
        <div id='sidemenu-container'>
          {/* Sidemenu */}
          <Sidemenu activeMenu={'account'} />

          {/* Main */}
          <div id='sidemenu-main'>
            <h1 className='title'>Account</h1>
            <button className='btn btn-danger' onClick={() => { setShowModal(true) }}>Delete Account</button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Account
