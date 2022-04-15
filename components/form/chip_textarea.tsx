import type { Chip } from 'types/global'
import { useState, useLayoutEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

interface Props {
  chips: Chip[]
  handleSetChips(inputList: string[]): void
  handleRemoveChip(index: number): void
  handleUpdateChip(index: number, value: string): void
}

const ChipTextarea = ({ chips, handleSetChips, handleRemoveChip, handleUpdateChip }: Props) => {
  const [inputValue, setInputWord] = useState<string>('')
  const [currentEditChipIndex, setCurrentEditChipIndex] = useState<number | null>(null)
  const [currentEditChipValue, setCurrentEditChipValue] = useState<string>('')
  const chipComponents: JSX.Element[] = []

  useLayoutEffect(() => {
    if (inputValue == ',') {
      // Delete inputValue when being inputed only comma
      setInputWord('')
    } else if (/,/g.test(inputValue)) {
      // Split inputValue into an array with comma
      let inputList: string[] = inputValue.split(',')
      inputList = inputList.map((value) => {
        return value.replace(/[\r\n\s]/g, '')
      }).filter(Boolean)
      if (inputList.length > 0) {
        handleSetChips(inputList)
        setInputWord('')
      }
    }
  }, [inputValue])

  function handleBlurCurrentEditChip(event: any): void{
    if (currentEditChipIndex != null && currentEditChipValue) {
      handleUpdateChip(currentEditChipIndex, currentEditChipValue.replace(/[\r\n\s,]/g, ''))
    }
    setCurrentEditChipIndex(null)
    setCurrentEditChipValue('')
  }

  function handleChangeCurrentEditChip(event: any): void{
    setCurrentEditChipValue(event.target.value)
  }

  function handleClickChip(event: any, index: number): void{
    if (event.target.className == 'chip-textarea-chip-value') {
      setCurrentEditChipIndex(index)
      setCurrentEditChipValue(chips[index].value)
    }
  }

  function handleClickChipXmark(event: any, index: number): void{
    handleRemoveChip(index)
  }

  function handleClickTextarea(event: any): void{
    if (event.target.id == 'chip-textarea') {
      const input = document.getElementById('chip-textarea-input')
      input?.focus()
    }
  }

  for (let i = 0; i < chips.length; i++){
    let value
    if (i == currentEditChipIndex) {
      value = <input
        id='chip-textarea-current-edit-chip' className='chip-textarea-chip-value' type='text' size={currentEditChipValue.length * 2} autoFocus={true}
        value={currentEditChipValue} onChange={e => { handleChangeCurrentEditChip(e) }} onBlur={e => { handleBlurCurrentEditChip(e) }}
      />
    } else {
      value = <div className='chip-textarea-chip-value'>{chips[i].value}</div>
    }
    if (chips[i]) {
      let style = 'chip-textarea-chip'
      if (!chips[i].isValid) style += ' chip-textarea-chip-invalid'
      chipComponents.push(
        <div className={style} key={i} onClick={e => handleClickChip(e, i)}>
          {value}
          <div className='chip-textarea-chip-xmark' onClick={e => handleClickChipXmark(e, i)}>
            <FontAwesomeIcon icon={faXmark} />
          </div>
        </div>
      )
    }
  }

  return (
    <div id='chip-textarea' className='chip-textarea' onClick={(e) => { handleClickTextarea(e) }}>
      {chipComponents}
      <input id='chip-textarea-input' className='chip-textarea-input' type='text' value={inputValue} onChange={e => { setInputWord(e.target.value) }} />
    </div>
  )
}

export default ChipTextarea
