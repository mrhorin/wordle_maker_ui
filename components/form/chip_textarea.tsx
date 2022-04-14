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
    if (currentEditChipIndex && currentEditChipValue) {
      handleUpdateChip(currentEditChipIndex, currentEditChipValue)
    }
    setCurrentEditChipIndex(null)
    setCurrentEditChipValue('')
  }

  function handleClickTextarea(event: any): void{
    if (event.target.id == 'chip-textarea') {
      const input = document.getElementById('chip-textarea-input')
      input?.focus()
    }
  }

  function handleClickChip(index: number): void{
    // handleUpdateChip(index)
    setCurrentEditChipIndex(index)
    setCurrentEditChipValue(chips[index].value)
  }

  for (let i = 0; i < chips.length; i++){
    let value = <span className='chip-textarea-chip-value'>{chips[i].value}</span>
    if (i == currentEditChipIndex) {
      value = <input
        className='chip-textarea-chip-value' type='text' size={currentEditChipValue.length * 2} autoFocus={true}
        value={currentEditChipValue} onChange={e => { setCurrentEditChipValue(e.target.value) }} onBlur={e => { handleBlurCurrentEditChip(e) }}
      />
    }
    if (chips[i]) {
      let style = 'chip-textarea-chip'
      if (!chips[i].isValid) style += ' chip-textarea-chip-invalid'
      chipComponents.push(
        <div className={style} key={i} onClick={() => { handleClickChip(i) }}>
          {value}
          <span className='chip-textarea-chip-xmark' onClick={() => { handleRemoveChip(i) }}>
            <FontAwesomeIcon icon={faXmark} />
          </span>
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
