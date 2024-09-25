import { memo } from 'react'
import { Tile } from 'types/global'

interface Props{
  tile: Tile,
  index: number;
}

const LargeTile = ({ tile, index }: Props) => {
  let classes = 'tiles-table-row-tile'
  if (tile.status == 'CORRECT') classes += ' tiles-table-row-tile-correct'
  if (tile.status == 'PRESENT') classes += ' tiles-table-row-tile-present'
  if (tile.status == 'ABSENT') classes += ' tiles-table-row-tile-absent'
  if(tile.status == 'EMPTY') classes += ' tiles-table-row-tile-empty'
  const delay = index * 0.1
  const style = {
    transition: `background 0s linear ${delay + 0.5}s, border 0s linear ${delay + 0.5}s`,
    animationDelay: '0s'
  }
  // Add animation-delay property for @keyframes transform-tile in global.scss
  if (tile.status != 'EMPTY') style.animationDelay = `${delay}s`
  return <div className={classes} style={style}>{tile.letter}</div>
}

export default memo(LargeTile, (prevProps, nextProps) => {
  return prevProps.tile.letter == nextProps.tile.letter &&
    prevProps.tile.status == nextProps.tile.status
})