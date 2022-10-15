import type { Tile } from 'types/global'
import useGetKeyStatus from 'hooks/useGetKeyStatus'
import Key from 'components/keyboard/en/key'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBackspace } from '@fortawesome/free-solid-svg-icons'
import { faLightbulb } from '@fortawesome/free-regular-svg-icons'

interface Props{
  tilesTable: Tile[][]
  handleOnClick(key: string): void
}

const Qwerty = ({ tilesTable, handleOnClick }: Props) => {
  const getKeyStatus = useGetKeyStatus()

  const row1KeyComponents: JSX.Element[] = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((letter) => {
    const status = getKeyStatus(letter, tilesTable)
    return <Key key={letter} letter={letter} type={'CHARACTER'} status={status} handleOnClick = { handleOnClick } />
  })
  const row2KeyComponents: JSX.Element[] = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((letter) => {
    const status = getKeyStatus(letter, tilesTable)
    return <Key key={letter} letter={letter} type={'CHARACTER'} status={status} handleOnClick={handleOnClick} />
  })
  const row3KeyComponents: JSX.Element[] = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((letter) => {
    const status = getKeyStatus(letter, tilesTable)
    return <Key key={letter} letter={letter} type={'CHARACTER'} status={status} handleOnClick={handleOnClick} />
  })
  row2KeyComponents.push(
    <Key key={'Backspace'} letter={'Backspace'} type={'MODIFIER'} status={'ABSENT'} handleOnClick={handleOnClick}>
      <FontAwesomeIcon icon={faBackspace}/>
    </Key>
  )
  row3KeyComponents.push(
    <Key key={'Enter'} letter={'Enter'} type={'MODIFIER'} status={'ABSENT'} handleOnClick={handleOnClick} style={{width: '100%'}} />
  )
  row3KeyComponents.unshift(
    <Key key='Info' letter='Info' type='MODIFIER' status='ABSENT' handleOnClick={handleOnClick} addnlClassNames='keyboard-key-accent1'>
      <FontAwesomeIcon icon={faLightbulb}/>
    </Key>
  )
  return (
    <div className='keyboard-en-qwerty'>
      <div className='row row-top'>{row1KeyComponents}</div>
      <div className='row row-middle'>{row2KeyComponents}</div>
      <div className='row row-bottom'>{row3KeyComponents}</div>
    </div>
  )
}

export default Qwerty
