import type { Chip } from 'types/global'
import { useState, useLayoutEffect, useCallback, useRef } from 'react'

import ChipComponent from 'components/form/chip'

interface Props {
  chips: Chip[]
  addChips(inputList: string[]): void
  removeChip(index: number): void
  updateChip(index: number, value: string): void
  maxLength?: number
}

const ChipTextarea = ({ chips, addChips, removeChip, updateChip, maxLength }: Props) => {
  const [inputValue, setInputWord] = useState<string>('')
  const inputEle = useRef<HTMLInputElement>(null)
  const textareaEle = useRef<HTMLInputElement>(null)
  const counterEle = useRef<HTMLInputElement>(null)

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

  function focus(): void{
    if (inputEle.current) {
      textareaEle.current?.classList.add('chip-textarea-focus')
      counterEle.current?.classList.add('form-countable-input-counter-focus')
      inputEle.current.focus()
    }
  }

  function handleFocusInput(): void{
    textareaEle.current?.classList.add('chip-textarea-focus')
    counterEle.current?.classList.add('form-countable-input-counter-focus')
  }

  function handleBlurInput(): void{
    textareaEle.current?.classList.remove('chip-textarea-focus')
    counterEle.current?.classList.remove('form-countable-input-counter-focus')
  }

  function handleClickTextarea(event: any): void{
    if (event.target.className == 'chip-textarea') focus()
  }

  const handleChangeChip = useCallback((id: number, value: string) => {
    updateChip(id, value)
  }, [])

  const handleClickChipXmark = useCallback((id: number): void => {
    removeChip(id)
  }, [])

  const textareComponent = (
    <div ref={textareaEle} className='chip-textarea' onClick={(e) => { handleClickTextarea(e) }}>
      {chips.map((chip) => {
        return <ChipComponent key={chip.id} chip={chip} handleClickChipXmark={handleClickChipXmark} handleChangeChip={handleChangeChip} />
      })}
      <input ref={inputEle} className='chip-textarea-input' type='text' value={inputValue}
        onChange={e => setInputWord(e.target.value)} onFocus={handleFocusInput} onBlur={handleBlurInput} />
    </div>
  )

  if (maxLength) {
    const count = chips.map(c => c.value).join('').length
    return (
      <div className='form-countable-input-group'>
        {textareComponent}
        <div ref={counterEle} className='form-countable-input-counter'>{`${count} / ${maxLength}`}</div>
      </div>
    )
  } else {
    return textareComponent
  }
}

export default ChipTextarea
