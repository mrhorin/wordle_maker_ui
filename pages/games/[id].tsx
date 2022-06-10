import type { Game, Word, Tile } from 'types/global'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useEffect, useCallback } from 'react'
import { useAlert } from 'react-alert'
import useCopyToClipboard from 'hooks/useCopyToClipboard'

import Confetti from 'react-confetti'
import TileComponent from 'components/game/tile'
import NextGameTimer from 'components/game/next_game_timer'
import Modal from 'components/modal'
import EnKeyboard from 'components/keyboard/en/qwerty'
import JaKeyboard from 'components/keyboard/ja/gozyuon'

import Language from 'scripts/language'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faCopy } from '@fortawesome/free-solid-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

type Props = {
  game: Game,
  wordList: String[],
  wordToday: Word,
  questionNo: number,
}

const GameStatus = {
  Initializing: 'INITIALIZING',
  Ready: 'READY',
  Entering: 'ENTERING',
  Finished: 'FINISHED',
} as const

type GameStatus = typeof GameStatus[keyof typeof GameStatus]

const SetCurrentWordStatus = {
  NotInWordList: 'NOT IN WORD LIST',
  NotEnoughLetters: 'NOT ENOUGH LETTERS',
  FinishedGame: 'FINISHED GAME',
} as const

type SetCurrentWordStatus = typeof SetCurrentWordStatus[keyof typeof SetCurrentWordStatus]

// For localStrage data
type WordsState = {
  words: string[],
  savedOn: number,
  startedAt: number,
  endedAt: number | null,
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id: string = context.query['id'] as string
  const reses = await Promise.all([
    fetch(`http://api:3000/api/v1/games/${id}`),
    fetch(`http://api:3000/api/v1/games/${id}/word_list`),
    fetch(`http://api:3000/api/v1/words/today/${id}`),
  ])
  if (reses[0].status == 200 && reses[1].status == 200 && reses[2].status == 200) {
    const jsons = await Promise.all([reses[0].json(), reses[1].json(), reses[2].json()])
    if (jsons[0].ok && jsons[1].ok && jsons[2].ok) {
      return {
        props: {
          game: jsons[0].data,
          wordList: jsons[1].data,
          wordToday: jsons[2].data.word,
          questionNo: jsons[2].data.questionNo,
        }
      }
    }
  }
  return { notFound: true }
}

const Games = (props: Props) => {
  /*
   * gameStatus:
   *  This value indicates the status of the game.
   *  INITIALIZING: It doesn't allow an user to input any keys.
   *  READY: It allows an user to input keys.
   *  ENTERING: It doesn't allow an user to input any keys.
   *  FINISHED: It showed a result modal window and doesn't allow an user to input any keys. */
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Initializing)
  /* tilesTalbe:
   *  Saved and stored as wordsState['words'] in localStorage. */
  const [tilesTable, setTilesTable] = useState<Tile[][]>([])
  /* startedAt:
   *  Saved and stored as wordsState['startedAt'] in localStorage. */
  const [startedAt, setStartedAt] = useState<number>(Date.parse(new Date().toString()))
  /* endedAt:
   *  Saved and stored as wordsState['endedAt'] in localStorage. */
  const [endedAt, setEndedAt] = useState<number | null>(null)
  /* currentWord:
   *  This state is stored letters a user inputted. */
  const [currentWord, setCurrentWord] = useState<string[]>([])
  const [showResultModal, setShowResultModal] = useState<boolean>(false)

  const router = useRouter()
  const [clipboard, copy] = useCopyToClipboard()

  const WORD_TODAY: string[] = props.wordToday.name.toUpperCase().split('')
  const LOCAL_STORAGE_KEY = `wordsState.${props.game.id}`
  const alert = useAlert()
  const language = new Language(props.game.lang)

  useEffect(() => {
    window.onkeydown = event => handleOnKeyDown(event.key)
    /*
     * Load tilesTable from localStorage when Initializing. */
    if (gameStatus == GameStatus.Initializing) {
      const prevWordsState: WordsState | null = loadWordsState()
      if (!prevWordsState) {
        setGameStatus(GameStatus.Ready)
      } else if (isExpired(prevWordsState.savedOn)) {
        destroyAllExpiredWordsState()
        setGameStatus(GameStatus.Ready)
      } else {
        setStartedAt(prevWordsState.startedAt)
        setEndedAt(prevWordsState.endedAt)
        setTilesTable(() => {
          return prevWordsState.words.map(word => {
            return getTilesFromWord(word.split(''))
          })
        })
      }
    }
    /*
     * Show a result modal window when Finished.
     * The second parameter in setTimeout depends on animation property
     * with @keyframes transform-tile in the css file. */
    if (gameStatus == GameStatus.Finished) setTimeout(() => { setShowResultModal(true) }, 1200)
    /*
     * Enter currentWord in TilesTable when Entering.
     * When it resolves, save wordsState on localStorage.
     * When it rejects, alert an errror. */
    if (gameStatus == GameStatus.Entering) {
      enterCurrentWordInTilesTable()
        .then(nextTilesTable => {
          const words: string[] = []
          for (let row of nextTilesTable) {
            let word = ''
            for (let tile of row) word += tile.letter
            words.push(word)
          }
          const nextEndedAt: number | null = words[words.length - 1] == WORD_TODAY.join('') ? Date.parse(new Date().toString()) : null
          if (nextEndedAt) setEndedAt(nextEndedAt)
          saveWordsState({
            words: words,
            savedOn: Date.parse(new Date().toDateString()),
            startedAt: startedAt,
            endedAt: nextEndedAt,
          })
        })
        .catch(status => {
          if (status == SetCurrentWordStatus.NotEnoughLetters) setGameStatus(GameStatus.Ready)
          if (status == SetCurrentWordStatus.NotInWordList) setGameStatus(GameStatus.Ready)
          if (status == SetCurrentWordStatus.FinishedGame) setGameStatus(GameStatus.Finished)
          alert.show(status, { type: 'error' })
        })
    }
  }, [gameStatus])

  useEffect(() => {
    if (tilesTable.length >= props.game.challenge_count) {
      // When tilesTable is filled with Tiles
      setGameStatus(GameStatus.Finished)
    } else if (tilesTable.length > 0) {
      // When tilesTable has Tiles but not being full
      const lastWord: string[] = tilesTable[tilesTable.length - 1].map((tile) => {
        return tile.letter
      })
      if (lastWord.join('') == WORD_TODAY.join('')) {
        setGameStatus(GameStatus.Finished)
      } else {
        setGameStatus(GameStatus.Ready)
      }
    }
  }, [tilesTable])

  function getGuessTime(): string {
    if (endedAt) {
      const diffSec: number = (endedAt - startedAt) / 1000
      const hour: string = ('00' + Math.floor(diffSec / 3600)).slice(-2)
      const min: string = ('00' + Math.floor(diffSec % 3600 / 60)).slice(-2)
      const rem: string = ('00' + diffSec % 60).slice(-2)
      return `${hour}:${min}:${rem}`
    } else {
      return '00:00:00'
    }
  }

  function getResultText(): string{
    const url = `https://${process.env.NEXT_PUBLIC_DOMAIN}${router.asPath}`
    let tiles: string = ''
    for (let row of tilesTable) {
      for (let tile of row) {
        if (tile.status == 'CORRECT') tiles += '🟦'
        if (tile.status == 'PRESENT') tiles += '🟨'
        if (tile.status == 'ABSENT') tiles += '⬛'
      }
      tiles += '\r'
    }
    const guessTimes: string = isClear() ? tilesTable.length.toString() : 'X'
    return `${props.game.title} ${props.questionNo} ${guessTimes}/${props.game.challenge_count}\r\r${tiles}\r${url}`
  }

  function isClear(): boolean{
    return endedAt != null
  }

  function isExpired(savedOn: number): boolean{
    const today: Date = new Date()
    const date: Date = new Date(savedOn)
    return today.getFullYear() != date.getFullYear() || today.getMonth() != date.getMonth() || today.getDay() != date.getDay()
  }

  function getTilesFromWord(word: string[]): Tile[] {
    // Set letters
    const tiles: Tile[] = word.map((letter, i) => {
      return { letter: letter.toUpperCase(), status: 'EMPTY' } as Tile
    })
    // Set status
    for (let i = 0; i < tiles.length; i++){
      if (WORD_TODAY.indexOf(tiles[i].letter) >= 0) {
        // When the letter exists in WORD_TODAY
        if (WORD_TODAY.indexOf(tiles[i].letter) == i) {
          tiles[i].status = 'CORRECT'
        } else {
          // Searching for matching tiles in EMPTY or PRESENT
          for (let j = 0; j < tiles.length; j++){
            if (tiles[j].status == 'EMPTY' || tiles[j].status == 'PRESENT') {
              if (WORD_TODAY[j] == tiles[j].letter) {
                tiles[j].status = 'CORRECT'
              } else {
                tiles[j].status = 'PRESENT'
              }
            }
          }
        }
      } else {
        // When the letter doesn't exist in WORD_TODAY
        tiles[i].status = 'ABSENT'
      }
    }
    return tiles
  }

  function saveWordsState(wordsState: WordsState): void{
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wordsState))
  }

  function loadWordsState(): WordsState | null{
    const json = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    return json ? JSON.parse(json) : null
  }

  function destroyAllExpiredWordsState(): void{
    for (let key in window.localStorage) {
      if (/^wordsState\.\d+$/.test(key)) {
        const json = window.localStorage.getItem(key)
        const wordState: WordsState | null = json ? JSON.parse(json) as WordsState : null
        if (wordState && isExpired(wordState.savedOn)) window.localStorage.removeItem(key)
      }
    }
  }

  function handleClickCopy(): void{
    copy(getResultText())
    alert.show('Copyed Results', {type: 'success'})
  }

  function handleClickTweet(): void{
    window.open(`https://twitter.com/intent/tweet?text=${encodeURI(getResultText())}`, '_blank')
  }

  const handleOnKeyDown = useCallback((key: string) => {
    if (gameStatus != GameStatus.Ready) return
    if (key == 'Enter') {
      // Press Enter
      setGameStatus(GameStatus.Entering)
    } else if (key == 'Backspace') {
      // Press Backspace
      setCurrentWord(prevCurrentWord => {
        return prevCurrentWord.slice(0, prevCurrentWord.length - 1)
      })
    } else if (language.regexp?.test(key) && key.length == 1) {
      // Press valid key
      setCurrentWord(prevCurrentWord => {
        if (prevCurrentWord.length < props.game.char_count) {
          return prevCurrentWord.concat(key.toUpperCase())
        } else {
          return prevCurrentWord
        }
      })
    }
  }, [gameStatus])

  /*
   * Set currentWord on tilesTable and then empty it out. */
  function enterCurrentWordInTilesTable(): Promise<Tile[][]> {
    return new Promise<Tile[][]>((resolve, reject) => {
      setCurrentWord(prevCurrentWord => {
        if (gameStatus == GameStatus.Finished) {
          reject(SetCurrentWordStatus.FinishedGame)
          return prevCurrentWord
        } else if (prevCurrentWord.length != props.game.char_count) {
          reject(SetCurrentWordStatus.NotEnoughLetters)
          return prevCurrentWord
        } else if (!props.wordList.includes(prevCurrentWord.join(''))) {
          reject(SetCurrentWordStatus.NotInWordList)
          return prevCurrentWord
        } else {
          setTilesTable(prevTilesTable => {
            const nextTilesTable: Tile[][] = [...prevTilesTable, getTilesFromWord(prevCurrentWord)]
            resolve(nextTilesTable)
            return nextTilesTable
          })
          return []
        }
      })
    })
  }

  const wordsRowComponents: JSX.Element[] = []
  for (let i = 0; i < props.game.challenge_count; i++){
    // Set tiles
    const row: JSX.Element[] = []
    for (let j = 0; j < props.game.char_count; j++){
      let tile: Tile = { letter: '', status: 'EMPTY' }
      // When the row already exists
      if (tilesTable[i] && tilesTable[i][j]) tile = tilesTable[i][j]
      // When the row is located below the last row
      if (tilesTable.length == i && currentWord[j]) tile.letter = currentWord[j]
      row.push(<TileComponent key={`${i}-${j}`} tile={tile} index={j} />)
    }
    wordsRowComponents.push(<div key={i} className='words-row'>{row}</div>)
  }

  const keyboardComponent: JSX.Element = props.game.lang == 'en' ?
    <EnKeyboard tilesTable={tilesTable} handleOnClick={handleOnKeyDown} /> : <JaKeyboard tilesTable={tilesTable} handleOnClick={handleOnKeyDown} />

  return (
    <main id='main'>
      <Head>
        <title>{ props.game?.title} | WORDLE MAKER APP</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Modal */}
      <Modal showModal={showResultModal} setShowModal={setShowResultModal}>
        <div className='modal-window-container'>
          <div className='modal-window-header' style={{position: 'relative'}}>
            <div style={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center' }}>YOU WON</div>
            <FontAwesomeIcon icon={faXmark} style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer' }} onClick={() => setShowResultModal(false)} />
          </div>
          <div className='modal-window-body'>
            {/* Statistics */}
            <div className='statistics'>
              <div className='statistic'>
                <div className='statistic-value'>22</div>
                <div className='statistic-label'>Played</div>
              </div>
              <div className='statistic'>
                <div className='statistic-value'>80</div>
                <div className='statistic-label'>Win %</div>
              </div>
              <div className='statistic'>
                <div className='statistic-value'>5</div>
                <div className='statistic-label'>Current Streak</div>
              </div>
              <div className='statistic'>
                <div className='statistic-value'>13</div>
                <div className='statistic-label'>Max Streak</div>
              </div>
            </div>
            {/* Timers */}
            <div className='timers'>
              <div className='timer'>
                <div className='timer-label'>Guess Time</div>
                <div className='timer-clock'>{getGuessTime()}</div>
              </div>
              <NextGameTimer />
            </div>
          </div>
          <div className='modal-window-footer'>
            {/* Shares */}
            <div className='shares'>
              <div className='share-copy' onClick={handleClickCopy}>
                <FontAwesomeIcon icon={faCopy} style={{marginRight: '0.5rem'}} />COPY
              </div>
              <div className='share-tweet' onClick={handleClickTweet}>
                <FontAwesomeIcon icon={faTwitter} style={{marginRight: '0.5rem'}} />TWEET
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <div className='games'>
        {(() => {
          if (gameStatus == GameStatus.Finished && showResultModal && isClear()) return <Confetti recycle={true} />
        })()}
        <div className='words'>{wordsRowComponents}</div>
        <div className='keyboard'>{keyboardComponent}</div>
      </div>
    </main>
  )
}

export default Games
