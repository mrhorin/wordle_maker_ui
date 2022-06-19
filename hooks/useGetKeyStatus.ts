import type { Tile, TileStatus } from 'types/global'

// useGetKeyStatus
export default () => {
  const getKeyStatus = (letter: string, tilesTable: Tile[][]): TileStatus => {
    let status: TileStatus = 'EMPTY'
    for (let i = 0; i < tilesTable.length; i++){
      for (let j = 0; j < tilesTable[i].length; j++) {
        if (tilesTable[i][j].letter == letter) status = tilesTable[i][j].status
      }
    }
    return status
  }

  return getKeyStatus
}
