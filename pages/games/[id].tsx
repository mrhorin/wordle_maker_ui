import type { Game, Word, Tile } from 'types/global'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { useState, useEffect } from 'react'

import TileComponent from 'components/game/tile'
import Language from 'scripts/language'

type Props = {
  game: Game,
  wordList: String[],
  wordToday: Word,
}

const GameStatus = {
  Initializing: 'INITIALIZING',
  Ready: 'READY',
  Cecking: 'CHECKING',
  Finished: 'FINISHED',
} as const

type GameStatus = typeof GameStatus[keyof typeof GameStatus]

const LocalStorageKey = {
  WordsState: 'wordsState'
}

// For localStrage data
type WordsState = {
  words: string[],
  savedOn: number
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
      return { props: { game: jsons[0].data, wordList: jsons[1].data, wordToday: jsons[2].data } }
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
   *  CHECKING: It doesn't allow an user to input any keys.
   *  FINISHED: It showed a result modal window and doesn't allow an user to input any keys. */
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Initializing)
  const [tilesTable, setTilesTable] = useState<Tile[][]>([])
  const [currentWord, setCurrentWord] = useState<string[]>([])
  const WORD_TODAY: string[] = props.wordToday.name.toUpperCase().split('')
  const language = new Language(props.game.lang)

  useEffect(() => {
    const prevWordsState: WordsState | null = loadWordsState()
    if (prevWordsState && prevWordsState.savedOn >= Date.parse(new Date().toDateString())) {
      // Load tilesTable from localStorage
      setTilesTable(() => {
        return prevWordsState.words.map(word => {
          return getTiles(word.split(''))
        })
      })
      // Load GamesStatus from localStorage
      if ((prevWordsState.words.indexOf(WORD_TODAY.join('')) >= 0) ||
        (prevWordsState.words.length >= props.game.challenge_count)) {
        setGameStatus(GameStatus.Finished)
      } else {
        setGameStatus(GameStatus.Ready)
      }
    } else {
      destroyWordsState()
      setGameStatus(GameStatus.Ready)
    }
  }, [])

  useEffect(() => {
    window.onkeydown = event => handleOnKeyDown(event.key)
  }, [gameStatus])

  function getTiles(word: string[]): Tile[] {
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
    window.localStorage.setItem(LocalStorageKey.WordsState, JSON.stringify(wordsState))
  }

  function loadWordsState(): WordsState | null{
    const json = window.localStorage.getItem(LocalStorageKey.WordsState)
    return json ? JSON.parse(json) : null
  }

  function destroyWordsState(): void{
    window.localStorage.removeItem(LocalStorageKey.WordsState)
  }

  function handleOnKeyDown(key: string): void{
    if (gameStatus != GameStatus.Ready) return
    if (key == 'Enter') {
      // Press Enter
      setGameStatus(GameStatus.Cecking)
      checkAnswerPromise()
        .then((nextGameStatus) => setGameStatus(nextGameStatus))
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
  }

  async function checkAnswerPromise() {
    return new Promise<GameStatus>((resolve) => {
      let nextGameStatus: GameStatus = GameStatus.Ready
      setCurrentWord(prevCurrentWord => {
        if (prevCurrentWord.length == props.game.char_count) {
          setTilesTable(prevTilesTable => {
            if (props.game.challenge_count > prevTilesTable.length) {
              // When blank rows exist
              const nextTilesTable: Tile[][] = [...prevTilesTable, getTiles(prevCurrentWord)]
              const nextWords: string[] = []
              for (let row of nextTilesTable) {
                let word = ''
                for (let tile of row) {
                  word += tile.letter
                }
                nextWords.push(word)
              }
              saveWordsState({
                words: nextWords,
                savedOn: Date.parse(new Date().toDateString())
              })
              if (nextTilesTable.length >= props.game.challenge_count) nextGameStatus = GameStatus.Finished
              return nextTilesTable
            } else {
              // When blank row doesn't exist
              return prevTilesTable
            }
          })
          if (prevCurrentWord.join('') == WORD_TODAY.join('')) nextGameStatus = GameStatus.Finished
          return []
        } else {
          return prevCurrentWord
        }
      })
      resolve(nextGameStatus)
    })
  }

  const wordsComponent = (
    <div className='words'>
      {(() => {
        // Set rows
        const rowComponents: JSX.Element[] = []
        for (let i = 0; i < props.game.challenge_count; i++){
          // Set tiles
          const tileComponents: JSX.Element[] = []
          for (let j = 0; j < props.game.char_count; j++){
            let tile: Tile = { letter: '', status: 'EMPTY' }
            // When the row already exists
            if (tilesTable[i] && tilesTable[i][j]) tile = tilesTable[i][j]
            // When the row is located below the last row
            if (tilesTable.length == i && currentWord[j]) tile.letter = currentWord[j]
            tileComponents.push(<TileComponent key={`${i}-${j}`} tile={tile} index={j} />)
          }
          rowComponents.push(<div key={i} className='words-row'>{tileComponents}</div>)
        }
        return rowComponents
      })()}
    </div>
  )

  return (
    <main id='main'>
      <Head>
        <title>{ props.game?.title} | WORDLE MAKER APP</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='container'>
        <div className='games'>
          {wordsComponent}
        </div>
        <h1 className='title'>{props.game?.title} / {props.wordToday.name}</h1>
      </div>
    </main>
  )
}

export default Games
