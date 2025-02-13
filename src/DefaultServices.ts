/**
 * @since 1.0.0
 */
import type * as Clock from "@effect/io/Clock"
import type * as FiberRef from "@effect/io/FiberRef"
import * as internal from "@effect/io/internal/defaultServices"
import type * as Random from "@effect/io/Random"
import type * as Context from "@fp-ts/data/Context"

/**
 * @since 1.0.0
 * @category models
 */
export type DefaultServices = Clock.Clock | Random.Random

/**
 * @since 1.0.0
 * @category constructors
 */
export const liveServices: Context.Context<DefaultServices> = internal.liveServices

/**
 * @since 1.0.0
 * @category fiberRefs
 */
export const currentServices: FiberRef.FiberRef<Context.Context<DefaultServices>> = internal.currentServices
