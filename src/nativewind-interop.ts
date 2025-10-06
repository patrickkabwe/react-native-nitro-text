type NativeWindInteropModule = {
  useNativeWindProps?: <TProps>(props: TProps) => TProps
  cssInterop?: (component: unknown, config: Record<string, unknown>) => void
}

let cachedModule: NativeWindInteropModule | null | undefined

function getNativeWindModule(): NativeWindInteropModule | null | undefined {
  if (cachedModule !== undefined) {
    return cachedModule
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    cachedModule = require('nativewind') as NativeWindInteropModule
  } catch (_error) {
    cachedModule = null
  }

  return cachedModule
}

export function useNativeWindResolvedProps<TProps>(props: TProps): TProps {
  const module = getNativeWindModule()
  if (module?.useNativeWindProps) {
    return module.useNativeWindProps(props)
  }
  return props
}

const registeredComponents = new WeakSet<object>()

export function ensureNativeWindInterop(component: unknown) {
  const module = getNativeWindModule()
  if (!module?.cssInterop) return

  if (component === null) return
  const target = (typeof component === 'object' || typeof component === 'function')
    ? (component as object)
    : undefined

  if (!target || registeredComponents.has(target)) {
    return
  }

  module.cssInterop(component, {
    className: { target: 'style' },
  })

  registeredComponents.add(target)
}
