/*
 *  This component should be imported from MygamesEdit component. */
import type { Game, Chip } from 'types/global'
import { useState, useCallback, useContext } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from 'react-alert'
import { useSignOut } from 'hooks/useSignOut'
import nprogress from 'nprogress'

import ChipTextarea from 'components/form/chip_textarea'
import LoadingOverlay from 'components/loading_overlay'

import validate from 'scripts/validate'
import Language from 'scripts/language'

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

  const signOut = useSignOut()
  const router = useRouter()
  const alert = useAlert()
  const language = new Language(game.lang)

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
    if (validate.token(currentTokenContext.currentToken)) {
      if (validateWords() && game.id) {
        const words = chips.map(c => c.value)
        const body = { words: words, game: { game_id: game.id } }
        setShowOverlay(true)
        nprogress.start()
        fetch(`http://localhost:3000/api/v1/words/create`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            'access-token': currentTokenContext.currentToken.accessToken,
            'client': currentTokenContext.currentToken.client,
            'uid': currentTokenContext.currentToken.uid
          },
          body: JSON.stringify(body)
        }).then(res => res.json())
          .then(json => {
            if (json.ok) {
              setChips([])
              alert.show(language.succeedMsg, { type: 'success' })
            } else {
              alert.show(language.failedMsg, { type: 'error' })
            }
          })
          .catch(error => console.log(error))
          .finally(() => {
            nprogress.done()
            setShowOverlay(false)
          })
      } else {
        alert.show(language.getInvalidMsg(game.char_count), { type: 'error' })
      }
    } else {
      signOut(() => router.replace('/signup'))
    }
  }

  return (
    <div className='game-add-words'>
      <div className='form-group'>
        <label>Words</label>
        <ChipTextarea chips={chips} addChips={addChips} removeChip={removeChip} updateChip={updateChip} maxLength={5000} />
      </div>
      <button className='btn btn-primary' disabled={!validateWords() || 0 == chips.length} onClick={handleClickSubmit}>Submit</button>
      <LoadingOverlay showOverlay={showOverlay} />
    </div>
  )
}

export default AddWords