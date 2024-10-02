/*
 *  This component should be imported from MygamesEdit component. */
import type { Game, Chip, Token } from 'types/global'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'

import useSignOut from 'hooks/useSignOut'
import useLanguage from 'hooks/useLanguage'
import useLocale from 'hooks/useLocale'
import useToastify from 'hooks/useToastify'

import nprogress from 'nprogress'

import ChipTextarea from 'components/form/chip_textarea'
import LoadingOverlay from 'components/loading_overlay'

import cookie from 'scripts/cookie'
import validate from 'scripts/validate'
import { postWords } from 'scripts/api'

interface Props {
  game: Game
}

const AddWords = ({ game }: Props) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false)
  /*
   * chips:
   *  The state is used in ChipTextarea component to add new words.
   *  Words which are added by an user is stored into this state as Chip list.
   *  The state will be empty after submitting them to the server. */
  const [chips, setChips] = useState<Chip[]>([])

  const router = useRouter()
  const { t } = useLocale()
  const toastify = useToastify()

  const signOut = useSignOut()
  const language = useLanguage(game.lang)

  const addChips = useCallback((inputList: string[]): void => {
    setChips(prevChips => {
      const newChips = inputList.map((input, index) => {
        // id has to be unique
        const id = prevChips.length > 0 ? prevChips[prevChips.length - 1].id + index + 1 + index : index + 1
        const value = parseChipValue(input)
        const isValid = input.length == game.char_count && language.validateWord(value)
        return { id: id, value: value, isValid: isValid }
      })
      return prevChips.concat(newChips)
    })
  }, [])

  const removeChip = useCallback((id: number): void => {
    setChips(prevChips => {
      return prevChips.filter((chip) => {
        return chip.id !== id
      })
    })
  }, [])

  const updateChip = useCallback((id: number, nextValue: string): void => {
    setChips(prevChips => {
      return prevChips.map((prevChip) => {
        if (prevChip.id == id) {
          const value = parseChipValue(nextValue)
          return {
            id: prevChip.id,
            value: value,
            isValid: game.char_count == value.length && language.validateWord(value)
          }
        }
        return prevChip
      })
    })
  }, [])

  function validateWords(): boolean{
    let isValid: boolean = true
    if (chips.length <= 0) isValid = false
    for (const c of chips) {
      if (c.value.length != game.char_count || !language.validateWord(parseChipValue(c.value))) {
        isValid = false
        break
      }
    }
    return isValid
  }

  function parseChipValue(input: string): string{
    return input.toUpperCase().replace(/[ぁ-ん]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) + 0x60)
    })
  }

  function handleClickSubmit(): void{
    const token: Token | null = cookie.client.loadToken()
    if (validate.token(token)) {
      if (validateWords() && game.id) {
        setShowOverlay(true)
        nprogress.start()
        const words: string[] = chips.map(c => c.value)
        postWords(token, game, words).then(json => {
          if (json.ok) {
            setChips([])
            toastify.alertSuccess(t.ALERT.SUCCESS)
          } else {
            toastify.alertError(t.ALERT.FAILED)
            console.error(json)
          }
        }).catch(error => {
          console.log(error)
        }).finally(() => {
          setShowOverlay(false)
          nprogress.done()
        })
      } else {
        toastify.alertError(t.ALERT.ADDED_INVALID_WORDS.replace(/\*/g, game.char_count.toString()))
      }
    } else {
      signOut(() => router.replace('/signin'))
    }
  }

  return (
    <div className='addwords sp-padding'>
      <div className='addwords-attrs'>
        {/* Language */}
        <div className='addwords-attrs-item'>
          <div className='addwords-attrs-item-label'>{t.GAME.LANGUAGE}:</div>
          <div className='addwords-attrs-item-value'>{language.name}</div>
        </div>
        {/* Character Count */}
        <div className='addwords-attrs-item'>
          <div className='addwords-attrs-item-label'>{t.GAME.CHARACTER_COUNT}:</div>
          <div className='addwords-attrs-item-value'>{game.char_count.toString()}</div>
        </div>
      </div>
      <div className='form-group'>
        <label htmlFor='addwords-textarea'>{t.MY_GAMES.EDIT.ADD_WORDS.LABEL}</label>
        <ChipTextarea chips={chips} addChips={addChips} removeChip={removeChip} updateChip={updateChip} maxLength={5000} id='addwords-textarea'/>
      </div>
      <button className='btn btn-primary' disabled={!validateWords() || 0 == chips.length} onClick={handleClickSubmit}>{ t.FORM.SUBMIT }</button>
      <LoadingOverlay showOverlay={showOverlay} />
    </div>
  )
}

export default AddWords