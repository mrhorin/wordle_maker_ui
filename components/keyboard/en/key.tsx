import { memo } from 'react'
import type { TileStatus, KeyType } from 'types/global'

interface Props {
  letter: string
  type: KeyType
  status: TileStatus
  handleOnClick(key: string): void
  style?: { [key: string]: string }
  addnlClassNames?: string,
  children?: JSX.Element
}

const Key = ({ letter, type, status, handleOnClick, style, addnlClassNames, children }: Props) => {
  let classes = type == 'CHARACTER' ? 'keyboard-key-character' : 'keyboard-key-modifier'
  if (status == 'CORRECT' && type != 'MODIFIER') classes += ' keyboard-key-correct'
  if (status == 'PRESENT' && type != 'MODIFIER') classes += ' keyboard-key-present'
  if (status == 'ABSENT' && type != 'MODIFIER') classes += ' keyboard-key-absent'
  if (addnlClassNames) classes += ` ${addnlClassNames}`
  const print: string | JSX.Element = children ? children : letter

  return (
    <div className={classes} style={style} onClick={() => handleOnClick(letter)}>
      {print}
    </div>
  )
}

export default memo(Key, (prevProps, nextProps) => {
  return prevProps.status == nextProps.status && prevProps.handleOnClick == nextProps.handleOnClick
})
