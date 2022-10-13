import type { Game } from 'types/global'

import useLocale from 'hooks/useLocale'

type Props = {
  game: Game,
  titleElement: JSX.Element,
}

const GameIndexItem = (props: Props) => {
  const { t } = useLocale()

  return (
    <div className='game-index-item'>
      {/* Title */}
      <div className='game-index-item-title'>
        {(() => {
          if (props.game.is_suspended) {
            return (
              <span className='game-index-item-title-lock'>🔒 {props.game.title}</span>
            )
          } else {
            return props.titleElement
          }
        })()}
      </div>
      {/* Description */}
      <div className='game-index-item-desc'>
        {(() => {
          if (props.game.is_suspended) {
            return t.MY_GAMES.EDIT.INDEX.SUSPENDED_GAME
          } else {
            return props.game.desc
          }
        })()}
      </div>
      <div className='game-index-item-attrs'>
        {/* Language */}
        <div className='game-index-item-attrs-item'>
          <div className='game-index-item-attrs-item-label'>{ t.GAME_IDEX.LANGUAGE }</div>
          <div className='game-index-item-attrs-item-value'>{props.game.lang == 'ja' ? t.LANG.JA : t.LANG.EN}</div>
        </div>
        {/* Words count */}
        <div className='game-index-item-attrs-item'>
          <div className='game-index-item-attrs-item-label'>{ t.GAME_IDEX.WORD_COUNT }</div>
          <div className='game-index-item-attrs-item-value'>{props.game.words_count}</div>
        </div>
        {/* Character count */}
        <div className='game-index-item-attrs-item'>
          <div className='game-index-item-attrs-item-label'>{ t.GAME_IDEX.CHARACTER_COUNT }</div>
          <div className='game-index-item-attrs-item-value'>{props.game.char_count}</div>
        </div>
        {/* Challenge count */}
        <div className='game-index-item-attrs-item'>
          <div className='game-index-item-attrs-item-label'>{ t.GAME.CHALLENGE_COUNT }</div>
          <div className='game-index-item-attrs-item-value'>{props.game.challenge_count}</div>
        </div>
      </div>
    </div>
  )
}

export default GameIndexItem
