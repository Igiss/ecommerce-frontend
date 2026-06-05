import { proxy } from 'valtio'

export const customizerState = proxy({
  baseColor: '#f7f1e8',
  accentColor: '#30343f',
  designImage: '',
  designName: 'My cup design',
  printX: 512,
  printY: 610,
  printSize: 520
})
