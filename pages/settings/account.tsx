import type { Token } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useMemo, useContext } from 'react'
import { useAlert } from 'react-alert'

import useLocale from 'hooks/useLocale'
import useSignOut from 'hooks/useSignOut'

import nprogress from 'nprogress'

import Head from 'next/head'

import SlideoutMenu from 'components/slideout_menu'
import Sidemenu from 'components/sidemenu'
import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'

import validate from 'scripts/validate'

import CurrentTokenContext from 'contexts/current_token'

const Account = () => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false)
  const currentTokenContext = useContext(CurrentTokenContext)
  const [checkedConfirmation, setCheckedConfirmation] = useState<boolean | undefined>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const handleConfirmation = useMemo(() => {
    return () => {
      setCheckedConfirmation(!checkedConfirmation);
    }
  }, [checkedConfirmation])
  const router = useRouter()
  const { t } = useLocale()
  const alert = useAlert()
  const signOut = useSignOut()

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
          signOut(() => {
            alert.show(t.ALERT.DELETED, { type: 'success' })
            router.replace('/')
          })
        } else {
          alert.show(t.ALERT.FAILED, { type: 'error' })
          console.error('Error', json)
        }
      }).catch(error => {
        console.log(error)
        setShowOverlay(false)
      }).finally(() => { nprogress.done() })
    }
  }

  return (
    <main id='main'>
      <Head>
        <title>{t.SETTINGS.ACCOUNT.TITLE} | {t.APP_NAME}</title>
        <meta name="description" content={t.APP_DESC} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Modal */}
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className='modal-window-container'>
          <div className='modal-window-header'>
            { t.SETTINGS.ACCOUNT.DELETE_ACCOUNT.MESSAGE.SURE }
          </div>
          <div className='modal-window-body'>
            <ol>
              <li>{ t.SETTINGS.ACCOUNT.DELETE_ACCOUNT.MESSAGE.WILL_BE_DELETED }</li>
              <li>{ t.SETTINGS.ACCOUNT.DELETE_ACCOUNT.MESSAGE.CANNOT_RECOVER }</li>
              <li>{ t.SETTINGS.ACCOUNT.DELETE_ACCOUNT.MESSAGE.CANNOT_REPlY }</li>
            </ol>
            <div>
            <input type="checkbox" id="confirmation" checked={checkedConfirmation} onChange={handleConfirmation} />
            <label>{ t.FORM.I_AGREE }</label>
          </div>
          </div>
          <div className='modal-window-footer'>
            <button className='btn btn-danger' onClick={handleClickDeleteAccount} disabled={!checkedConfirmation}>
              {t.SETTINGS.ACCOUNT.DELETE_ACCOUNT.BUTTON}
            </button>
            <button className='btn btn-default' onClick={() => setShowModal(false)}>{ t.COMMON.CLOSE }</button>
          </div>
        </div>
      </Modal>

      <LoadingOverlay showOverlay={showOverlay} />

      <div className='container'>
        <SlideoutMenu />
        <div id='sidemenu-container'>
          {/* Sidemenu */}
          <Sidemenu activeMenu={'account'} />

          {/* Main */}
          <div id='sidemenu-main'>
            <div className='title'>
              <div className='title-text'>{ t.SIDE_MENU.ACCOUNT }</div>
            </div>

            <div className='sp-padding'>
              <button className='btn btn-danger' onClick={() => { setShowModal(true) }}>{ t.SETTINGS.ACCOUNT.DELETE_ACCOUNT.BUTTON }</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Account
