import type { Game, Token } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useMemo } from 'react'
import { ToastContainer } from 'react-toastify'

import useLocale from 'hooks/useLocale'
import useSignOut from 'hooks/useSignOut'
import useToastify from 'hooks/useToastify'

import nprogress from 'nprogress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'
import Checkbox from 'components/form/checkbox'

import cookie from 'scripts/cookie'
import { deleteGame } from 'scripts/api'
import validate from 'scripts/validate'

interface Props {
  game: Game
}

const DeleteGame = ({ game }: Props) => {
  /*
   * checkedConfirmation:
   *  The flag indicates whether an user agreed to delete the game or not. */
  const [checkedConfirmation, setCheckedConfirmation] = useState<boolean>(false)
  /* shoModal:
   *  The flag indicates whether a modal window to confirm deleting the game is shown or not. */
  const [showModal, setShowModal] = useState<boolean>(false)
  /* showOverLay:
   *  The flag indicates whether LoadingOverlay component is shown or not. */
  const [showOverlay, setShowOverlay] = useState<boolean>(false)

  const router = useRouter()
  const { t } = useLocale()
  const signOut = useSignOut()
  const toastify = useToastify()

  /*********** Memo ***********/
  const handleClickConfirmation = useMemo(() => {
    return () => {
      setCheckedConfirmation(!checkedConfirmation);
    }
  }, [checkedConfirmation])

  function handleClickDelete(): void{
    const token: Token | null = cookie.client.loadToken()
    if (validate.token(token)) {
      setShowOverlay(true)
      nprogress.start()
      deleteGame(token, game).then(json => {
        if (json.ok) {
          toastify.alertSuccess(t.ALERT.DELETED)
          router.replace('/mygames/edit')
        } else {
          toastify.alertError(t.ALERT.FAILED)
          console.error(json.message)
        }
      })
      .catch(error => {
        console.log(error)
        setShowOverlay(false)
      })
      .finally(() => { nprogress.done() })
    } else {
      signOut(() => router.replace('/signin'))
    }
  }

  return (
    <div className='sp-padding'>
      <button className='btn btn-danger' onClick={() => { setShowModal(true) }}>{ t.MY_GAMES.EDIT.DELETE_GAME.BUTTON }</button>

      {/* Modal */}
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className='modal-window-container'>
          <div className='modal-window-header'>
            { t.MY_GAMES.EDIT.DELETE_GAME.MESSAGE.SURE }
            <FontAwesomeIcon icon={faXmark} className='modal-window-header-xmark' onClick={() => setShowModal(false)} />
          </div>
          <div className='modal-window-body'>
            <ol>
              <li>{ t.MY_GAMES.EDIT.DELETE_GAME.MESSAGE.WILL_BE_DELETED }</li>
              <li>{ t.MY_GAMES.EDIT.DELETE_GAME.MESSAGE.CANNOT_RECOVER }</li>
              <li>{ t.MY_GAMES.EDIT.DELETE_GAME.MESSAGE.CANNOT_REPlY }</li>
            </ol>
            {/* agreement */}
            <Checkbox checked={checkedConfirmation} handleClick={handleClickConfirmation} text={t.FORM.I_AGREE} />
          </div>
          <div className='modal-window-footer'>
            <button className='btn btn-default' onClick={() => setShowModal(false)}>{ t.COMMON.CLOSE }</button>
            <button className='btn btn-danger' disabled={!checkedConfirmation} onClick={handleClickDelete}>
              {t.MY_GAMES.EDIT.DELETE_GAME.BUTTON}
            </button>
          </div>
        </div>
      </Modal>
      {/* LoadingOverlay */}
      <LoadingOverlay showOverlay={showOverlay} />
      <ToastContainer />
    </div>
  )
}

export default DeleteGame