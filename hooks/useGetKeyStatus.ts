import type { Tile, TileStatus } from 'types/global'

// useGetKeyStatus
export default () => {
  const PRIORITY = {
    'EMPTY': 0,
    'PRESENT': 1,
    'ABSENT': 2,
    'CORRECT': 2,
  }

  const getKeyStatus = (letter: string, tilesTable: Tile[][]): TileStatus => {
    let status: TileStatus = 'EMPTY'
    for (let i = 0; i < tilesTable.length; i++){
      // Columns
      for (let j = 0; j < tilesTable[i].length; j++) {
        // Rows
        const currentTile: Tile = tilesTable[i][j]
        if (currentTile.letter == letter) {
          if (currentTile.status == 'CORRECT' || currentTile.status == 'ABSENT') {
            status = currentTile.status
            break
          } else if (currentTile.status == 'PRESENT' && status == 'EMPTY') {
            status = currentTile.status
          }
        }
      }
      if (status == 'CORRECT' || status == 'ABSENT') break
    }
    return status
  }

  return getKeyStatus
}
