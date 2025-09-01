import { getHostComponent, type HybridRef } from 'react-native-nitro-modules'
import NitroTextConfig from '../nitrogen/generated/shared/json/NitroTextConfig.json'
import type {
  NitroTextProps,
  NitroTextMethods,
} from './views/nitro-text.nitro'


export const NitroText = getHostComponent<NitroTextProps, NitroTextMethods>(
  'NitroText',
  () => NitroTextConfig
)

export type NitroTextRef = HybridRef<NitroTextProps, NitroTextMethods>
