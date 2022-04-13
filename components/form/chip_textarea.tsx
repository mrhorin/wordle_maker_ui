import type { Game } from 'types/global'
import { useState, useLayoutEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

interface Props {
  game: Game,
  words: string[],
  setWords: React.Dispatch<React.SetStateAction<string[]>>,
  children?: JSX.Element
}

const ChipTextarea = ({ game, words, setWords, children }: Props) => {
  const [inputWord, setInputWord] = useState<string>('')

  useLayoutEffect(() => {
    if (inputWord == ',') {
      // Delete inputWord when being inputed only comma
      setInputWord('')
    } else if (/,/g.test(inputWord)) {
      // Split inputWord into an array with comma
      let inputWordList: string[] = inputWord.split(',')
      inputWordList = inputWordList.map((word) => {
        return word.replace(/[\r\n\s]/g, '')
      }).filter(Boolean)
      if (inputWordList.length > 0) {
        setWords(words.concat(inputWordList))
        setInputWord('')
      }
    }
  }, [inputWord])

  function removeWord(index: number | string) {
    if (Number(index) >= 0) {
      let newWords = words.filter((word, i) => {
        return i !== Number(index)
      })
      setWords(newWords)
    }
  }

  function handleClickTextarea(event: any): void{
    if (event.target.id == 'chip-textarea') {
      const input = document.getElementById('chip-textarea-input')
      input?.focus()
    }
  }

  const chipComponents: JSX.Element[] = []
  for (let i = 0; i < words.length; i++){
    if (words[i]) {
      let style = 'chip-textarea-chip'
      if (words[i].length != game.char_count) style += ' chip-textarea-chip-invalid'
      chipComponents.push(
        <div className={style} key={i}>
          {words[i]}
          <span className='chip-textarea-chip-xmark' onClick={() => { removeWord(i) }}>
            <FontAwesomeIcon icon={faXmark} />
          </span>
        </div>
      )
    }
  }

  return (
    <div id='chip-textarea' className='chip-textarea' onClick={(e) => { handleClickTextarea(e) }}>
      {chipComponents}
      <input id='chip-textarea-input' className='chip-textarea-input' type='text' value={inputWord} onChange={e => { setInputWord(e.target.value) }} />
    </div>
  )
}

export default ChipTextarea
