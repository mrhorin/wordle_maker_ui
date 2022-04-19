import type { Chip } from 'types/global'
import { useState, useLayoutEffect, useContext, useMemo, useCallback, useRef } from 'react'

import ChipComponent from 'components/form/chip'

interface Props {
  chips: Chip[]
  addChips(inputList: string[]): void
  removeChip(index: number): void
  updateChip(index: number, value: string): void
}

const ChipTextarea = ({ chips, addChips, removeChip, updateChip }: Props) => {
  const [inputValue, setInputWord] = useState<string>('')
  const inputEle = useRef<HTMLInputElement>(null)

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
        addChips(inputList)
        setInputWord('')
      }
    }
  }, [inputValue])

  function handleClickTextarea(event: any): void{
    if(inputEle.current && event.target.className == 'chip-textarea') inputEle.current.focus()
  }

  const handleChangeChip = useCallback((id: number, value: string) => {
    updateChip(id, value)
  }, [])

  const handleClickChipXmark = useCallback((id: number): void => {
    removeChip(id)
  }, [])

  return (
    <div id='chip-textarea' className='chip-textarea' onClick={(e) => { handleClickTextarea(e) }}>
      {chips.map((chip, index) => {
        return <ChipComponent key={index} id={index} chip={chip} handleClickChipXmark={handleClickChipXmark} handleChangeChip={handleChangeChip} />
      })}
      <input ref={inputEle} className='chip-textarea-input' type='text' value={inputValue} onChange={e => setInputWord(e.target.value)} />
    </div>
  )
}

export default ChipTextarea
