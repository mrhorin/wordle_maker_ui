import type { Game } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useContext, useMemo } from 'react'
import nprogress from 'nprogress'
import { useAlert } from 'react-alert'

import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'

import CurrentTokenContext from 'contexts/current_token'

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

  /********* Context *********/
  const currentTokenContext = useContext(CurrentTokenContext)
  /*********** Memo ***********/
  const handleConfirmation = useMemo(() => {
    return () => {
      setCheckedConfirmation(!checkedConfirmation);
    }
  }, [checkedConfirmation])

  const router = useRouter()
  const alert = useAlert()

  function handleClickDelete(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      setShowOverlay(true)
      nprogress.start()
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
        .catch(error => {
          console.log(error)
          setShowOverlay(false)
        })
        .finally(() => { nprogress.done() })
    }
  }

  return (
    <div className='game-edit-delete' style={{ marginTop: '1rem' }}>
      <button className='btn btn-danger' onClick={() => { setShowModal(true) }}>Delete Game</button>

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
            <input type="checkbox" id="confirmation" checked={checkedConfirmation} onChange={handleConfirmation} />
            <span style={{ fontWeight: '500' }}>I agree.</span>
          </div>
          <div className='modal-window-footer'>
            <button className='btn btn-danger' disabled={!checkedConfirmation} onClick={handleClickDelete}>Delete</button>
            <button className='btn btn-default' onClick={()=>setShowModal(false)}>Close</button>
          </div>
        </div>
      </Modal>
      {/* LoadingOverlay */}
      <LoadingOverlay showOverlay={showOverlay} />
    </div>
  )
}

export default DeleteGame