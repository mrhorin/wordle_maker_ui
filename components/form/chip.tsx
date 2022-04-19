import type { Chip } from 'types/global'
import { useState, memo } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

interface Props {
  id: number
  chip: Chip
  handleClickChipXmark(id: number): void
  handleChangeChip(id: number, value: string): void
}

const Chip = ({ chip, id, handleClickChipXmark, handleChangeChip }: Props) => {
  const [currentEditChipValue, setCurrentEditChipValue] = useState<string>(chip.value)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const handleClickChip = (event: any): void => {
    if (/^chip-textarea-chip-value/.test(event.target.className)) {
      setCurrentEditChipValue(chip.value)
      setIsEditing(true)
    }
  }

  const handleKeyDownCurrentEditChip = (event: any): void => {
    if (event.keyCode == 13) {
      // When inputted Enter
      if (currentEditChipValue) {
        handleChangeChip(id, currentEditChipValue)
      } else {
        setCurrentEditChipValue(chip.value)
      }
      setIsEditing(false)
    }
  }

  const handleBlurCurrentEditChip = (): void => {
    if (currentEditChipValue) {
      handleChangeChip(id, currentEditChipValue)
    } else {
      setCurrentEditChipValue(chip.value)
    }
    setIsEditing(false)
  }

  let style = 'chip-textarea-chip'
  if (!chip.isValid) style += ' chip-textarea-chip-invalid'
  let value
  if (isEditing) {
    value = <input
      id='chip-textarea-current-edit-chip' className='chip-textarea-chip-value' type='text'
      size={currentEditChipValue.length * 2} autoFocus={true} value={currentEditChipValue}
      onChange={e => setCurrentEditChipValue(e.target.value)} onKeyDown={e => handleKeyDownCurrentEditChip(e)} onBlur={handleBlurCurrentEditChip}
    />
  } else {
    value = <div className='chip-textarea-chip-value'>{chip.value}</div>
  }

  return (
    <div className={style} onClick={e => handleClickChip(e)}>
      {value}
      <div className='chip-textarea-chip-xmark' onClick={e => handleClickChipXmark(id)}>
        <FontAwesomeIcon icon={faXmark} />
      </div>
    </div>
  )
}

export default memo(Chip)
