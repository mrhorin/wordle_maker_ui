import { useState, useLayoutEffect, useContext, useMemo, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

import ChipContext from 'contexts/chips'

const ChipTextarea = () => {
  const [inputValue, setInputWord] = useState<string>('')
  const [currentEditChipIndex, setCurrentEditChipIndex] = useState<number | null>(null)
  const [currentEditChipValue, setCurrentEditChipValue] = useState<string>('')
  const inputEle = useRef<HTMLInputElement>(null)
  const chipContext = useContext(ChipContext)

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
        chipContext.addChips(inputList)
        setInputWord('')
      }
    }
  }, [inputValue])

  function handleBlurCurrentEditChip(event: any): void{
    if (currentEditChipIndex != null && currentEditChipValue) {
      chipContext.updateChip(currentEditChipIndex, currentEditChipValue.replace(/[\r\n\s,]/g, ''))
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
      setCurrentEditChipValue(chipContext.chips[index].value)
    }
  }

  function handleClickChipXmark(event: any, index: number): void{
    chipContext.removeChip(index)
  }

  function handleClickTextarea(event: any): void{
    if(inputEle.current) inputEle.current.focus()
  }

  const chipComponents = useMemo(() => {
    return chipContext.chips.map((c, i) => {
      let value
      if (i == currentEditChipIndex) {
        value = <input
          id='chip-textarea-current-edit-chip' className='chip-textarea-chip-value' type='text' size={currentEditChipValue.length * 2} autoFocus={true}
          value={currentEditChipValue} onChange={e => { handleChangeCurrentEditChip(e) }} onBlur={e => { handleBlurCurrentEditChip(e) }}
        />
      } else {
        value = <div className='chip-textarea-chip-value'>{c.value}</div>
      }
      let style = 'chip-textarea-chip'
      if (!c.isValid) style += ' chip-textarea-chip-invalid'
      return (
        <div className={style} key={i} onClick={e => handleClickChip(e, i)}>
          {value}
          <div className='chip-textarea-chip-xmark' onClick={e => handleClickChipXmark(e, i)}>
            <FontAwesomeIcon icon={faXmark} />
          </div>
        </div>
      )
    })
  }, [chipContext.chips, currentEditChipIndex, currentEditChipValue])

  return (
    <div id='chip-textarea' className='chip-textarea' onClick={(e) => { handleClickTextarea(e) }}>
      {chipComponents}
      <input ref={inputEle} className='chip-textarea-input' type='text' value={inputValue} onChange={e => { setInputWord(e.target.value) }} />
    </div>
  )
}

export default ChipTextarea
