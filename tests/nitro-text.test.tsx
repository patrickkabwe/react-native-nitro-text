import { NitroText } from '../src/nitro-text'

jest.mock('react', () => {
   const actual = jest.requireActual<typeof import('react')>('react')

   return {
      ...actual,
      useCallback: <T,>(callback: T): T => callback,
      useContext: (): boolean => false,
      useMemo: <T,>(factory: () => T): T => factory(),
   }
})

jest.mock('react-native-nitro-modules', () => ({
   callback: <T,>(value: T): T => value,
   getHostComponent: () => 'MockNitroTextView',
}))

describe('NitroText', () => {
   it('passes HTML-like string children to the native text prop unchanged', () => {
      const element = NitroText({ children: '<strong>Fast text</strong>' })

      expect(element.type).toBe('MockNitroTextView')
      expect(element.props.text).toBe('<strong>Fast text</strong>')
      expect(element.props).not.toHaveProperty('fragments')
   })
})
