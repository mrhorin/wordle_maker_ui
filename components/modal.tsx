import { evaluatedPropsToName } from 'ajv/dist/compile/util'
import { useState } from 'react'

interface Props {
  showModal: boolean,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
  children?: JSX.Element
}

const Modal = ({ showModal, setShowModal, children }: Props) => {

  function modalStyle(): string{
    return showModal ? '' : 'hidden'
  }

  function handleClickOverlay(): void{
    setShowModal(false)
  }

  return (
    <div className='modal'>
      <div className={`modal-overlay ${modalStyle()}`} onClick={handleClickOverlay}></div>
      <div className={`modal-window ${modalStyle()}`}>
        {children}
      </div>
    </div>
  )
}

export default Modal
