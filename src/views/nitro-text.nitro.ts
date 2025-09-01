import type {
  HybridView,
  HybridViewProps,
  HybridViewMethods,
} from 'react-native-nitro-modules'

export interface NitroTextProps extends HybridViewProps {
   isRed: boolean
}

export interface NitroTextMethods extends HybridViewMethods {}

export type NitroText = HybridView<NitroTextProps, NitroTextMethods, { ios: 'swift' }>