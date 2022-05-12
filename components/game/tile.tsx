import { memo } from 'react'
import { Tile } from 'types/global'

interface Props{
  tile: Tile,
  index: number;
}

const Tile = ({ tile, index }: Props) => {
  let classes = 'words-row-tile'
  if (tile.status == 'CORRECT') classes += ' words-row-tile-correct'
  if (tile.status == 'PRESENT') classes += ' words-row-tile-present'
  if (tile.status == 'ABSENT') classes += ' words-row-tile-absent'
  const delay = index * 0.1
  const style = {
    transition: `background 0s linear ${delay + 0.5}s, border 0s linear ${delay + 0.5}s`,
    animationDelay: '0s'
  }
  // Add animation-delay property for @keyframes transform-tile in global.scss
  if (tile.status != 'EMPTY') style.animationDelay = `${delay}s`
  return <div className={classes} style={style}>{tile.letter}</div>
}

export default memo(Tile, (prevProps, nextProps) => {
  return prevProps.tile.letter == nextProps.tile.letter &&
    prevProps.tile.status == nextProps.tile.status
})