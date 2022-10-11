/*
 *  This component should be imported from MygamesEdit component. */
import type { Game, Chip, Token } from 'types/global'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from 'react-alert'

import useSignOut from 'hooks/useSignOut'
import useLanguage from 'hooks/useLanguage'
import useLocale from 'hooks/useLocale'

import nprogress from 'nprogress'

import ChipTextarea from 'components/form/chip_textarea'
import LoadingOverlay from 'components/loading_overlay'

import { ClientSideCookies } from 'scripts/cookie'
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
  const alert = useAlert()

  const signOut = useSignOut()
  const language = useLanguage(game.lang)

  const addChips = useCallback((inputList: string[]): void => {
    setChips(prevChips => {
      const newChips = inputList.map((input, index) => {
        // id has to be unique
        const id = prevChips.length > 0 ? prevChips[prevChips.length - 1].id + index + 1 + index : index + 1
        const isValid = input.length == game.char_count && language.validateWord(input)
        return { id: id, value: input.toUpperCase(), isValid: isValid }
      })
      return prevChips.concat(newChips)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const removeChip = useCallback((id: number): void => {
    setChips(prevChips => {
      return prevChips.filter((chip) => {
        return chip.id !== id
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateChip = useCallback((id: number, value: string): void => {
    setChips(prevChips => {
      return prevChips.map((prevChip) => {
        if (prevChip.id == id) {
          return {
            id: prevChip.id,
            value: value.toUpperCase(),
            isValid: game.char_count == value.length && language.validateWord(value)
          }
        }
        return prevChip
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  function validateWords(): boolean{
    let isValid: boolean = true
    if (chips.length <= 0) isValid = false
    for (const c of chips) {
      if (c.value.length != game.char_count || !language.validateWord(c.value)) {
        isValid = false
        break
      }
    }
    return isValid
  }

  function handleClickSubmit(): void{
    const token: Token | null = ClientSideCookies.loadToken()
    if (validate.token(token)) {
      alert.removeAll()
      if (validateWords() && game.id) {
        setShowOverlay(true)
        nprogress.start()
        const words: string[] = chips.map(c => c.value)
        postWords(token, game, words).then(json => {
          if (json.ok) {
            setChips([])
            alert.show(t.ALERT.SUCCESS, { type: 'success' })
          } else {
            alert.show(t.ALERT.FAILED, { type: 'error' })
            console.error(json)
          }
        }).catch(error => {
          console.log(error)
        }).finally(() => {
          setShowOverlay(false)
          nprogress.done()
        })
      } else {
        alert.show(t.ALERT.ADDED_INVALID_WORDS.replace(/\*/g, game.char_count.toString()), { type: 'error' })
      }
    } else {
      signOut(() => router.replace('/signup'))
    }
  }

  return (
    <div className='mygames-edit-main sp-padding'>
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
      <ul style={{ paddingLeft: '1rem' }}>
        <li>{t.FORM.CHIP_TEXTAREA.NOTE}</li>
        <li>{t.MY_GAMES.EDIT.ADD_WORDS.CANNOT_ADD_DUPLICATED_WORDS}</li>
        <li>{t.MY_GAMES.EDIT.ADD_WORDS.WILL_TURN_RED}</li>
      </ul>
      <div className='form-group'>
        <ChipTextarea chips={chips} addChips={addChips} removeChip={removeChip} updateChip={updateChip} maxLength={5000} />
      </div>
      <button className='btn btn-primary' disabled={!validateWords() || 0 == chips.length} onClick={handleClickSubmit}>{ t.FORM.SUBMIT }</button>
      <LoadingOverlay showOverlay={showOverlay} />
    </div>
  )
}

export default AddWords