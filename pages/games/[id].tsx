import type { Game, Word, Tile, Token } from 'types/global'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useEffect, useCallback, useContext } from 'react'
import { useAlert } from 'react-alert'
import nookies from 'nookies'

import useLocale from 'hooks/useLocale'
import useCopyToClipboard from 'hooks/useCopyToClipboard'
import useLanguage from 'hooks/useLanguage'

import PrivateGame from 'components/game/private_game'
import SlideoutMenu from 'components/slideout_menu'
import TileComponent from 'components/game/tile'
import NextGameTimer from 'components/game/next_game_timer'
import Modal from 'components/modal'
import EnKeyboard from 'components/keyboard/en/qwerty'
import JaKeyboard from 'components/keyboard/ja/gozyuon'

import ShowSlideoutMenuContext from 'contexts/show_slideout_menu'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

import { getGamesPlay } from 'scripts/api'
import validate from 'scripts/validate'

type Props = {
  isPublished: boolean,
  data: {
    game: Game,
    wordList: String[],
    wordToday: Word,
    questionNo: number
  },
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
type Statistics = {
  win: number,
  lose: number,
  currentStreak: number,
  maxStreak: number,
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id: number = Number(ctx.query['id'])
  const cookies = nookies.get(ctx)
  const token: Token = {
    accessToken: cookies.accessToken,
    client: cookies.client,
    uid: cookies.uid,
    expiry: cookies.expiry,
  }
  const json = validate.token(token) ? await getGamesPlay(id, token, ctx) : await getGamesPlay(id)
  if (json.ok) return { props: { isPublished: true, data: json.data } }
  if (!json.ok && !json.isPublished && json.statusCode == 200) {
    // When private
    return { props: { isPublished: false, data: { game: json.data } } }
  }
  return { notFound: true }
}

const Games = (props: Props) => {
  if (!props.isPublished) return <PrivateGame game={props.data.game} />
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
  const [statistics, setStatistics] = useState<Statistics>({ win: 0, lose: 0, currentStreak: 0, maxStreak: 0 })
  const [showResultModal, setShowResultModal] = useState<boolean>(false)
  const [showHowToPlayModal, setShowHowToPlayModal] = useState<boolean>(false)

  const showSlideoutMenuContext = useContext(ShowSlideoutMenuContext)

  const router = useRouter()
  const { t, locale } = useLocale()
  const [clipboard, copy] = useCopyToClipboard()

  const WORD_TODAY: string[] = props.data.wordToday.name.toUpperCase().split('')
  const LOCAL_STORAGE_WORDS_STATE_KEY = `wordsState.${props.data.game.id}`
  const LOCAL_STORAGE_STATISTICS_KEY = `statistics.${props.data.game.id}`

  const alert = useAlert()
  const language = useLanguage(props.data.game.lang)

  useEffect(() => {
    window.onkeydown = event => handleOnKeyDown(event.key)
    /*
     * Load tilesTable & statistics from localStorage when Initializing. */
    if (gameStatus == GameStatus.Initializing) {
      const prevStatistics: Statistics | null = loadStatistics()
      if (prevStatistics) setStatistics(prevStatistics)
      const prevWordsState: WordsState | null = loadWordsState()
      if (!prevWordsState) {
        // When access for the first time
        setGameStatus(GameStatus.Ready)
        if (prevStatistics == null) setShowHowToPlayModal(true)
      } else if (isExpired(prevWordsState.savedOn)) {
        // When wordState expires
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
    if (gameStatus == GameStatus.Finished) {
      addWillChange()
      setTimeout(() => { setShowResultModal(true) }, 1200)
    }
    /*
     * Enter currentWord in TilesTable when Entering.
     * When it resolves, save wordsState on localStorage.
     * When it rejects, alert an errror. */
    if (gameStatus == GameStatus.Entering) {
      enterCurrentWordInTilesTable()
        .then(nextTilesTable => {
          // Convert tilesTable to words in order to save wordsState
          const nextWords: string[] = []
          for (let row of nextTilesTable) {
            let word = ''
            for (let tile of row) word += tile.letter
            nextWords.push(word)
          }
          // Check whether game is over or not
          let nextEndedAt: number | null = null
          if (nextWords[nextWords.length - 1] == WORD_TODAY.join('') || nextTilesTable.length >= props.data.game.challenge_count) {
            nextEndedAt = Date.parse(new Date().toString())
            setEndedAt(nextEndedAt)
            // Set next stactics
            if (nextWords[nextWords.length - 1] == WORD_TODAY.join('')) {
              const nextCurrentStreak: number = statistics.currentStreak + 1
              const nextMaxStreak: number = nextCurrentStreak > statistics.maxStreak ? nextCurrentStreak : statistics.maxStreak
              const nextStatistics: Statistics = {
                win: statistics.win + 1,
                lose: statistics.lose,
                currentStreak: nextCurrentStreak,
                maxStreak: nextMaxStreak,
              }
              setStatistics(nextStatistics)
              saveStatistics(nextStatistics)
            } else {
              const nextStatistics: Statistics = {
                win: statistics.win,
                lose: statistics.lose + 1,
                currentStreak: 0,
                maxStreak: statistics.maxStreak,
              }
              setStatistics(nextStatistics)
              saveStatistics(nextStatistics)
            }
          }
          saveWordsState({
            words: nextWords,
            savedOn: Date.parse(new Date().toDateString()),
            startedAt: startedAt,
            endedAt: nextEndedAt,
          })
        })
        .catch(status => {
          alert.removeAll()
          if (status == SetCurrentWordStatus.NotEnoughLetters) {
            setGameStatus(GameStatus.Ready)
            alert.show(t.ALERT.NOT_ENOUGH_LETTERS, { type: 'error' })
          } else if (status == SetCurrentWordStatus.NotInWordList) {
            setGameStatus(GameStatus.Ready)
            alert.show(t.ALERT.NOT_IN_WORD_LIST, { type: 'error' })
          } else if (status == SetCurrentWordStatus.FinishedGame) {
            setGameStatus(GameStatus.Finished)
            alert.show(t.ALERT.FJINISHED_GAME, { type: 'error' })
          }
        })
    }
  }, [gameStatus])

  useEffect(() => {
    if (tilesTable.length >= props.data.game.challenge_count) {
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

  useEffect(() => {
    if (showResultModal) {
      setTimeout(() => {
        removeWillChange()
      }, 500)
    }
  }, [showResultModal])

  function addWillChange(): void {
    const tilesTableElement: HTMLElement = document.getElementsByClassName('tiles-table')[0] as HTMLElement
    tilesTableElement.style.willChange = 'transform'
  }

  function removeWillChange(): void{
    const tilesTableElement: HTMLElement = document.getElementsByClassName('tiles-table')[0] as HTMLElement
    tilesTableElement.style.willChange = 'auto'
  }

  function getWinPercent(): number{
    let winPercent: number = statistics.win / (statistics.win + statistics.lose) * 100
    if (isNaN(winPercent) || winPercent == Infinity) winPercent = 0
    return Math.round(winPercent)
  }

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
    const localePath = !locale || locale == 'en' ? '' : `/${locale}`
    const url = `${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_DOMAIN}${localePath}${router.asPath}`
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
    const no: string = locale == 'ja' ? `第${props.data.questionNo}回` : props.data.questionNo.toString()
    return `${props.data.game.title} ${no} ${guessTimes}/${props.data.game.challenge_count}\r\r${tiles}\r${url}`
  }

  function isClear(): boolean{
    const lastWord: string[] = tilesTable.length > 0 ? tilesTable[tilesTable.length - 1].map((tile) => tile.letter) : []
    return endedAt != null && lastWord.join('') == WORD_TODAY.join('')
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
    // Set CORRECT status
    for (let i = 0; i < tiles.length; i++) {
      if (WORD_TODAY[i] == tiles[i].letter) tiles[i].status = 'CORRECT'
    }
    const word_today_without_correct: string[] = tiles.map((tile, index) => {
      return tile.status == 'CORRECT' ? '' : WORD_TODAY[index]
    })
    // Set PRESENT and ABSENT status
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i].status != 'CORRECT') {
        if (word_today_without_correct.indexOf(tiles[i].letter) >= 0) {
          tiles[i].status = 'PRESENT'
        } else {
          tiles[i].status = 'ABSENT'
        }
      }
    }
    return tiles
  }

  function saveWordsState(wordsState: WordsState): void{
    window.localStorage.setItem(LOCAL_STORAGE_WORDS_STATE_KEY, JSON.stringify(wordsState))
  }

  function loadWordsState(): WordsState | null{
    const json = window.localStorage.getItem(LOCAL_STORAGE_WORDS_STATE_KEY)
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

  function saveStatistics(statistics: Statistics): void{
    window.localStorage.setItem(LOCAL_STORAGE_STATISTICS_KEY, JSON.stringify(statistics))
  }

  function loadStatistics(): Statistics | null{
    const json = window.localStorage.getItem(LOCAL_STORAGE_STATISTICS_KEY)
    return json ? JSON.parse(json) : null
  }

  function handleClickCopy(): void{
    copy(getResultText())
    alert.removeAll()
    alert.show(t.ALERT.COPIED, { type: 'success' })
  }

  function handleClickTweet(): void{
    window.open(`https://twitter.com/intent/tweet?text=${encodeURI(getResultText())}`, '_blank')
  }

  function handleClickHowToPlay(): void{
    showSlideoutMenuContext.set(false)
    setShowResultModal(false)
    setShowHowToPlayModal(true)
  }

  const handleOnKeyDown = useCallback((key: string) => {
    if (key == 'Info') handleClickHowToPlay()
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
        if (prevCurrentWord.length < props.data.game.char_count) {
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
        } else if (prevCurrentWord.length != props.data.game.char_count) {
          reject(SetCurrentWordStatus.NotEnoughLetters)
          return prevCurrentWord
        } else if (!props.data.wordList.includes(prevCurrentWord.join(''))) {
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

  function createTilesTableComponent(): JSX.Element{
    const rowComponents: JSX.Element[] = []
    for (let i = 0; i < props.data.game.challenge_count; i++){
      // Set tiles
      const row: JSX.Element[] = []
      for (let j = 0; j < props.data.game.char_count; j++){
        let tile: Tile = { letter: '', status: 'EMPTY' }
        // When the row already exists
        if (tilesTable[i] && tilesTable[i][j]) tile = tilesTable[i][j]
        // When the row is located below the last row
        if (tilesTable.length == i && currentWord[j]) tile.letter = currentWord[j]
        row.push(<TileComponent key={`${i}-${j}`} tile={tile} index={j} />)
      }
      rowComponents.push(<div key={i} className='tiles-table-row'>{row}</div>)
    }
    return <div className='tiles-table'>{rowComponents}</div>
  }

  function createKeyboardComponent(): JSX.Element{
    return props.data.game.lang == 'en' ? <EnKeyboard tilesTable={tilesTable} handleOnClick={handleOnKeyDown} /> : <JaKeyboard tilesTable={tilesTable} handleOnClick={handleOnKeyDown} />
  }

  return (
    <main id='main'>
      <Head>
        <title>{`${props.data.game.title} | ${t.APP_NAME}`}</title>
        <meta name="description" content={props.data.game.desc ? props.data.game.desc : t.APP_DESC.FIRST_LINE + t.APP_DESC.SECOND_LINE} />
      </Head>

      <SlideoutMenu />

      {/* How to Play Modal */}
      <Modal showModal={showHowToPlayModal} setShowModal={setShowHowToPlayModal}>
        <div className='modal-window-container'>
          {/* Header */}
          <div className='modal-window-header' style={{ position: 'relative' }}>
            {t.SLIDEOUT_MENU.HOW_TO_PLAY}
            <FontAwesomeIcon icon={faXmark} className='modal-window-header-xmark' onClick={() => setShowHowToPlayModal(false)} />
          </div>
          {/* Body */}
          <div className='modal-window-body'>
            <div className='howtoplay'>
              {/* Title */}
              <label className='howtoplay-label'>{t.GAME.TITLE}:</label>
              <div className='howtoplay-text'>{props.data.game.title}</div>
              {/* Desc */}
              <label className='howtoplay-label'>{t.GAME.DESC}:</label>
              <div className='howtoplay-text'>{props.data.game.desc}</div>
              {/* Attrs */}
              <div className='howtoplay-attrs'>
                <div className='howtoplay-attrs-item'>
                  <label className='howtoplay-label'>{t.GAME_IDEX.LANGUAGE}:</label>
                  <div className='howtoplay-text'>{props.data.game.lang == 'ja' ? t.LANG.JA : t.LANG.EN}</div>
                </div>
                <div className='howtoplay-attrs-item'>
                  <label className='howtoplay-label'>{t.GAME_IDEX.WORD_COUNT}:</label>
                  <div className='howtoplay-text'>{props.data.game.words_count}</div>
                </div>
                <div className='howtoplay-attrs-item'>
                  <label className='howtoplay-label'>{t.GAME_IDEX.CHARACTER_COUNT}:</label>
                  <div className='howtoplay-text'>{props.data.game.char_count}</div>
                </div>
                <div className='howtoplay-attrs-item'>
                  <label className='howtoplay-label'>{t.GAME_IDEX.CHALLENGE_COUNT}:</label>
                  <div className='howtoplay-text'>{props.data.game.challenge_count}</div>
                </div>
              </div>
              {/* Basic Rules */}
              <label className='howtoplay-label'>{t.GAMES.HOW_TO_PLAY.BASIC_RULES}:</label>
              {/* 1 */}
              <div className='example-word'>
                <div className='example-word-tile-empty'> </div>
                <div className='example-word-tile-empty'> </div>
                <div className='example-word-tile-empty'> </div>
                <div className='example-word-tile-empty'> </div>
                <div className='example-word-tile-empty'> </div>
              </div>
              <div className='example-text'>
                <div className='example-text-number'>1.</div>{t.GAMES.HOW_TO_PLAY.RULE_1}
              </div>
              {/* 2 */}
              <div className='example-word'>
                <div className='example-word-tile-correct'>C</div>
                <div className='example-word-tile-absent'>L</div>
                <div className='example-word-tile-absent'>O</div>
                <div className='example-word-tile-absent'>T</div>
                <div className='example-word-tile-absent'>H</div>
              </div>
              <div className='example-text'>
                <div className='example-text-number'>2.</div>{t.GAMES.HOW_TO_PLAY.RULE_2}
              </div>
              {/* 3 */}
              <div className='example-word'>
                <div className='example-word-tile-correct'>C</div>
                <div className='example-word-tile-absent'>H</div>
                <div className='example-word-tile-present'>A</div>
                <div className='example-word-tile-absent'>I</div>
                <div className='example-word-tile-absent'>R</div>
              </div>
              <div className='example-text'>
                <div className='example-text-number'>3.</div>{t.GAMES.HOW_TO_PLAY.RULE_3}
              </div>
              {/* 4 */}
              <div className='example-word'>
                <div className='example-word-tile-correct'>C</div>
                <div className='example-word-tile-correct'>A</div>
                <div className='example-word-tile-correct'>N</div>
                <div className='example-word-tile-correct'>D</div>
                <div className='example-word-tile-correct'>Y</div>
              </div>
              <div className='example-text'>
                <div className='example-text-number'>4.</div>{t.GAMES.HOW_TO_PLAY.RULE_4}
              </div>
            </div>
          </div>
          {/* Close */}
          <div className='modal-window-footer'>
            <button className='btn btn-default' onClick={() => setShowHowToPlayModal(false)}>{ t.COMMON.CLOSE }</button>
          </div>
        </div>
      </Modal>

      {/* Result Modal */}
      <Modal showModal={showResultModal} setShowModal={setShowResultModal}>
        <div className='modal-window-container'>
          <div className='modal-window-header' style={{position: 'relative'}}>
            <div style={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center' }}>{isClear() ? '👑 YOU WON 👑' : 'YOU LOSE'}</div>
            <FontAwesomeIcon icon={faXmark} className='xmark' style={{ position: 'absolute', top: '15px', right: '15px'}} onClick={() => setShowResultModal(false)} />
          </div>
          <div className='modal-window-body'>
            {/* Answer */}
            {(() => {
              if (!isClear()) {
                return (
                  <div className='answer'>
                    <div className='answer-label'>{t.GAMES.RESULT.ANSWER}</div>
                    <div className='answer-value'>{WORD_TODAY.join('')}</div>
                  </div>
                )
              }
            })()}
            {/* Statistics */}
            <div className='statistics'>
              <div className='statistic'>
                <div className='statistic-value'>{statistics.win + statistics.lose}</div>
                <div className='statistic-label'>{t.GAMES.RESULT.PLAYED}</div>
              </div>
              <div className='statistic'>
                <div className='statistic-value'>{getWinPercent()}</div>
                <div className='statistic-label'>{t.GAMES.RESULT.WIN}</div>
              </div>
              <div className='statistic'>
                <div className='statistic-value'>{statistics.currentStreak}</div>
                <div className='statistic-label'>{t.GAMES.RESULT.CURRENT_STREAK}</div>
              </div>
              <div className='statistic'>
                <div className='statistic-value'>{statistics.maxStreak}</div>
                <div className='statistic-label'>{t.GAMES.RESULT.MAX_STREAK}</div>
              </div>
            </div>
            {/* Timers */}
            <div className='timers'>
              <div className='timer'>
                <div className='timer-label'>{t.GAMES.RESULT.GAME_TIME}</div>
                <div className='timer-clock'>{getGuessTime()}</div>
              </div>
              <NextGameTimer />
            </div>
          </div>
          <div className='modal-window-footer'>
            {/* Shares */}
            <div className='shares'>
              <div className='share-copy' onClick={handleClickCopy}>
                <FontAwesomeIcon icon={faCopy} />{t.COMMON.COPY}
              </div>
              <div className='share-tweet' onClick={handleClickTweet}>
                <FontAwesomeIcon icon={faTwitter} />Tweet
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <div className='games'>
        <div className='games-main'>{createTilesTableComponent()}</div>
        <div className='games-keyboard'>{createKeyboardComponent()}</div>
      </div>
    </main>
  )
}

export default Games
