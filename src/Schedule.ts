/**
 * @since 1.0.0
 */
import type * as Cause from "@effect/io/Cause"
import type * as Effect from "@effect/io/Effect"
import * as internal from "@effect/io/internal/schedule"
import type * as Random from "@effect/io/Random"
import type * as ScheduleDecision from "@effect/io/Schedule/Decision"
import type * as Interval from "@effect/io/Schedule/Interval"
import type * as Intervals from "@effect/io/Schedule/Intervals"
import type * as Chunk from "@fp-ts/data/Chunk"
import type * as Context from "@fp-ts/data/Context"
import type * as Duration from "@fp-ts/data/Duration"
import type * as Either from "@fp-ts/data/Either"
import type * as Option from "@fp-ts/data/Option"
import type { Predicate } from "@fp-ts/data/Predicate"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ScheduleTypeId: unique symbol = internal.ScheduleTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type ScheduleTypeId = typeof ScheduleTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export const ScheduleDriverTypeId: unique symbol = internal.ScheduleDriverTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type ScheduleDriverTypeId = typeof ScheduleDriverTypeId

/**
 * A `Schedule<Env, In, Out>` defines a recurring schedule, which consumes
 * values of type `In`, and which returns values of type `Out`.
 *
 * Schedules are defined as a possibly infinite set of intervals spread out over
 * time. Each interval defines a window in which recurrence is possible.
 *
 * When schedules are used to repeat or retry effects, the starting boundary of
 * each interval produced by a schedule is used as the moment when the effect
 * will be executed again.
 *
 * Schedules compose in the following primary ways:
 *
 * - Union: performs the union of the intervals of two schedules
 * - Intersection: performs the intersection of the intervals of two schedules
 * - Sequence: concatenates the intervals of one schedule onto another
 *
 * In addition, schedule inputs and outputs can be transformed, filtered (to
 * terminate a schedule early in response to some input or output), and so
 * forth.
 *
 * A variety of other operators exist for transforming and combining schedules,
 * and the companion object for `Schedule` contains all common types of
 * schedules, both for performing retrying, as well as performing repetition.
 *
 * @tsplus type effect/core/io/Schedule
 * @category model
 * @since 1.0.0
 */
export interface Schedule<Env, In, Out> extends Schedule.Variance<Env, In, Out> {
  /** @internal */
  readonly initial: any
  /**
   * @macro traced
   * @internal
   */
  readonly step: (
    now: number,
    input: In,
    state: any
  ) => Effect.Effect<Env, never, readonly [any, Out, ScheduleDecision.ScheduleDecision]>
}

/**
 * @since 1.0.0
 */
export declare namespace Schedule {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface Variance<Env, In, Out> {
    readonly [ScheduleTypeId]: {
      readonly _Env: (_: never) => Env
      readonly _In: (_: In) => void
      readonly _Out: (_: never) => Out
    }
  }

  export interface DriverVariance<Env, In, Out> {
    readonly [ScheduleDriverTypeId]: {
      readonly _Env: (_: never) => Env
      readonly _In: (_: In) => void
      readonly _Out: (_: never) => Out
    }
  }
}

/**
 * @since 1.0.0
 * @category models
 */
export interface ScheduleDriver<Env, In, Out> extends Schedule.DriverVariance<Env, In, Out> {
  /**
   * @macro traced
   */
  state(): Effect.Effect<never, never, unknown>
  /**
   * @macro traced
   */
  last(): Effect.Effect<never, Cause.NoSuchElementException, Out>
  /**
   * @macro traced
   */
  reset(): Effect.Effect<never, never, void>
  /**
   * @macro traced
   */
  next(input: In): Effect.Effect<Env, Option.Option<never>, Out>
}

/**
 * Constructs a new `Schedule` with the specified `initial` state and the
 * specified `step` function.
 *
 * @since 1.0.0
 * @category constructors
 */
export const makeWithState: <S, Env, In, Out>(
  initial: S,
  step: (
    now: number,
    input: In,
    state: S
  ) => Effect.Effect<Env, never, readonly [S, Out, ScheduleDecision.ScheduleDecision]>
) => Schedule<Env, In, Out> = internal.makeWithState

/**
 * Returns a new schedule with the given delay added to every interval defined
 * by this schedule.
 *
 * @since 1.0.0
 * @category mutations
 */
export const addDelay: <Out>(
  f: (out: Out) => Duration.Duration
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out> = internal.addDelay

/**
 * Returns a new schedule with the given effectfully computed delay added to
 * every interval defined by this schedule.
 *
 * @since 1.0.0
 * @category mutations
 */
export const addDelayEffect: <Out, Env2>(
  f: (out: Out) => Effect.Effect<Env2, never, Duration.Duration>
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In, Out> = internal.addDelayEffect

/**
 * The same as `andThenEither`, but merges the output.
 *
 * @since 1.0.0
 * @category sequencing
 */
export const andThen: <Env1, In1, Out2>(
  that: Schedule<Env1, In1, Out2>
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env1 | Env, In & In1, Out2 | Out> = internal.andThen

/**
 * Returns a new schedule that first executes this schedule to completion, and
 * then executes the specified schedule to completion.
 *
 * @since 1.0.0
 * @category sequencing
 */
export const andThenEither: <Env2, In2, Out2>(
  that: Schedule<Env2, In2, Out2>
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In & In2, Either.Either<Out, Out2>> =
  internal.andThenEither

/**
 * Returns a new schedule that maps this schedule to a constant output.
 *
 * @since 1.0.0
 * @category mapping
 */
export const as: <Out2>(out2: Out2) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out2> =
  internal.as

/**
 * Returns a new schedule that maps the output of this schedule to unit.
 *
 * @since 1.0.0
 * @category constructors
 */
export const asUnit: <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env, In, void> = internal.asUnit

/**
 * Returns a new schedule that has both the inputs and outputs of this and the
 * specified schedule.
 *
 * @since 1.0.0
 * @category mutations
 */
export const bothInOut: <Env2, In2, Out2>(
  that: Schedule<Env2, In2, Out2>
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, readonly [In, In2], readonly [Out, Out2]> =
  internal.bothInOut

/**
 * Returns a new schedule that passes each input and output of this schedule
 * to the specified function, and then determines whether or not to continue
 * based on the return value of the function.
 *
 * @since 1.0.0
 * @category mutations
 */
export const check: <In, Out>(
  test: (input: In, output: Out) => boolean
) => <Env>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out> = internal.check

/**
 * Returns a new schedule that passes each input and output of this schedule
 * to the specified function, and then determines whether or not to continue
 * based on the return value of the function.
 *
 * @since 1.0.0
 * @category mutations
 */
export const checkEffect: <In, Out, Env2>(
  test: (input: In, output: Out) => Effect.Effect<Env2, never, boolean>
) => <Env>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In, Out> = internal.checkEffect

/**
 * Returns a new schedule that allows choosing between feeding inputs to this
 * schedule, or feeding inputs to the specified schedule.
 *
 * @since 1.0.0
 * @category alternatives
 */
export const choose: <Env2, In2, Out2>(
  that: Schedule<Env2, In2, Out2>
) => <Env, In, Out>(
  self: Schedule<Env, In, Out>
) => Schedule<Env2 | Env, Either.Either<In, In2>, Either.Either<Out, Out2>> = internal.choose

/**
 * Returns a new schedule that chooses between two schedules with a common
 * output.
 *
 * @since 1.0.0
 * @category alternatives
 */
export const chooseMerge: <Env2, In2, Out2>(
  that: Schedule<Env2, In2, Out2>
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, Either.Either<In, In2>, Out2 | Out> =
  internal.chooseMerge

/**
 * A schedule that recurs anywhere, collecting all inputs into a `Chunk`.
 *
 * @since 1.0.0
 * @category constructors
 */
export const collectAllInputs: <A>() => Schedule<never, A, Chunk.Chunk<A>> = internal.collectAllInputs

/**
 * Returns a new schedule that collects the outputs of this one into a chunk.
 *
 * @since 1.0.0
 * @category mutations
 */
export const collectAllOutputs: <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Chunk.Chunk<Out>> =
  internal.collectAllOutputs

/**
 * A schedule that recurs until the condition f fails, collecting all inputs
 * into a list.
 *
 * @since 1.0.0
 * @category mutations
 */
export const collectUntil: <A>(f: Predicate<A>) => Schedule<never, A, Chunk.Chunk<A>> = internal.collectUntil

/**
 * A schedule that recurs until the effectful condition f fails, collecting
 * all inputs into a list.
 *
 * @since 1.0.0
 * @category mutations
 */
export const collectUntilEffect: <Env, A>(
  f: (a: A) => Effect.Effect<Env, never, boolean>
) => Schedule<Env, A, Chunk.Chunk<A>> = internal.collectUntilEffect

/**
 * A schedule that recurs as long as the condition f holds, collecting all
 * inputs into a list.
 *
 * @since 1.0.0
 * @category mutations
 */
export const collectWhile: <A>(f: Predicate<A>) => Schedule<never, A, Chunk.Chunk<A>> = internal.collectWhile

/**
 * A schedule that recurs as long as the effectful condition holds, collecting
 * all inputs into a list.
 *
 * @tsplus static effect/core/io/Schedule.Ops collectWhileEffect
 * @category mutations
 * @since 1.0.0
 */
export const collectWhileEffect: <Env, A>(
  f: (a: A) => Effect.Effect<Env, never, boolean>
) => Schedule<Env, A, Chunk.Chunk<A>> = internal.collectWhileEffect

/**
 * Returns the composition of this schedule and the specified schedule, by
 * piping the output of this one into the input of the other. Effects
 * described by this schedule will always be executed before the effects
 * described by the second schedule.
 *
 * @since 1.0.0
 * @category mutations
 */
export const compose: <Env1, Out, Out2>(
  that: Schedule<Env1, Out, Out2>
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env1 | Env, In, Out2> = internal.compose

/**
 * Returns a new schedule that deals with a narrower class of inputs than this
 * schedule.
 *
 * @since 1.0.0
 * @category mapping
 */
export const contramap: <In, In2>(
  f: (in2: In2) => In
) => <Env, Out>(self: Schedule<Env, In, Out>) => Schedule<Env, In2, Out> = internal.contramap

/**
 * Returns a new schedule that deals with a narrower class of inputs than this
 * schedule.
 *
 * @since 1.0.0
 * @category mapping
 */
export const contramapEffect: <In, Env1, In2>(
  f: (in2: In2) => Effect.Effect<Env1, never, In>
) => <Env, Out>(self: Schedule<Env, In, Out>) => Schedule<Env1 | Env, In2, Out> = internal.contramapEffect

/**
 * A schedule that always recurs, which counts the number of recurrences.
 *
 * @since 1.0.0
 * @category constructors
 */
export const count: () => Schedule<never, unknown, number> = internal.count

/**
 * Cron-like schedule that recurs every specified `day` of month. Won't recur
 * on months containing less days than specified in `day` param.
 *
 * It triggers at zero hour of the day. Producing a count of repeats: 0, 1, 2.
 *
 * NOTE: `day` parameter is validated lazily. Must be in range 1...31.
 *
 * @since 1.0.0
 * @category constructors
 */
export const dayOfMonth: (day: number) => Schedule<never, unknown, number> = internal.dayOfMonth

/**
 * Cron-like schedule that recurs every specified `day` of each week. It
 * triggers at zero hour of the week. Producing a count of repeats: 0, 1, 2.
 *
 * NOTE: `day` parameter is validated lazily. Must be in range 1 (Monday)...7
 * (Sunday).
 *
 * @since 1.0.0
 * @category constructors
 */
export const dayOfWeek: (day: number) => Schedule<never, unknown, number> = internal.dayOfWeek

/**
 * Returns a new schedule with the specified effectfully computed delay added
 * before the start of each interval produced by this schedule.
 *
 * @since 1.0.0
 * @category mutations
 */
export const delayed: (
  f: (duration: Duration.Duration) => Duration.Duration
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out> = internal.delayed

/**
 * Returns a new schedule with the specified effectfully computed delay added
 * before the start of each interval produced by this schedule.
 *
 * @since 1.0.0
 * @category constructors
 */
export const delayedEffect: <Env2>(
  f: (duration: Duration.Duration) => Effect.Effect<Env2, never, Duration.Duration>
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In, Out> = internal.delayedEffect

/**
 * Takes a schedule that produces a delay, and returns a new schedule that
 * uses this delay to further delay intervals in the resulting schedule.
 *
 * @since 1.0.0
 * @category constructors
 */
export const delayedSchedule: <Env, In>(
  schedule: Schedule<Env, In, Duration.Duration>
) => Schedule<Env, In, Duration.Duration> = internal.delayedSchedule

/**
 * Returns a new schedule that outputs the delay between each occurence.
 *
 * @since 1.0.0
 * @category constructors
 */
export const delays: <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Duration.Duration> =
  internal.delays

/**
 * Returns a new schedule that contramaps the input and maps the output.
 *
 * @since 1.0.0
 * @category mapping
 */
export const dimap: <In, Out, In2, Out2>(
  f: (in2: In2) => In,
  g: (out: Out) => Out2
) => <Env>(self: Schedule<Env, In, Out>) => Schedule<Env, In2, Out2> = internal.dimap

/**
 * Returns a new schedule that contramaps the input and maps the output.
 *
 * @since 1.0.0
 * @category mapping
 */
export const dimapEffect: <In2, Env2, In, Out, Env3, Out2>(
  f: (input: In2) => Effect.Effect<Env2, never, In>,
  g: (out: Out) => Effect.Effect<Env3, never, Out2>
) => <Env>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env3 | Env, In2, Out2> = internal.dimapEffect

/**
 * Returns a driver that can be used to step the schedule, appropriately
 * handling sleeping.
 *
 * @macro traced
 * @since 1.0.0
 * @category getter
 */
export const driver: <Env, In, Out>(
  self: Schedule<Env, In, Out>
) => Effect.Effect<never, never, ScheduleDriver<Env, In, Out>> = internal.driver

/**
 * A schedule that can recur one time, the specified amount of time into the
 * future.
 *
 * @since 1.0.0
 * @category constructors
 */
export const duration: (duration: Duration.Duration) => Schedule<never, unknown, Duration.Duration> = internal.duration

/**
 * Returns a new schedule that performs a geometric union on the intervals
 * defined by both schedules.
 *
 * @since 1.0.0
 * @category alternatives
 */
export const either: <Env2, In2, Out2>(
  that: Schedule<Env2, In2, Out2>
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In & In2, readonly [Out, Out2]> =
  internal.either

/**
 * The same as `either` followed by `map`.
 *
 * @since 1.0.0
 * @category alternatives
 */
export const eitherWith: <Env2, In2, Out2, Out, Out3>(
  that: Schedule<Env2, In2, Out2>,
  f: (out: Out, out2: Out2) => Out3
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In & In2, Out3> = internal.eitherWith

/**
 * A schedule that occurs everywhere, which returns the total elapsed duration
 * since the first step.
 *
 * @since 1.0.0
 * @category constructors
 */
export const elapsed: () => Schedule<never, unknown, Duration.Duration> = internal.elapsed

/**
 * Returns a new schedule that will run the specified finalizer as soon as the
 * schedule is complete. Note that unlike `Effect.ensuring`, this method does not
 * guarantee the finalizer will be run. The `Schedule` may not initialize or
 * the driver of the schedule may not run to completion. However, if the
 * `Schedule` ever decides not to continue, then the finalizer will be run.
 *
 * @since 1.0.0
 * @category finalization
 */
export const ensuring: <X>(
  finalizer: Effect.Effect<never, never, X>
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out> = internal.ensuring

/**
 * A schedule that always recurs, but will wait a certain amount between
 * repetitions, given by `base * factor.pow(n)`, where `n` is the number of
 * repetitions so far. Returns the current duration between recurrences.
 *
 * @since 1.0.0
 * @category constructors
 */
export const exponential: (base: Duration.Duration, factor?: number) => Schedule<never, unknown, Duration.Duration> =
  internal.exponential

/**
 * A schedule that always recurs, increasing delays by summing the preceding
 * two delays (similar to the fibonacci sequence). Returns the current
 * duration between recurrences.
 *
 * @since 1.0.0
 * @category constructors
 */
export const fibonacci: (one: Duration.Duration) => Schedule<never, unknown, Duration.Duration> = internal.fibonacci

/**
 * A schedule that recurs on a fixed interval. Returns the number of
 * repetitions of the schedule so far.
 *
 * If the action run between updates takes longer than the interval, then the
 * action will be run immediately, but re-runs will not "pile up".
 *
 * ```
 * |-----interval-----|-----interval-----|-----interval-----|
 * |---------action--------||action|-----|action|-----------|
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export const fixed: (interval: Duration.Duration) => Schedule<never, unknown, number> = internal.fixed

/**
 * Returns a new schedule that folds over the outputs of this one.
 *
 * @since 1.0.0
 * @category folding
 */
export const fold: <Out, Z>(
  zero: Z,
  f: (z: Z, out: Out) => Z
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Z> = internal.fold

/**
 * Returns a new schedule that effectfully folds over the outputs of this one.
 *
 * @since 1.0.0
 * @category folding
 */
export const foldEffect: <Out, Env1, Z>(
  zero: Z,
  f: (z: Z, out: Out) => Effect.Effect<Env1, never, Z>
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env1 | Env, In, Z> = internal.foldEffect

/**
 * A schedule that always recurs, producing a count of repeats: 0, 1, 2.
 *
 * @since 1.0.0
 * @category constructors
 */
export const forever: () => Schedule<never, unknown, number> = internal.forever

/**
 * A schedule that recurs once with the specified delay.
 *
 * @since 1.0.0
 * @category constructors
 */
export const fromDelay: (delay: Duration.Duration) => Schedule<never, unknown, Duration.Duration> = internal.fromDelay

/**
 * A schedule that recurs once for each of the specified durations, delaying
 * each time for the length of the specified duration. Returns the length of
 * the current duration between recurrences.
 *
 * @since 1.0.0
 * @category constructors
 */
export const fromDelays: (
  delay: Duration.Duration,
  ...delays: Array<Duration.Duration>
) => Schedule<never, unknown, Duration.Duration> = internal.fromDelays

/**
 * A schedule that always recurs, mapping input values through the specified
 * function.
 *
 * @since 1.0.0
 * @category constructors
 */
export const fromFunction: <A, B>(f: (a: A) => B) => Schedule<never, A, B> = internal.fromFunction

/**
 * Cron-like schedule that recurs every specified `hour` of each day. It
 * triggers at zero minute of the hour. Producing a count of repeats: 0, 1, 2.
 *
 * NOTE: `hour` parameter is validated lazily. Must be in range 0...23.
 *
 * @since 1.0.0
 * @category constructors
 */
export const hourOfDay: (hour: number) => Schedule<never, unknown, number> = internal.hourOfDay

/**
 * A schedule that always recurs, which returns inputs as outputs.
 *
 * @since 1.0.0
 * @category constructors
 */
export const identity: <A>() => Schedule<never, A, A> = internal.identity

/**
 * Returns a new schedule that performs a geometric intersection on the
 * intervals defined by both schedules.
 *
 * @since 1.0.0
 * @category mutations
 */
export const intersect: <Env2, In2, Out2>(
  that: Schedule<Env2, In2, Out2>
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In & In2, readonly [Out, Out2]> =
  internal.intersect

/**
 * Returns a new schedule that combines this schedule with the specified
 * schedule, continuing as long as both schedules want to continue and merging
 * the next intervals according to the specified merge function.
 *
 * @since 1.0.0
 * @category mutations
 */
export const intersectWith: <Env2, In2, Out2>(
  that: Schedule<Env2, In2, Out2>,
  f: (x: Intervals.Intervals, y: Intervals.Intervals) => Intervals.Intervals
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In & In2, readonly [Out, Out2]> =
  internal.intersectWith

/**
 * Returns a new schedule that randomly modifies the size of the intervals of
 * this schedule.
 *
 * The new interval size is between `min * old interval size` and `max * old
 * interval size`.
 *
 * @since 1.0.0
 * @category constructors
 */
export const jittered: (
  min?: number,
  max?: number
) => <Env, In, Out>(
  self: Schedule<Env, In, Out>
) => Schedule<Env | Random.Random, In, Out> = internal.jittered

/**
 * Returns a new schedule that makes this schedule available on the `Left`
 * side of an `Either` input, allowing propagating some type `X` through this
 * channel on demand.
 *
 * @since 1.0.0
 * @category mutations
 */
export const left: <Env, In, Out, X>(
  self: Schedule<Env, In, Out>
) => Schedule<Env, Either.Either<In, X>, Either.Either<Out, X>> = internal.left

/**
 * A schedule that always recurs, but will repeat on a linear time interval,
 * given by `base * n` where `n` is the number of repetitions so far. Returns
 * the current duration between recurrences.
 *
 * @since 1.0.0
 * @category constructors
 */
export const linear: (base: Duration.Duration) => Schedule<never, unknown, Duration.Duration> = internal.linear

/**
 * Returns a new schedule that maps the output of this schedule through the
 * specified function.
 *
 * @since 1.0.0
 * @category mapping
 */
export const map: <Out, Out2>(
  f: (out: Out) => Out2
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out2> = internal.map

/**
 * Returns a new schedule that maps the output of this schedule through the
 * specified effectful function.
 *
 * @since 1.0.0
 * @category mapping
 */
export const mapEffect: <Out, Env2, Out2>(
  f: (out: Out) => Effect.Effect<Env2, never, Out2>
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In, Out2> = internal.mapEffect

/**
 * Cron-like schedule that recurs every specified `minute` of each hour. It
 * triggers at zero second of the minute. Producing a count of repeats: 0, 1,
 * 2.
 *
 * NOTE: `minute` parameter is validated lazily. Must be in range 0...59.
 *
 * @since 1.0.0
 * @category constructors
 */
export const minuteOfHour: (minute: number) => Schedule<never, unknown, number> = internal.minuteOfHour

/**
 * Returns a new schedule that modifies the delay using the specified
 * function.
 *
 * @since 1.0.0
 * @category mutations
 */
export const modifyDelay: <Out>(
  f: (out: Out, duration: Duration.Duration) => Duration.Duration
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out> = internal.modifyDelay

/**
 * Returns a new schedule that modifies the delay using the specified
 * effectual function.
 *
 * @since 1.0.0
 * @category mutations
 */
export const modifyDelayEffect: <Out, Env2>(
  f: (out: Out, duration: Duration.Duration) => Effect.Effect<Env2, never, Duration.Duration>
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In, Out> = internal.modifyDelayEffect

/**
 * Returns a new schedule that applies the current one but runs the specified
 * effect for every decision of this schedule. This can be used to create
 * schedules that log failures, decisions, or computed values.
 *
 * @since 1.0.0
 * @category mutations
 */
export const onDecision: <Out, Env2, X>(
  f: (out: Out, decision: ScheduleDecision.ScheduleDecision) => Effect.Effect<Env2, never, X>
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In, Out> = internal.onDecision

/**
 * A schedule that recurs one time.
 *
 * @since 1.0.0
 * @category constructors
 */
export const once: () => Schedule<never, unknown, void> = internal.once

/**
 * Returns a new schedule that passes through the inputs of this schedule.
 *
 * @since 1.0.0
 * @category mutations
 */
export const passthrough: <Env, Input, Output>(self: Schedule<Env, Input, Output>) => Schedule<Env, Input, Input> =
  internal.passthrough

/**
 * Returns a new schedule with its environment provided to it, so the
 * resulting schedule does not require any environment.
 *
 * @since 1.0.0
 * @category environment
 */
export const provideEnvironment: <R>(
  context: Context.Context<R>
) => <In, Out>(self: Schedule<R, In, Out>) => Schedule<never, In, Out> = internal.provideEnvironment

/**
 * Returns a new schedule with the single service it requires provided to it.
 * If the schedule requires multiple services use `provideEnvironment`
 * instead.
 *
 * @since 1.0.0
 * @category environment
 */
export const provideService: <T, T1 extends T>(
  tag: Context.Tag<T>,
  service: T1
) => <R, In, Out>(self: Schedule<T | R, In, Out>) => Schedule<Exclude<R, T>, In, Out> = internal.provideService

/**
 * Transforms the environment being provided to this schedule with the
 * specified function.
 *
 * @since 1.0.0
 * @category environment
 */
export const provideSomeEnvironment: <R0, R>(
  f: (env0: Context.Context<R0>) => Context.Context<R>
) => <In, Out>(self: Schedule<R, In, Out>) => Schedule<R0, In, Out> = internal.provideSomeEnvironment

/**
 * Returns a new schedule that reconsiders every decision made by this
 * schedule, possibly modifying the next interval and the output type in the
 * process.
 *
 * @since 1.0.0
 * @category mutations
 */
export const reconsider: <Out, Out2>(
  f: (out: Out, decision: ScheduleDecision.ScheduleDecision) => Either.Either<Out2, readonly [Out2, Interval.Interval]>
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out2> = internal.reconsider

/**
 * Returns a new schedule that effectfully reconsiders every decision made by
 * this schedule, possibly modifying the next interval and the output type in
 * the process.
 *
 * @since 1.0.0
 * @category mutations
 */
export const reconsiderEffect: <Out, Env2, Out2>(
  f: (
    out: Out,
    decision: ScheduleDecision.ScheduleDecision
  ) => Effect.Effect<Env2, never, Either.Either<Out2, readonly [Out2, Interval.Interval]>>
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In, Out2> = internal.reconsiderEffect

/**
 * A schedule that recurs for until the predicate evaluates to true.
 *
 * @since 1.0.0
 * @category mutations
 */
export const recurUntil: <A>(f: Predicate<A>) => Schedule<never, A, A> = internal.recurUntil

/**
 * A schedule that recurs for until the predicate evaluates to true.
 *
 * @since 1.0.0
 * @category mutations
 */
export const recurUntilEffect: <Env, A>(f: (a: A) => Effect.Effect<Env, never, boolean>) => Schedule<Env, A, A> =
  internal.recurUntilEffect

/**
 * A schedule that recurs for until the predicate is equal.
 *
 * @since 1.0.0
 * @category mutations
 */
export const recurUntilEquals: <A>(value: A) => Schedule<never, A, A> = internal.recurUntilEquals

/**
 * A schedule that recurs for until the input value becomes applicable to
 * partial function and then map that value with given function.
 *
 * @since 1.0.0
 * @category mutations
 */
export const recurUntilOption: <A, B>(pf: (a: A) => Option.Option<B>) => Schedule<never, A, Option.Option<B>> =
  internal.recurUntilOption

/**
 * A schedule that recurs during the given duration.
 *
 * @since 1.0.0
 * @category mutations
 */
export const recurUpTo: (duration: Duration.Duration) => Schedule<never, unknown, Duration.Duration> =
  internal.recurUpTo

/**
 * A schedule that recurs for as long as the predicate evaluates to true.
 *
 * @since 1.0.0
 * @category mutations
 */
export const recurWhile: <A>(f: Predicate<A>) => Schedule<never, A, A> = internal.recurWhile

/**
 * A schedule that recurs for as long as the effectful predicate evaluates to
 * true.
 *
 * @since 1.0.0
 * @category mutations
 */
export const recurWhileEffect: <Env, A>(f: (a: A) => Effect.Effect<Env, never, boolean>) => Schedule<Env, A, A> =
  internal.recurWhileEffect

/**
 * A schedule that recurs for as long as the predicate is equal to the
 * specified value.
 *
 * @since 1.0.0
 * @category mutations
 */
export const recurWhileEquals: <A>(value: A) => Schedule<never, A, A> = internal.recurWhileEquals

/**
 * A schedule spanning all time, which can be stepped only the specified
 * number of times before it terminates.
 *
 * @tsplus static effect/core/io/Schedule.Ops recurs
 * @category constructors
 * @since 1.0.0
 */
export const recurs: (n: number) => Schedule<never, unknown, number> = internal.recurs

/**
 * Returns a new schedule that loops this one continuously, resetting the
 * state when this schedule is done.
 *
 * @since 1.0.0
 * @category constructors
 */
export const repeatForever: () => Schedule<never, unknown, number> = internal.forever

/**
 * Returns a new schedule that outputs the number of repetitions of this one.
 *
 * @since 1.0.0
 * @category mutations
 */
export const repetitions: <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env, In, number> =
  internal.repetitions

/**
 * Return a new schedule that automatically resets the schedule to its initial
 * state after some time of inactivity defined by `duration`.
 *
 * @since 1.0.0
 * @category mutations
 */
export const resetAfter: (
  duration: Duration.Duration
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out> = internal.resetAfter

/**
 * Resets the schedule when the specified predicate on the schedule output
 * evaluates to true.
 *
 * @since 1.0.0
 * @category mutations
 */
export const resetWhen: <Out>(f: Predicate<Out>) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out> =
  internal.resetWhen

/**
 * Returns a new schedule that makes this schedule available on the `Right`
 * side of an `Either` input, allowing propagating some type `X` through this
 * channel on demand.
 *
 * @since 1.0.0
 * @category mutations
 */
export const right: <Env, In, Out, X>(
  self: Schedule<Env, In, Out>
) => Schedule<Env, Either.Either<X, In>, Either.Either<X, Out>> = internal.right

/**
 * Runs a schedule using the provided inputs, and collects all outputs.
 *
 * @since 1.0.0
 * @category destructors
 */
export const run: <In>(
  now: number,
  input: Iterable<In>
) => <Env, Out>(self: Schedule<Env, In, Out>) => Effect.Effect<Env, never, Chunk.Chunk<Out>> = internal.run

/**
 * Cron-like schedule that recurs every specified `second` of each minute. It
 * triggers at zero nanosecond of the second. Producing a count of repeats: 0,
 * 1, 2.
 *
 * NOTE: `second` parameter is validated lazily. Must be in range 0...59.
 *
 * @since 1.0.0
 * @category constructors
 */
export const secondOfMinute: (second: number) => Schedule<never, unknown, number> = internal.secondOfMinute

/**
 * Returns a schedule that recurs continuously, each repetition spaced the
 * specified duration from the last run.
 *
 * @since 1.0.0
 * @category constructors
 */
export const spaced: (duration: Duration.Duration) => Schedule<never, unknown, number> = internal.spaced

/**
 * A schedule that does not recur, it just stops.
 *
 * @since 1.0.0
 * @category constructors
 */
export const stop: () => Schedule<never, unknown, void> = internal.stop

/**
 * Returns a schedule that repeats one time, producing the specified constant
 * value.
 *
 * @since 1.0.0
 * @category constructors
 */
export const succeed: <A>(value: A) => Schedule<never, unknown, A> = internal.succeed

/**
 * Returns a schedule that repeats one time, producing the specified constant
 * value.
 *
 * @tsplus static effect/core/io/Schedule.Ops sync
 * @category constructors
 * @since 1.0.0
 */
export const sync: <A>(evaluate: () => A) => Schedule<never, unknown, A> = internal.sync

/**
 * Returns a new schedule that effectfully processes every input to this
 * schedule.
 *
 * @since 1.0.0
 * @category sequencing
 */
export const tapInput: <Env2, In2, X>(
  f: (input: In2) => Effect.Effect<Env2, never, X>
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In & In2, Out> = internal.tapInput

/**
 * Returns a new schedule that effectfully processes every output from this
 * schedule.
 *
 * @since 1.0.0
 * @category sequencing
 */
export const tapOutput: <Out, Env2, X>(
  f: (out: Out) => Effect.Effect<Env2, never, X>
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In, Out> = internal.tapOutput

/**
 * Unfolds a schedule that repeats one time from the specified state and
 * iterator.
 *
 * @since 1.0.0
 * @category constructors
 */
export const unfold: <A>(initial: A, f: (a: A) => A) => Schedule<never, unknown, A> = internal.unfold

/**
 * Returns a new schedule that performs a geometric union on the intervals
 * defined by both schedules.
 *
 * @since 1.0.0
 * @category mutations
 */
export const union: <Env2, In2, Out2>(
  that: Schedule<Env2, In2, Out2>
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In & In2, readonly [Out, Out2]> =
  internal.union

/**
 * Returns a new schedule that combines this schedule with the specified
 * schedule, continuing as long as either schedule wants to continue and
 * merging the next intervals according to the specified merge function.
 *
 * @since 1.0.0
 * @category mutations
 */
export const unionWith: <Env2, In2, Out2>(
  that: Schedule<Env2, In2, Out2>,
  f: (x: Intervals.Intervals, y: Intervals.Intervals) => Intervals.Intervals
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In & In2, readonly [Out, Out2]> =
  internal.unionWith

/**
 * Returns a new schedule that continues until the specified predicate on the
 * input evaluates to true.
 *
 * @since 1.0.0
 * @category mutations
 */
export const untilInput: <In>(f: Predicate<In>) => <Env, Out>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out> =
  internal.untilInput

/**
 * Returns a new schedule that continues until the specified effectful
 * predicate on the input evaluates to true.
 *
 * @since 1.0.0
 * @category mutations
 */
export const untilInputEffect: <In, Env2>(
  f: (input: In) => Effect.Effect<Env2, never, boolean>
) => <Env, Out>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In, Out> = internal.untilInputEffect

/**
 * Returns a new schedule that continues until the specified predicate on the
 * output evaluates to true.
 *
 * @since 1.0.0
 * @category mutations
 */
export const untilOutput: <Out>(
  f: Predicate<Out>
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out> = internal.untilOutput

/**
 * Returns a new schedule that continues until the specified effectful
 * predicate on the output evaluates to true.
 *
 * @since 1.0.0
 * @category mutations
 */
export const untilOutputEffect: <Out, Env2>(
  f: (out: Out) => Effect.Effect<Env2, never, boolean>
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In, Out> = internal.untilOutputEffect

/**
 * A schedule that recurs during the given duration.
 *
 * @since 1.0.0
 * @category mutations
 */
export const upTo: (
  duration: Duration.Duration
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out> = internal.upTo

/**
 * Returns a new schedule that continues for as long the specified predicate
 * on the input evaluates to true.
 *
 * @since 1.0.0
 * @category mutations
 */
export const whileInput: <In>(f: Predicate<In>) => <Env, Out>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out> =
  internal.whileInput

/**
 * Returns a new schedule that continues for as long the specified effectful
 * predicate on the input evaluates to true.
 *
 * @since 1.0.0
 * @category mutations
 */
export const whileInputEffect: <In, Env1>(
  f: (input: In) => Effect.Effect<Env1, never, boolean>
) => <Env, Out>(self: Schedule<Env, In, Out>) => Schedule<Env1 | Env, In, Out> = internal.whileInputEffect

/**
 * Returns a new schedule that continues for as long the specified predicate
 * on the output evaluates to true.
 *
 * @since 1.0.0
 * @category mutations
 */
export const whileOutput: <Out>(
  f: Predicate<Out>
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env, In, Out> = internal.whileOutput

/**
 * Returns a new schedule that continues for as long the specified effectful
 * predicate on the output evaluates to true.
 *
 * @since 1.0.0
 * @category mutations
 */
export const whileOutputEffect: <Out, Env1>(
  f: (out: Out) => Effect.Effect<Env1, never, boolean>
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env1 | Env, In, Out> = internal.whileOutputEffect

/**
 * A schedule that divides the timeline to `interval`-long windows, and sleeps
 * until the nearest window boundary every time it recurs.
 *
 * For example, `windowed(Duration.seconds(10))` would produce a schedule as
 * follows:
 *
 * ```
 *      10s        10s        10s       10s
 * |----------|----------|----------|----------|
 * |action------|sleep---|act|-sleep|action----|
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export const windowed: (interval: Duration.Duration) => Schedule<never, unknown, number> = internal.windowed

/**
 * The same as `intersect` but ignores the right output.
 *
 * @since 1.0.0
 * @category zipping
 */
export const zipLeft: <Env2, In2, Out2>(
  that: Schedule<Env2, In2, Out2>
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In & In2, Out> = internal.zipLeft

/**
 * The same as `intersect` but ignores the left output.
 *
 * @since 1.0.0
 * @category zipping
 */
export const zipRight: <Env2, In2, Out2>(
  that: Schedule<Env2, In2, Out2>
) => <Env, In, Out>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In & In2, Out2> = internal.zipRight

/**
 * Equivalent to `intersect` followed by `map`.
 *
 * @since 1.0.0
 * @category zipping
 */
export const zipWith: <Env2, In2, Out2, Out, Out3>(
  that: Schedule<Env2, In2, Out2>,
  f: (out: Out, out2: Out2) => Out3
) => <Env, In>(self: Schedule<Env, In, Out>) => Schedule<Env2 | Env, In & In2, Out3> = internal.zipWith
