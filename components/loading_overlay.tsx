import { useState, useLayoutEffect } from 'react'
import ReactLoading from 'react-loading'

interface Props {
  showOverlay: boolean
}

const LoadingOverlay = ({ showOverlay }: Props) => {
  const [style, setStyle] = useState<string>('loading-overlay hidden')

  useLayoutEffect(() => {
    if (showOverlay) {
      setStyle('loading-overlay')
    } else {
      setStyle('loading-overlay hidden')
    }
  }, [showOverlay])

  function loadingOverlayStyle(): string{
    return showOverlay ? '' : 'hidden'
  }

  return (
    <div className={style}>
      <ReactLoading type={'spin'} color={'#008eff'} height={'30px'} width={'30px'} className='loading-overlay-spin-center' />
    </div>
  )
}

export default LoadingOverlay
