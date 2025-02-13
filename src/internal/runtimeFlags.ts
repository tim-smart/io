import type * as RuntimeFlags from "@effect/io/Fiber/Runtime/Flags"
import type * as RuntimeFlagsPatch from "@effect/io/Fiber/Runtime/Flags/Patch"
import * as runtimeFlagsPatch from "@effect/io/internal/runtimeFlagsPatch"
import * as Differ from "@fp-ts/data/Differ"

/** @internal */
export const None: RuntimeFlags.RuntimeFlag = 0 as RuntimeFlags.RuntimeFlag

/** @internal */
export const Interruption: RuntimeFlags.RuntimeFlag = 1 << 0 as RuntimeFlags.RuntimeFlag

/** @internal */
export const CurrentFiber: RuntimeFlags.RuntimeFlag = 1 << 1 as RuntimeFlags.RuntimeFlag

/** @internal */
export const OpSupervision: RuntimeFlags.RuntimeFlag = 1 << 2 as RuntimeFlags.RuntimeFlag

/** @internal */
export const RuntimeMetrics: RuntimeFlags.RuntimeFlag = 1 << 3 as RuntimeFlags.RuntimeFlag

/** @internal */
export const FiberRoots: RuntimeFlags.RuntimeFlag = 1 << 4 as RuntimeFlags.RuntimeFlag

/** @internal */
export const WindDown: RuntimeFlags.RuntimeFlag = 1 << 5 as RuntimeFlags.RuntimeFlag

/** @internal */
export const CooperativeYielding: RuntimeFlags.RuntimeFlag = 1 << 6 as RuntimeFlags.RuntimeFlag

/** @internal */
export const allFlags: ReadonlyArray<RuntimeFlags.RuntimeFlag> = [
  None,
  Interruption,
  CurrentFiber,
  OpSupervision,
  RuntimeMetrics,
  FiberRoots,
  WindDown,
  CooperativeYielding
]

/** @internal */
export const cooperativeYielding = (self: RuntimeFlags.RuntimeFlags): boolean => {
  return isEnabled(CooperativeYielding)(self)
}

/** @internal */
export const disable = (flag: RuntimeFlags.RuntimeFlag) => {
  return (self: RuntimeFlags.RuntimeFlags): RuntimeFlags.RuntimeFlags => (self & ~flag) as RuntimeFlags.RuntimeFlags
}

/** @internal */
export const disableAll = (flags: RuntimeFlags.RuntimeFlags) => {
  return (self: RuntimeFlags.RuntimeFlags): RuntimeFlags.RuntimeFlags => (self & ~flags) as RuntimeFlags.RuntimeFlags
}

/** @internal */
export const enable = (flag: RuntimeFlags.RuntimeFlag) => {
  return (self: RuntimeFlags.RuntimeFlags): RuntimeFlags.RuntimeFlags => (self | flag) as RuntimeFlags.RuntimeFlags
}

/** @internal */
export const enableAll = (flags: RuntimeFlags.RuntimeFlags) => {
  return (self: RuntimeFlags.RuntimeFlags): RuntimeFlags.RuntimeFlags => (self | flags) as RuntimeFlags.RuntimeFlags
}

/** @internal */
export const currentFiber = (self: RuntimeFlags.RuntimeFlags): boolean => {
  return isEnabled(CurrentFiber)(self)
}

/** @internal */
export const fiberRoots = (self: RuntimeFlags.RuntimeFlags): boolean => {
  return isEnabled(FiberRoots)(self)
}

/** @internal */
export const interruptible = (self: RuntimeFlags.RuntimeFlags): boolean => {
  return interruption(self) && !windDown(self)
}

/** @internal */
export const interruption = (self: RuntimeFlags.RuntimeFlags): boolean => {
  return isEnabled(Interruption)(self)
}

/** @internal */
export const isDisabled = (flag: RuntimeFlags.RuntimeFlag) => {
  return (self: RuntimeFlags.RuntimeFlags): boolean => !isEnabled(flag)(self)
}

/** @internal */
export const isEnabled = (flag: RuntimeFlags.RuntimeFlag) => {
  return (self: RuntimeFlags.RuntimeFlags): boolean => (self & flag) !== 0
}

/** @internal */
export const make = (...flags: ReadonlyArray<RuntimeFlags.RuntimeFlag>): RuntimeFlags.RuntimeFlags => {
  return flags.reduce((a, b) => a | b, 0) as RuntimeFlags.RuntimeFlags
}

/** @internal */
export const none: RuntimeFlags.RuntimeFlags = make(None)

/** @internal */
export const opSupervision = (self: RuntimeFlags.RuntimeFlags): boolean => {
  return isEnabled(OpSupervision)(self)
}

/** @internal */
export const render = (self: RuntimeFlags.RuntimeFlags): string => {
  const active: Array<string> = []
  allFlags.forEach((flag) => {
    if (isEnabled(flag)(self)) {
      active.push(`${flag}`)
    }
  })
  return `RuntimeFlags(${active.join(", ")})`
}

/** @internal */
export const runtimeMetrics = (self: RuntimeFlags.RuntimeFlags): boolean => {
  return isEnabled(RuntimeMetrics)(self)
}

/** @internal */
export const toSet = (self: RuntimeFlags.RuntimeFlags): ReadonlySet<RuntimeFlags.RuntimeFlag> => {
  return new Set(allFlags.filter((flag) => isEnabled(flag)(self)))
}

export const windDown = (self: RuntimeFlags.RuntimeFlags): boolean => {
  return isEnabled(WindDown)(self)
}

// circular with RuntimeFlagsPatch

/** @internal */
export const enabledSet = (self: RuntimeFlagsPatch.RuntimeFlagsPatch): ReadonlySet<RuntimeFlags.RuntimeFlag> => {
  return toSet((runtimeFlagsPatch.active(self) & runtimeFlagsPatch.enabled(self)) as RuntimeFlags.RuntimeFlags)
}

/** @internal */
export const disabledSet = (self: RuntimeFlagsPatch.RuntimeFlagsPatch): ReadonlySet<RuntimeFlags.RuntimeFlag> => {
  return toSet((runtimeFlagsPatch.active(self) & ~runtimeFlagsPatch.enabled(self)) as RuntimeFlags.RuntimeFlags)
}

/** @internal */
export const diff = (that: RuntimeFlags.RuntimeFlags) => {
  return (self: RuntimeFlags.RuntimeFlags): RuntimeFlagsPatch.RuntimeFlagsPatch => {
    return runtimeFlagsPatch.make(self ^ that, that)
  }
}

/** @internal */
export const patch = (patch: RuntimeFlagsPatch.RuntimeFlagsPatch) => {
  return (self: RuntimeFlags.RuntimeFlags): RuntimeFlags.RuntimeFlags => {
    return (
      (self & (runtimeFlagsPatch.invert(runtimeFlagsPatch.active(patch)) | runtimeFlagsPatch.enabled(patch))) |
      (runtimeFlagsPatch.active(patch) & runtimeFlagsPatch.enabled(patch))
    ) as RuntimeFlags.RuntimeFlags
  }
}

/** @internal */
const renderFlag = (a: RuntimeFlags.RuntimeFlag): string => {
  return `${allFlags.find((b) => a === b)!}`
}

/** @internal */
export const renderPatch = (self: RuntimeFlagsPatch.RuntimeFlagsPatch): string => {
  const enabled = Array.from(enabledSet(self))
    .map((flag) => renderFlag(flag))
    .join(", ")
  const disabled = Array.from(disabledSet(self))
    .map((flag) => renderFlag(flag))
    .join(", ")
  return `RuntimeFlagsPatch(enabled = (${enabled}), disabled = (${disabled}))`
}

/** @internal */
export const differ = (): Differ.Differ<RuntimeFlags.RuntimeFlags, RuntimeFlagsPatch.RuntimeFlagsPatch> => {
  return Differ.make({
    empty: runtimeFlagsPatch.empty,
    diff: (oldValue, newValue) => diff(newValue)(oldValue),
    combine: (first, second) => runtimeFlagsPatch.andThen(second)(first),
    patch: (_patch, oldValue) => patch(_patch)(oldValue)
  })
}
