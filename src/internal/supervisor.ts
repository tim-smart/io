import { getCallTrace } from "@effect/io/Debug"
import type * as Effect from "@effect/io/Effect"
import type * as Exit from "@effect/io/Exit"
import type * as Fiber from "@effect/io/Fiber"
import * as core from "@effect/io/internal/core"
import type * as Supervisor from "@effect/io/Supervisor"
import * as Chunk from "@fp-ts/data/Chunk"
import type * as Context from "@fp-ts/data/Context"
import { pipe } from "@fp-ts/data/Function"
import * as MutableRef from "@fp-ts/data/mutable/MutableRef"
import type * as Option from "@fp-ts/data/Option"
import * as SortedSet from "@fp-ts/data/SortedSet"

/** @internal */
const SupervisorSymbolKey = "@effect/io/Supervisor"

/** @internal */
export const SupervisorTypeId: Supervisor.SupervisorTypeId = Symbol.for(
  SupervisorSymbolKey
) as Supervisor.SupervisorTypeId

/** @internal */
const supervisorVariance = {
  _T: (_: never) => _
}

/** @internal */
export class ProxySupervisor<T> implements Supervisor.Supervisor<T> {
  readonly [SupervisorTypeId] = supervisorVariance

  constructor(
    readonly underlying: Supervisor.Supervisor<any>,
    readonly value0: () => Effect.Effect<never, never, T>
  ) {}

  value(): Effect.Effect<never, never, T> {
    const trace = getCallTrace()
    return this.value0().traced(trace)
  }

  onStart<R, E, A>(
    context: Context.Context<R>,
    effect: Effect.Effect<R, E, A>,
    parent: Option.Option<Fiber.RuntimeFiber<any, any>>,
    fiber: Fiber.RuntimeFiber<E, A>
  ): void {
    this.underlying.onStart(context, effect, parent, fiber)
  }

  onEnd<E, A>(value: Exit.Exit<E, A>, fiber: Fiber.RuntimeFiber<E, A>): void {
    this.underlying.onEnd(value, fiber)
  }

  onEffect<E, A>(fiber: Fiber.RuntimeFiber<E, A>, effect: Effect.Effect<any, any, any>): void {
    this.underlying.onEffect(fiber, effect)
  }

  onSuspend<E, A>(fiber: Fiber.RuntimeFiber<E, A>): void {
    this.underlying.onSuspend(fiber)
  }

  onResume<E, A>(fiber: Fiber.RuntimeFiber<E, A>): void {
    this.underlying.onResume(fiber)
  }

  map<B>(f: (a: T) => B): Supervisor.Supervisor<B> {
    return new ProxySupervisor(this, () => pipe(this.value(), core.map(f)))
  }

  zip<B>(right: Supervisor.Supervisor<B>): Supervisor.Supervisor<readonly [T, B]> {
    return new Zip(this, right)
  }
}

/** @internal */
export class Zip<T0, T1> implements Supervisor.Supervisor<readonly [T0, T1]> {
  readonly [SupervisorTypeId] = supervisorVariance

  constructor(
    readonly left: Supervisor.Supervisor<T0>,
    readonly right: Supervisor.Supervisor<T1>
  ) {}

  value(): Effect.Effect<never, never, readonly [T0, T1]> {
    const trace = getCallTrace()
    return pipe(this.left.value(), core.zip(this.right.value())).traced(trace)
  }

  onStart<R, E, A>(
    context: Context.Context<R>,
    effect: Effect.Effect<R, E, A>,
    parent: Option.Option<Fiber.RuntimeFiber<any, any>>,
    fiber: Fiber.RuntimeFiber<E, A>
  ): void {
    this.left.onStart(context, effect, parent, fiber)
    this.right.onStart(context, effect, parent, fiber)
  }

  onEnd<E, A>(value: Exit.Exit<E, A>, fiber: Fiber.RuntimeFiber<E, A>): void {
    this.left.onEnd(value, fiber)
    this.right.onEnd(value, fiber)
  }

  onEffect<E, A>(fiber: Fiber.RuntimeFiber<E, A>, effect: Effect.Effect<any, any, any>): void {
    this.left.onEffect(fiber, effect)
    this.right.onEffect(fiber, effect)
  }

  onSuspend<E, A>(fiber: Fiber.RuntimeFiber<E, A>): void {
    this.left.onSuspend(fiber)
    this.right.onSuspend(fiber)
  }

  onResume<E, A>(fiber: Fiber.RuntimeFiber<E, A>): void {
    this.left.onResume(fiber)
    this.right.onResume(fiber)
  }

  map<B>(f: (a: readonly [T0, T1]) => B): Supervisor.Supervisor<B> {
    return new ProxySupervisor(this, () => pipe(this.value(), core.map(f)))
  }
  zip<A>(right: Supervisor.Supervisor<A>): Supervisor.Supervisor<readonly [readonly [T0, T1], A]> {
    return new Zip(this, right)
  }
}

export class Track implements Supervisor.Supervisor<Chunk.Chunk<Fiber.RuntimeFiber<any, any>>> {
  readonly [SupervisorTypeId] = supervisorVariance

  readonly fibers: Set<Fiber.RuntimeFiber<any, any>> = new Set()

  value(): Effect.Effect<never, never, Chunk.Chunk<Fiber.RuntimeFiber<any, any>>> {
    return core.sync(() => Chunk.fromIterable(this.fibers))
  }

  onStart<R, E, A>(
    _context: Context.Context<R>,
    _effect: Effect.Effect<R, E, A>,
    _parent: Option.Option<Fiber.RuntimeFiber<any, any>>,
    fiber: Fiber.RuntimeFiber<E, A>
  ): void {
    this.fibers.add(fiber)
  }

  onEnd<E, A>(_value: Exit.Exit<E, A>, fiber: Fiber.RuntimeFiber<E, A>): void {
    this.fibers.delete(fiber)
  }

  onEffect<E, A>(_fiber: Fiber.RuntimeFiber<E, A>, _effect: Effect.Effect<any, any, any>): void {
    //
  }

  onSuspend<E, A>(_fiber: Fiber.RuntimeFiber<E, A>): void {
    //
  }

  onResume<E, A>(_fiber: Fiber.RuntimeFiber<E, A>): void {
    //
  }

  map<B>(f: (a: Chunk.Chunk<Fiber.RuntimeFiber<any, any>>) => B): Supervisor.Supervisor<B> {
    return new ProxySupervisor(this, () => pipe(this.value(), core.map(f)))
  }

  zip<A>(
    right: Supervisor.Supervisor<A>
  ): Supervisor.Supervisor<readonly [Chunk.Chunk<Fiber.RuntimeFiber<any, any>>, A]> {
    return new Zip(this, right)
  }
}

export class Const<T> implements Supervisor.Supervisor<T> {
  readonly [SupervisorTypeId] = supervisorVariance

  constructor(readonly effect: Effect.Effect<never, never, T>) {}

  value(): Effect.Effect<never, never, T> {
    const trace = getCallTrace()
    return this.effect.traced(trace)
  }

  onStart<R, E, A>(
    _environment: Context.Context<R>,
    _effect: Effect.Effect<R, E, A>,
    _parent: Option.Option<Fiber.RuntimeFiber<any, any>>,
    _fiber: Fiber.RuntimeFiber<E, A>
  ): void {
    //
  }

  onEnd<E, A>(_value: Exit.Exit<E, A>, _fiber: Fiber.RuntimeFiber<E, A>): void {
    //
  }

  onEffect<E, A>(_fiber: Fiber.RuntimeFiber<E, A>, _effect: Effect.Effect<any, any, any>): void {
    //
  }

  onSuspend<E, A>(_fiber: Fiber.RuntimeFiber<E, A>): void {
    //
  }

  onResume<E, A>(_fiber: Fiber.RuntimeFiber<E, A>): void {
    //
  }

  map<B>(f: (a: T) => B): Supervisor.Supervisor<B> {
    return new ProxySupervisor(this, () => pipe(this.value(), core.map(f)))
  }

  zip<A>(right: Supervisor.Supervisor<A>): Supervisor.Supervisor<readonly [T, A]> {
    return new Zip(this, right)
  }
}

class FibersIn implements Supervisor.Supervisor<SortedSet.SortedSet<Fiber.RuntimeFiber<any, any>>> {
  readonly [SupervisorTypeId] = supervisorVariance

  constructor(readonly ref: MutableRef.MutableRef<SortedSet.SortedSet<Fiber.RuntimeFiber<any, any>>>) {}

  value(): Effect.Effect<never, never, SortedSet.SortedSet<Fiber.RuntimeFiber<any, any>>> {
    const trace = getCallTrace()
    return core.sync(() => MutableRef.get(this.ref)).traced(trace)
  }

  onStart<R, E, A>(
    _context: Context.Context<R>,
    _effect: Effect.Effect<R, E, A>,
    _parent: Option.Option<Fiber.RuntimeFiber<any, any>>,
    fiber: Fiber.RuntimeFiber<E, A>
  ): void {
    pipe(this.ref, MutableRef.set(pipe(MutableRef.get(this.ref), SortedSet.add(fiber))))
  }

  onEnd<E, A>(_value: Exit.Exit<E, A>, fiber: Fiber.RuntimeFiber<E, A>): void {
    pipe(this.ref, MutableRef.set(pipe(MutableRef.get(this.ref), SortedSet.remove(fiber))))
  }

  onEffect<E, A>(_fiber: Fiber.RuntimeFiber<E, A>, _effect: Effect.Effect<any, any, any>): void {
    //
  }

  onSuspend<E, A>(_fiber: Fiber.RuntimeFiber<E, A>): void {
    //
  }

  onResume<E, A>(_fiber: Fiber.RuntimeFiber<E, A>): void {
    //
  }

  map<B>(f: (a: SortedSet.SortedSet<Fiber.RuntimeFiber<any, any>>) => B): Supervisor.Supervisor<B> {
    return new ProxySupervisor(this, () => pipe(this.value(), core.map(f)))
  }

  zip<A>(
    right: Supervisor.Supervisor<A>
  ): Supervisor.Supervisor<readonly [SortedSet.SortedSet<Fiber.RuntimeFiber<any, any>>, A]> {
    return new Zip(this, right)
  }
}

/** @internal */
export const unsafeTrack = (): Supervisor.Supervisor<Chunk.Chunk<Fiber.RuntimeFiber<any, any>>> => {
  return new Track()
}

/** @internal */
export const track = (): Effect.Effect<
  never,
  never,
  Supervisor.Supervisor<Chunk.Chunk<Fiber.RuntimeFiber<any, any>>>
> => {
  const trace = getCallTrace()
  return core.sync(unsafeTrack).traced(trace)
}

/** @internal */
export const fromEffect = <A>(effect: Effect.Effect<never, never, A>): Supervisor.Supervisor<A> => {
  return new Const(effect)
}

/** @internal */
export const none: Supervisor.Supervisor<void> = fromEffect(core.unit())

/** @internal */
export const fibersIn = (
  ref: MutableRef.MutableRef<SortedSet.SortedSet<Fiber.RuntimeFiber<any, any>>>
): Effect.Effect<
  never,
  never,
  Supervisor.Supervisor<SortedSet.SortedSet<Fiber.RuntimeFiber<any, any>>>
> => {
  const trace = getCallTrace()
  return core.sync(() => new FibersIn(ref)).traced(trace)
}
