/**
 * @since 1.0.0
 */
import * as internal from "@effect/io/internal/schedule/interval"
import type * as Duration from "@fp-ts/data/Duration"
import type * as Option from "@fp-ts/data/Option"

/**
 * @since 1.0.0
 * @category symbols
 */
export const IntervalTypeId: unique symbol = internal.IntervalTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type IntervalTypeId = typeof IntervalTypeId

/**
 * An `Interval` represents an interval of time. Intervals can encompass all
 * time, or no time at all.
 *
 * @tsplus type effect/core/io/Interval/Interval
 * @since 1.0.0
 * @category models
 */
export interface Interval {
  readonly [IntervalTypeId]: IntervalTypeId
  readonly startMillis: number
  readonly endMillis: number
}

/**
 * Constructs a new interval from the two specified endpoints. If the start
 * endpoint greater than the end endpoint, then a zero size interval will be
 * returned.
 *
 * @since 1.0.0
 * @category constructors
 */
export const make: (startMillis: number, endMillis: number) => Interval = internal.make

/**
 * An `Interval` of zero-width.
 *
 * @since 1.0.0
 * @category constructors
 */
export const empty: Interval = internal.empty

/**
 * Returns `true` if this `Interval` is less than `that` interval, `false`
 * otherwise.
 *
 * @since 1.0.0
 * @category ordering
 */
export const lessThan: (that: Interval) => (self: Interval) => boolean = internal.lessThan

/**
 * Returns the minimum of two `Interval`s.
 *
 * @since 1.0.0
 * @category ordering
 */
export const min: (that: Interval) => (self: Interval) => Interval = internal.min

/**
 * Returns the maximum of two `Interval`s.
 *
 * @since 1.0.0
 * @category ordering
 */
export const max: (that: Interval) => (self: Interval) => Interval = internal.max

/**
 * Returns `true` if the specified `Interval` is empty, `false` otherwise.
 *
 * @since 1.0.0
 * @category ordering
 */
export const isEmpty: (self: Interval) => boolean = internal.isEmpty

/**
 * Returns `true` if the specified `Interval` is non-empty, `false` otherwise.
 *
 * @since 1.0.0
 * @category ordering
 */
export const isNonEmpty: (self: Interval) => boolean = internal.isNonEmpty

/**
 * Computes a new `Interval` which is the intersection of this `Interval` and
 * that `Interval`.
 *
 * @since 1.0.0
 * @category ordering
 */
export const intersect: (that: Interval) => (self: Interval) => Interval = internal.intersect

/**
 * Calculates the size of the `Interval` as the `Duration` from the start of the
 * interval to the end of the interval.
 *
 * @since 1.0.0
 * @category getters
 */
export const size: (self: Interval) => Duration.Duration = internal.size

/**
 * Computes a new `Interval` which is the union of this `Interval` and that
 * `Interval` as a `Some`, otherwise returns `None` if the two intervals cannot
 * form a union.
 *
 * @since 1.0.0
 * @category mutations
 */
export const union: (that: Interval) => (self: Interval) => Option.Option<Interval> = internal.union

/**
 * Construct an `Interval` that includes all time equal to and after the
 * specified start time.
 *
 * @since 1.0.0
 * @category constructors
 */
export const after: (startMilliseconds: number) => Interval = internal.after

/**
 * Construct an `Interval` that includes all time equal to and before the
 * specified end time.
 *
 * @tsplus static effect/core/io/Interval/Interval before
 * @category constructors
 * @since 1.0.0
 */
export const before: (endMilliseconds: number) => Interval = internal.before
