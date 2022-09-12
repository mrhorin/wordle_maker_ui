/*
 *  This component should be imported from MygamesEdit component. */
import type { Game, Chip, Token } from 'types/global'
import { useState, useCallback, useContext } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from 'react-alert'

import useSignOut from 'hooks/useSignOut'
import useLanguage from 'hooks/useLanguage'
import useLocale from 'hooks/useLocale'

import nprogress from 'nprogress'

import ChipTextarea from 'components/form/chip_textarea'
import LoadingOverlay from 'components/loading_overlay'

import validate from 'scripts/validate'

import CurrentTokenContext from 'contexts/current_token'

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
  /********* Context *********/
  const currentTokenContext = useContext(CurrentTokenContext)

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
  }, [])

  const removeChip = useCallback((id: number): void => {
    setChips(prevChips => {
      return prevChips.filter((chip) => {
        return chip.id !== id
      })
    })
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
    if (validate.token(currentTokenContext.currentToken) && currentTokenContext.currentToken) {
      if (validateWords() && game.id) {
        setShowOverlay(true)
        nprogress.start()
        fetchAddWords(currentTokenContext.currentToken as Token).then(json => {
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

  async function fetchAddWords(token: Token) {
    const words = chips.map(c => c.value)
    const body = { words: words, game_id: game.id }
    const res = await fetch(`http://localhost:3000/api/v1/words`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        'access-token': token.accessToken,
        'client': token.client,
        'uid': token.uid
      },
      body: JSON.stringify(body)
    })
    return await res.json()
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