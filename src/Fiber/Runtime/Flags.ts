/**
 * @since 1.0.0
 */

import type * as RuntimeFlagsPatch from "@effect/io/Fiber/Runtime/Flags/Patch"
import * as circular from "@effect/io/internal/layer/circular"
import * as internal from "@effect/io/internal/runtimeFlags"
import type * as Layer from "@effect/io/Layer"
import type * as Differ from "@fp-ts/data/Differ"

/**
 * Represents a set of `RuntimeFlag`s. `RuntimeFlag`s affect the operation of
 * the Effect runtime system. They are exposed to application-level code because
 * they affect the behavior and performance of application code.
 *
 * @since 1.0.0
 * @category models
 */
export type RuntimeFlags = number & {
  readonly RuntimeFlags: unique symbol
}

/**
 * Represents a flag that can be set to enable or disable a particular feature
 * of the Effect runtime.
 *
 * @since 1.0.0
 * @category models
 */
export type RuntimeFlag = number & {
  readonly RuntimeFlag: unique symbol
}

/**
 * No runtime flags.
 *
 * @since 1.0.0
 * @category constructors
 */
export const None: RuntimeFlag = internal.None

/**
 * The interruption flag determines whether or not the Effect runtime system will
 * interrupt a fiber.
 *
 * @since 1.0.0
 * @category constructors
 */
export const Interruption: RuntimeFlag = internal.Interruption

/**
 * The current fiber flag determines whether or not the Effect runtime system
 * will store the current fiber whenever a fiber begins executing. Use of this
 * flag will negatively impact performance, but is essential when tracking the
 * current fiber is necessary.
 *
 * @since 1.0.0
 * @category constructors
 */
export const CurrentFiber: RuntimeFlag = internal.CurrentFiber

/**
 * The op supervision flag determines whether or not the Effect runtime system
 * will supervise all operations of the Effect runtime. Use of this flag will
 * negatively impact performance, but is required for some operations, such as
 * profiling.
 *
 * @since 1.0.0
 * @category constructors
 */
export const OpSupervision: RuntimeFlag = internal.OpSupervision

/**
 * The runtime metrics flag determines whether or not the Effect runtime system
 * will collect metrics about the Effect runtime. Use of this flag will have a
 * very small negative impact on performance, but generates very helpful
 * operational insight into running Effect applications that can be exported to
 * Prometheus or other tools via Effect Metrics.
 *
 * @since 1.0.0
 * @category constructors
 */
export const RuntimeMetrics: RuntimeFlag = internal.RuntimeMetrics

/**
 * The fiber roots flag determines whether or not the Effect runtime system will
 * keep track of all fiber roots. Use of this flag will negatively impact
 * performance, but is required for the fiber dumps functionality.
 *
 * @since 1.0.0
 * @category constructors
 */
export const FiberRoots: RuntimeFlag = internal.FiberRoots

/**
 * The wind down flag determines whether the Effect runtime system will execute
 * effects in wind-down mode. In wind-down mode, even if interruption is
 * enabled and a fiber has been interrupted, the fiber will continue its
 * execution uninterrupted.
 *
 * @since 1.0.0
 * @category constructors
 */
export const WindDown: RuntimeFlag = internal.WindDown

/**
 * The cooperative yielding flag determines whether the Effect runtime will
 * yield to another fiber.
 *
 * @since 1.0.0
 * @category constructors
 */
export const CooperativeYielding: RuntimeFlag = internal.CooperativeYielding

/**
 * Returns `true` if the `CooperativeYielding` `RuntimeFlag` is enabled, `false`
 * otherwise.
 *
 * @since 1.0.0
 * @category getters
 */
export const cooperativeYielding: (self: RuntimeFlags) => boolean = internal.cooperativeYielding

/**
 * Returns `true` if the `CurrentFiber` `RuntimeFlag` is enabled, `false`
 * otherwise.
 *
 * @since 1.0.0
 * @category getters
 */
export const currentFiber: (self: RuntimeFlags) => boolean = internal.currentFiber

/**
 * Creates a `RuntimeFlagsPatch` which describes the difference between `self`
 * and `that`.
 *
 * @since 1.0.0
 * @category diffing
 */
export const diff: (that: RuntimeFlags) => (self: RuntimeFlags) => RuntimeFlagsPatch.RuntimeFlagsPatch = internal.diff

/**
 * Constructs a differ that knows how to diff `RuntimeFlags` values.
 *
 * @since 1.0.0
 * @category mutations
 */
export const differ: () => Differ.Differ<RuntimeFlags, RuntimeFlagsPatch.RuntimeFlagsPatch> = internal.differ

/**
 * Disables the specified `RuntimeFlag`.
 *
 * @since 1.0.0
 * @category mutations
 */
export const disable: (flag: RuntimeFlag) => (self: RuntimeFlags) => RuntimeFlags = internal.disable

/**
 * Disables all of the `RuntimeFlag`s in the specified set of `RuntimeFlags`.
 *
 * @since 1.0.0
 * @category mutations
 */
export const disableAll: (flags: RuntimeFlags) => (self: RuntimeFlags) => RuntimeFlags = internal.disableAll

/**
 * @since 1.0.0
 * @category environment
 */
export const disableCooperativeYielding: () => Layer.Layer<never, never, never> = circular.disableCooperativeYielding

/**
 * @since 1.0.0
 * @category environment
 */
export const disableCurrentFiber: () => Layer.Layer<never, never, never> = circular.disableCurrentFiber

/**
 * @since 1.0.0
 * @category environment
 */
export const disableFiberRoots: () => Layer.Layer<never, never, never> = circular.disableFiberRoots

/**
 * @since 1.0.0
 * @category environment
 */
export const disableInterruption: () => Layer.Layer<never, never, never> = circular.disableInterruption

/**
 * @since 1.0.0
 * @category environment
 */
export const disableOpSupervision: () => Layer.Layer<never, never, never> = circular.disableOpSupervision

/**
 * @since 1.0.0
 * @category environment
 */
export const disableRuntimeMetrics: () => Layer.Layer<never, never, never> = circular.disableRuntimeMetrics

/**
 * @since 1.0.0
 * @category environment
 */
export const disableWindDown: () => Layer.Layer<never, never, never> = circular.disableWindDown

/**
 * Enables the specified `RuntimeFlag`.
 *
 * @since 1.0.0
 * @category mutations
 */
export const enable: (flag: RuntimeFlag) => (self: RuntimeFlags) => RuntimeFlags = internal.enable

/**
 * Enables all of the `RuntimeFlag`s in the specified set of `RuntimeFlags`.
 *
 * @since 1.0.0
 * @category mutations
 */
export const enableAll: (flags: RuntimeFlags) => (self: RuntimeFlags) => RuntimeFlags = internal.enableAll

/**
 * @since 1.0.0
 * @category environment
 */
export const enableCooperativeYielding: () => Layer.Layer<never, never, never> = circular.enableCooperativeYielding

/**
 * @since 1.0.0
 * @category environment
 */
export const enableCurrentFiber: () => Layer.Layer<never, never, never> = circular.enableCurrentFiber

/**
 * @since 1.0.0
 * @category environment
 */
export const enableFiberRoots: () => Layer.Layer<never, never, never> = circular.enableFiberRoots

/**
 * @since 1.0.0
 * @category environment
 */
export const enableInterruption: () => Layer.Layer<never, never, never> = circular.enableInterruption

/**
 * @since 1.0.0
 * @category environment
 */
export const enableOpSupervision: () => Layer.Layer<never, never, never> = circular.enableOpSupervision

/**
 * @since 1.0.0
 * @category environment
 */
export const enableRuntimeMetrics: () => Layer.Layer<never, never, never> = circular.enableRuntimeMetrics

/**
 * @since 1.0.0
 * @category environment
 */
export const enableWindDown: () => Layer.Layer<never, never, never> = circular.enableWindDown

/**
 * Returns `true` if the `FiberRoots` `RuntimeFlag` is enabled, `false`
 * otherwise.
 *
 * @since 1.0.0
 * @category getters
 */
export const fiberRoots: (self: RuntimeFlags) => boolean = internal.fiberRoots

/**
 * Returns true only if the `Interruption` flag is **enabled** and the
 * `WindDown` flag is **disabled**.
 *
 * A fiber is said to be interruptible if interruption is enabled and the fiber
 * is not in its wind-down phase, in which it takes care of cleanup activities
 * related to fiber shutdown.
 *
 * @since 1.0.0
 * @category getters
 */
export const interruptible: (self: RuntimeFlags) => boolean = internal.interruptible

/**
 * Returns `true` if the `Interruption` `RuntimeFlag` is enabled, `false`
 * otherwise.
 *
 * @since 1.0.0
 * @category getters
 */
export const interruption: (self: RuntimeFlags) => boolean = internal.interruption

/**
 * Returns `true` if the specified `RuntimeFlag` is enabled, `false` otherwise.
 *
 * @since 1.0.0
 * @category elements
 */
export const isEnabled: (flag: RuntimeFlag) => (self: RuntimeFlags) => boolean = internal.isEnabled

/**
 * Returns `true` if the specified `RuntimeFlag` is disabled, `false` otherwise.
 *
 * @since 1.0.0
 * @category elements
 */
export const isDisabled: (flag: RuntimeFlag) => (self: RuntimeFlags) => boolean = internal.isDisabled

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: (...flags: ReadonlyArray<RuntimeFlag>) => RuntimeFlags = internal.make

/**
 * @since 1.0.0
 * @category constructors
 */
export const none: RuntimeFlags = internal.none

/**
 * Returns `true` if the `OpSupervision` `RuntimeFlag` is enabled, `false`
 * otherwise.
 *
 * @since 1.0.0
 * @category getters
 */
export const opSupervision: (self: RuntimeFlags) => boolean = internal.opSupervision

/**
 * Patches a set of `RuntimeFlag`s with a `RuntimeFlagsPatch`, returning the
 * patched set of `RuntimeFlag`s.
 *
 * @since 1.0.0
 * @category mutations
 */
export const patch: (patch: RuntimeFlagsPatch.RuntimeFlagsPatch) => (self: RuntimeFlags) => RuntimeFlags =
  internal.patch

/**
 * Converts the provided `RuntimeFlags` into a `string`.
 *
 * @category conversions
 * @since 1.0.0
 */
export const render: (self: RuntimeFlags) => string = internal.render

/**
 * Returns `true` if the `RuntimeMetrics` `RuntimeFlag` is enabled, `false`
 * otherwise.
 *
 * @since 1.0.0
 * @category getters
 */
export const runtimeMetrics: (self: RuntimeFlags) => boolean = internal.runtimeMetrics

/**
 * Converts the provided `RuntimeFlags` into a `ReadonlySet<number>`.
 *
 * @category conversions
 * @since 1.0.0
 */
export const toSet: (self: RuntimeFlags) => ReadonlySet<RuntimeFlag> = internal.toSet

/**
 * Returns `true` if the `WindDown` `RuntimeFlag` is enabled, `false`
 * otherwise.
 *
 * @since 1.0.0
 * @category getters
 */
export const windDown: (self: RuntimeFlags) => boolean = internal.windDown
