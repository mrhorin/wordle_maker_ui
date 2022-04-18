import { createContext } from 'react'
import { Chip } from 'types/global'

const ChipsContext = createContext({} as {
  chips: Chip[],
  addChips: (inputList: string[]) => void,
  removeChip: (index: number) => void,
  updateChip: (index: number, value: string) => void,
})

export default ChipsContext
