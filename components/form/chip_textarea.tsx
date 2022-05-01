import type { Chip } from 'types/global'
import { useState, useCallback, useRef, useEffect } from 'react'

import ChipComponent from 'components/form/chip'

interface Props {
  chips: Chip[]
  addChips(inputList: string[]): void
  removeChip(index: number): void
  updateChip(index: number, value: string): void
  maxLength?: number
}

const ChipTextarea = ({ chips, addChips, removeChip, updateChip, maxLength }: Props) => {
  const [inputValue, setInputValue] = useState<string>('')
  const [chipsCount, setChipsCount] = useState<number>(0)
  const inputEle = useRef<HTMLInputElement>(null)
  const textareaEle = useRef<HTMLInputElement>(null)
  const counterEle = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputValue == ',') {
      // Delete inputValue when being inputed only comma
      setInputValue('')
    } else if (/,/.test(inputValue)) {
      // Split inputValue into an array with comma
      const formattedValue = inputValue.replace(/[\r\n\s]/g, '')
      const isLeft: boolean = formattedValue[formattedValue.length - 1] != ','
      let inputList: string[] = formattedValue.split(',').filter(Boolean)
      if (inputList.length > 0) {
        if (isLeft) {
          // When end with comma
          const lastValue: string | undefined = inputList.pop()
          lastValue ? setInputValue(lastValue) : setInputValue('')
          addChips(inputList)
        } else {
          setInputValue('')
          addChips(inputList)
        }
      }
    }
  }, [inputValue])

  useEffect(() => {
    if (maxLength) {
      // Should include comma
      let count = chips.map(c => c.value).join(',').length
      if (count > 0) count += 1
      setChipsCount(count)
    }
  }, [chips])

  function getTotalCount(): number{
    return chipsCount + inputValue.length
  }

  function isInputtable(): boolean{
    return !maxLength || maxLength > getTotalCount()
  }

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

  function handleChangeInput(event: any): void{
    let value: string = event.target.value.replace(/[\r\n\s]/g, '')
    if (!maxLength || inputValue.length > event.target.value.length) {
      // When deleted
      setInputValue(value)
    } else if (isInputtable()) {
      // When inputtable
      const inputtableCount: number = maxLength - chipsCount
      if (inputtableCount >= 0) value = value.slice(0, inputtableCount)
      setInputValue(value)
    }
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
        onChange={e => handleChangeInput(e)} onFocus={handleFocusInput} onBlur={handleBlurInput} />
    </div>
  )

  if (maxLength) {
    return (
      <div className='form-countable-input-group'>
        {textareComponent}
        <div ref={counterEle} className='form-countable-input-counter'>{`${getTotalCount()} / ${maxLength}`}</div>
        <div className='form-group-desc'>Type words separated by commas.</div>
      </div>
    )
  } else {
    return textareComponent
  }
}

export default ChipTextarea
