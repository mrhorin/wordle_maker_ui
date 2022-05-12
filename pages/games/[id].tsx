import type { Game, Word, Tile } from 'types/global'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { useState, useEffect } from 'react'
import { useKeyDown } from 'hooks/useKeyDown'

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
   *  FINISHED: It showed a result modal window and doesn't allow an user to input any keys. */
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Initializing)
  const [tilesTable, setTilesTable] = useState<Tile[][]>([])
  const [currentWord, setCurrentWord] = useState<string[]>([])
  const WORD_TODAY: string[] = props.wordToday.name.toUpperCase().split('')
  const language = new Language(props.game.lang)

  useEffect(() => {
    const prevWordsState: WordsState | null = loadWordsState()
    if (prevWordsState && prevWordsState.savedOn >= Date.parse(new Date().toDateString())) {
      setTilesTable(() => {
        return prevWordsState.words.map(word => {
          return getTiles(word.split(''))
        })
      })
    } else {
      destroyWordsState()
    }
    ready()
  }, [])

  useKeyDown(event => handleInputKey(event.key), [gameStatus])

  function getTiles(word: string[]): Tile[] {
    // Set letters
    const tiles = word.map((letter, i) => {
      return { letter: letter.toUpperCase(), isCorrect: false, isPresent: false, isAbsent: false }
    })
    // Set state
    for (let i = 0; i < tiles.length; i++){
      if (WORD_TODAY.indexOf(tiles[i].letter) >= 0) {
        if (WORD_TODAY.indexOf(tiles[i].letter) == i) {
          tiles[i].isCorrect = true
        } else {
          // Searching for matching tiles except tiles already checked as correct or absent
          for (let j = 0; j < tiles.length; j++){
            if (!tiles[j].isCorrect && !tiles[j].isAbsent) {
              if (WORD_TODAY[j] == tiles[j].letter) {
                tiles[j].isCorrect = true
              } else {
                tiles[j].isPresent = true
              }
            }
          }
        }
      } else {
        tiles[i].isAbsent = true
      }
    }
    return tiles
  }

  // Extract word list from tiles table
  function extractWordsFromTable(table: Tile[][]): string[]{
    const words: string[] = []
    for (let row of table) {
      let word = ''
      for (let tile of row) {
        word += tile.letter
      }
      words.push(word)
    }
    return words
  }

  function ready(): void{
    setGameStatus(GameStatus.Ready)
  }

  function finish(): void{
    setGameStatus(GameStatus.Finished)
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

  function handleInputKey(key: string): void{
    if (key == 'Enter' && gameStatus == GameStatus.Ready) {
      // Press Enter
      setCurrentWord(prevCurrentWord => {
        if (prevCurrentWord.length == props.game.char_count) {
          setTilesTable(prevTilesTable => {
            if (props.game.challenge_count > prevTilesTable.length) {
              // When blank rows exist
              const nextTilesTable: Tile[][] = [...prevTilesTable, getTiles(prevCurrentWord)]
              saveWordsState({
                words: extractWordsFromTable(nextTilesTable),
                savedOn: Date.parse(new Date().toDateString())
              })
              return nextTilesTable
            } else {
              // When blank row doesn't exist
              return prevTilesTable
            }
          })
          if (prevCurrentWord.join('') == WORD_TODAY.join('')) finish()
          return []
        } else {
          return prevCurrentWord
        }
      })
    } else if (key == 'Backspace' && gameStatus == GameStatus.Ready) {
      // Press Backspace
      setCurrentWord(prevCurrentWord => {
        return prevCurrentWord.slice(0, prevCurrentWord.length - 1)
      })
    } else if (language.regexp?.test(key) && key.length == 1 && currentWord.length < props.game.char_count && gameStatus == GameStatus.Ready) {
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

  const wordsComponent = (
    <div className='words'>
      {(() => {
        // Set rows
        const rowComponents: JSX.Element[] = []
        for (let i = 0; i < props.game.challenge_count; i++){
          // Set tiles
          const tileComponents: JSX.Element[] = []
          for (let j = 0; j < props.game.char_count; j++){
            let tile: Tile = { letter: '', isCorrect: false, isPresent: false, isAbsent: false }
            // When the row already exists
            if (tilesTable[i] && tilesTable[i][j]) tile = tilesTable[i][j]
            // When the row is located bellow the last low
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
