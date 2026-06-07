import { create } from 'zustand'

interface CustomizerState {
  baseColor: string
  accentColor: string
  designImage: string
  designName: string
  printX: number
  printY: number
  printSize: number
}

export const useCustomizerStore = create<CustomizerState>(() => ({
  baseColor: '#f7f1e8',
  accentColor: '#30343f',
  designImage: '',
  designName: 'My cup design',
  printX: 512,
  printY: 610,
  printSize: 520
}))
