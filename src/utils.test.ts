import { styleToFragment } from './utils'

describe('styleToFragment', () => {
   it('preserves supported text styles', () => {
      expect(
         styleToFragment(
            { textAlign: 'center', textDecorationStyle: 'dashed' },
            true
         )
      ).toEqual({ textAlign: 'center', textDecorationStyle: 'dashed' })
   })

   it('rejects logical text alignment values that NitroText cannot render', () => {
      expect(() => styleToFragment({ textAlign: 'start' }, true)).toThrow(
         'NitroText does not support textAlign "start"'
      )
   })

   it('rejects wavy text decoration that NitroText cannot render', () => {
      expect(() =>
         styleToFragment({ textDecorationStyle: 'wavy' }, true)
      ).toThrow('NitroText does not support textDecorationStyle "wavy"')
   })
})
