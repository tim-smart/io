---
title: Fiber.ts
nav_order: 10
parent: Modules
---

## Fiber overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [alternatives](#alternatives)
  - [orElse](#orelse)
  - [orElseEither](#orelseeither)
- [constructors](#constructors)
  - [collectAll](#collectall)
  - [done](#done)
  - [fail](#fail)
  - [failCause](#failcause)
  - [interrupted](#interrupted)
  - [never](#never)
  - [roots](#roots)
  - [succeed](#succeed)
  - [unit](#unit)
- [conversions](#conversions)
  - [fromEffect](#fromeffect)
- [destructors](#destructors)
  - [awaitAll](#awaitall)
  - [dump](#dump)
  - [dumpAll](#dumpall)
  - [inheritAll](#inheritall)
  - [join](#join)
  - [joinAll](#joinall)
  - [pretty](#pretty)
  - [scoped](#scoped)
- [folding](#folding)
  - [match](#match)
- [getters](#getters)
  - [await](#await)
  - [children](#children)
  - [id](#id)
  - [poll](#poll)
  - [status](#status)
- [instances](#instances)
  - [Order](#order)
- [interruption](#interruption)
  - [interrupt](#interrupt)
  - [interruptAll](#interruptall)
  - [interruptAllWith](#interruptallwith)
  - [interruptFork](#interruptfork)
  - [interruptWith](#interruptwith)
  - [interruptWithFork](#interruptwithfork)
- [mapping](#mapping)
  - [map](#map)
  - [mapEffect](#mapeffect)
  - [mapFiber](#mapfiber)
- [models](#models)
  - [Fiber (interface)](#fiber-interface)
  - [RuntimeFiber (interface)](#runtimefiber-interface)
- [refinements](#refinements)
  - [isFiber](#isfiber)
  - [isRuntimeFiber](#isruntimefiber)
- [symbols](#symbols)
  - [FiberTypeId](#fibertypeid)
  - [FiberTypeId (type alias)](#fibertypeid-type-alias)
  - [RuntimeFiberTypeId](#runtimefibertypeid)
  - [RuntimeFiberTypeId (type alias)](#runtimefibertypeid-type-alias)
- [zipping](#zipping)
  - [zip](#zip)
  - [zipLeft](#zipleft)
  - [zipRight](#zipright)
  - [zipWith](#zipwith)

---

# alternatives

## orElse

Returns a fiber that prefers `this` fiber, but falls back to the `that` one
when `this` one fails. Interrupting the returned fiber will interrupt both
fibers, sequentially, from left to right.

**Signature**

```ts
export declare const orElse: <E2, A2>(that: Fiber<E2, A2>) => <E, A>(self: Fiber<E, A>) => Fiber<E2 | E, A2 | A>
```

Added in v1.0.0

## orElseEither

Returns a fiber that prefers `this` fiber, but falls back to the `that` one
when `this` one fails. Interrupting the returned fiber will interrupt both
fibers, sequentially, from left to right.

**Signature**

```ts
export declare const orElseEither: <E2, A2>(
  that: Fiber<E2, A2>
) => <E, A>(self: Fiber<E, A>) => Fiber<E2 | E, Either.Either<A, A2>>
```

Added in v1.0.0

# constructors

## collectAll

Collects all fibers into a single fiber producing an in-order list of the
results.

**Signature**

```ts
export declare const collectAll: <E, A>(fibers: Iterable<Fiber<E, A>>) => Fiber<E, Chunk.Chunk<A>>
```

Added in v1.0.0

## done

A fiber that is done with the specified `Exit` value.

**Signature**

```ts
export declare const done: <E, A>(exit: Exit.Exit<E, A>) => Fiber<E, A>
```

Added in v1.0.0

## fail

A fiber that has already failed with the specified value.

**Signature**

```ts
export declare const fail: <E>(error: E) => Fiber<E, never>
```

Added in v1.0.0

## failCause

Creates a `Fiber` that has already failed with the specified cause.

**Signature**

```ts
export declare const failCause: <E>(cause: Cause.Cause<E>) => Fiber<E, never>
```

Added in v1.0.0

## interrupted

Constructrs a `Fiber` that is already interrupted.

**Signature**

```ts
export declare const interrupted: (fiberId: FiberId.FiberId) => Fiber<never, never>
```

Added in v1.0.0

## never

A fiber that never fails or succeeds.

**Signature**

```ts
export declare const never: () => Fiber<never, never>
```

Added in v1.0.0

## roots

Returns a chunk containing all root fibers. Due to concurrency, the
returned chunk is only weakly consistent.

**Signature**

```ts
export declare const roots: () => Effect.Effect<never, never, Chunk.Chunk<RuntimeFiber<any, any>>>
```

Added in v1.0.0

## succeed

Returns a fiber that has already succeeded with the specified value.

**Signature**

```ts
export declare const succeed: <A>(value: A) => Fiber<never, A>
```

Added in v1.0.0

## unit

A fiber that has already succeeded with unit.

**Signature**

```ts
export declare const unit: () => Fiber<never, void>
```

Added in v1.0.0

# conversions

## fromEffect

Lifts an `Effect` into a `Fiber`.

**Signature**

```ts
export declare const fromEffect: <E, A>(effect: Effect.Effect<never, E, A>) => Effect.Effect<never, never, Fiber<E, A>>
```

Added in v1.0.0

# destructors

## awaitAll

Awaits on all fibers to be completed, successfully or not.

**Signature**

```ts
export declare const awaitAll: (fibers: Iterable<Fiber<any, any>>) => Effect.Effect<never, never, void>
```

Added in v1.0.0

## dump

**Signature**

```ts
export declare const dump: <E, A>(self: RuntimeFiber<E, A>) => Effect.Effect<never, never, Fiber.Dump>
```

Added in v1.0.0

## dumpAll

**Signature**

```ts
export declare const dumpAll: (
  fibers: Iterable<RuntimeFiber<unknown, unknown>>
) => Effect.Effect<never, never, Chunk.Chunk<Fiber.Dump>>
```

Added in v1.0.0

## inheritAll

Inherits values from all `FiberRef` instances into current fiber. This
will resume immediately.

**Signature**

```ts
export declare const inheritAll: <E, A>(self: Fiber<E, A>) => Effect.Effect<never, never, void>
```

Added in v1.0.0

## join

Joins the fiber, which suspends the joining fiber until the result of the
fiber has been determined. Attempting to join a fiber that has erred will
result in a catchable error. Joining an interrupted fiber will result in an
"inner interruption" of this fiber, unlike interruption triggered by
another fiber, "inner interruption" can be caught and recovered.

**Signature**

```ts
export declare const join: <E, A>(self: Fiber<E, A>) => Effect.Effect<never, E, A>
```

Added in v1.0.0

## joinAll

Joins all fibers, awaiting their _successful_ completion. Attempting to
join a fiber that has erred will result in a catchable error, _if_ that
error does not result from interruption.

**Signature**

```ts
export declare const joinAll: <E, A>(fibers: Iterable<Fiber<E, A>>) => Effect.Effect<never, E, void>
```

Added in v1.0.0

## pretty

Pretty-prints a `RuntimeFiber`.

**Signature**

```ts
export declare const pretty: <E, A>(self: RuntimeFiber<E, A>) => Effect.Effect<never, never, string>
```

Added in v1.0.0

## scoped

Converts this fiber into a scoped effect. The fiber is interrupted when the
scope is closed.

**Signature**

```ts
export declare const scoped: <E, A>(self: Fiber<E, A>) => Effect.Effect<Scope.Scope, never, Fiber<E, A>>
```

Added in v1.0.0

# folding

## match

Folds over the `Fiber` or `RuntimeFiber`.

**Signature**

```ts
export declare const match: <E, A, Z>(
  onFiber: (_: Fiber<E, A>) => Z,
  onRuntimeFiber: (_: RuntimeFiber<E, A>) => Z
) => (self: Fiber<E, A>) => Z
```

Added in v1.0.0

# getters

## await

Awaits the fiber, which suspends the awaiting fiber until the result of the
fiber has been determined.

**Signature**

```ts
export declare const await: <E, A>(self: Fiber<E, A>) => Effect.Effect<never, never, Exit.Exit<E, A>>
```

Added in v1.0.0

## children

Retrieves the immediate children of the fiber.

**Signature**

```ts
export declare const children: <E, A>(
  self: Fiber<E, A>
) => Effect.Effect<never, never, Chunk.Chunk<RuntimeFiber<any, any>>>
```

Added in v1.0.0

## id

The identity of the fiber.

**Signature**

```ts
export declare const id: <E, A>(self: Fiber<E, A>) => FiberId.FiberId
```

Added in v1.0.0

## poll

Tentatively observes the fiber, but returns immediately if it is not
already done.

**Signature**

```ts
export declare const poll: <E, A>(self: Fiber<E, A>) => Effect.Effect<never, never, Option.Option<Exit.Exit<E, A>>>
```

Added in v1.0.0

## status

Returns the `FiberStatus` of a `RuntimeFiber`.

**Signature**

```ts
export declare const status: <E, A>(self: RuntimeFiber<E, A>) => Effect.Effect<never, never, FiberStatus.FiberStatus>
```

Added in v1.0.0

# instances

## Order

**Signature**

```ts
export declare const Order: order.Order<RuntimeFiber<unknown, unknown>>
```

Added in v1.0.0

# interruption

## interrupt

Interrupts the fiber from whichever fiber is calling this method. If the
fiber has already exited, the returned effect will resume immediately.
Otherwise, the effect will resume when the fiber exits.

**Signature**

```ts
export declare const interrupt: <E, A>(self: Fiber<E, A>) => Effect.Effect<never, never, Exit.Exit<E, A>>
```

Added in v1.0.0

## interruptAll

Interrupts all fibers, awaiting their interruption.

**Signature**

```ts
export declare const interruptAll: (fibers: Iterable<Fiber<any, any>>) => Effect.Effect<never, never, void>
```

Added in v1.0.0

## interruptAllWith

Interrupts all fibers as by the specified fiber, awaiting their
interruption.

**Signature**

```ts
export declare const interruptAllWith: (
  fiberId: FiberId.FiberId
) => (fibers: Iterable<Fiber<any, any>>) => Effect.Effect<never, never, void>
```

Added in v1.0.0

## interruptFork

Interrupts the fiber from whichever fiber is calling this method. The
interruption will happen in a separate daemon fiber, and the returned
effect will always resume immediately without waiting.

**Signature**

```ts
export declare const interruptFork: <E, A>(self: Fiber<E, A>) => Effect.Effect<never, never, void>
```

Added in v1.0.0

## interruptWith

Interrupts the fiber as if interrupted from the specified fiber. If the
fiber has already exited, the returned effect will resume immediately.
Otherwise, the effect will resume when the fiber exits.

**Signature**

```ts
export declare const interruptWith: (
  fiberId: FiberId.FiberId
) => <E, A>(self: Fiber<E, A>) => Effect.Effect<never, never, Exit.Exit<E, A>>
```

Added in v1.0.0

## interruptWithFork

Interrupts the fiber as if interrupted from the specified fiber. If the
fiber has already exited, the returned effect will resume immediately.
Otherwise, the effect will resume when the fiber exits.

**Signature**

```ts
export declare const interruptWithFork: (
  fiberId: FiberId.FiberId
) => <E, A>(self: Fiber<E, A>) => Effect.Effect<never, never, void>
```

Added in v1.0.0

# mapping

## map

Maps over the value the Fiber computes.

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => <E>(self: Fiber<E, A>) => Fiber<E, B>
```

Added in v1.0.0

## mapEffect

Effectually maps over the value the fiber computes.

**Signature**

```ts
export declare const mapEffect: <A, E2, A2>(
  f: (a: A) => Effect.Effect<never, E2, A2>
) => <E>(self: Fiber<E, A>) => Fiber<E2 | E, A2>
```

Added in v1.0.0

## mapFiber

Passes the success of this fiber to the specified callback, and continues
with the fiber that it returns.

**Signature**

```ts
export declare const mapFiber: <E, E1, A, B>(
  f: (a: A) => Fiber<E1, B>
) => (self: Fiber<E, A>) => Effect.Effect<never, never, Fiber<E | E1, B>>
```

Added in v1.0.0

# models

## Fiber (interface)

A fiber is a lightweight thread of execution that never consumes more than a
whole thread (but may consume much less, depending on contention and
asynchronicity). Fibers are spawned by forking effects, which run
concurrently with the parent effect.

Fibers can be joined, yielding their result to other fibers, or interrupted,
which terminates the fiber, safely releasing all resources.

**Signature**

```ts
export interface Fiber<E, A> extends Fiber.Variance<E, A> {
  /**
   * The identity of the fiber.
   */
  id(): FiberId.FiberId

  /**
   * Awaits the fiber, which suspends the awaiting fiber until the result of the
   * fiber has been determined.
   * @macro traced
   */
  await(): Effect.Effect<never, never, Exit.Exit<E, A>>

  /**
   * Retrieves the immediate children of the fiber.
   * @macro traced
   */
  children(): Effect.Effect<never, never, Chunk.Chunk<Fiber.Runtime<any, any>>>

  /**
   * Inherits values from all `FiberRef` instances into current fiber. This
   * will resume immediately.
   * @macro traced
   */
  inheritAll(): Effect.Effect<never, never, void>

  /**
   * Tentatively observes the fiber, but returns immediately if it is not
   * already done.
   * @macro traced
   */
  poll(): Effect.Effect<never, never, Option.Option<Exit.Exit<E, A>>>

  /**
   * In the background, interrupts the fiber as if interrupted from the
   * specified fiber. If the fiber has already exited, the returned effect will
   * resume immediately. Otherwise, the effect will resume when the fiber exits.
   * @macro traced
   */
  interruptWithFork(fiberId: FiberId.FiberId): Effect.Effect<never, never, void>
}
```

Added in v1.0.0

## RuntimeFiber (interface)

A runtime fiber that is executing an effect. Runtime fibers have an
identity and a trace.

**Signature**

```ts
export interface RuntimeFiber<E, A> extends Fiber<E, A>, Fiber.RuntimeVariance<E, A> {
  /**
   * The identity of the fiber.
   */
  id(): FiberId.Runtime

  /**
   * The status of the fiber.
   * @macro traced
   */
  status(): Effect.Effect<never, never, FiberStatus.FiberStatus>

  /**
   * Returns the current `RuntimeFlags` the fiber is running with.
   *
   * @macro traced
   */
  runtimeFlags(): Effect.Effect<never, never, RuntimeFlags.RuntimeFlags>

  /**
   * Adds an observer to the list of observers.
   *
   * **NOTE**: This method must be invoked by the fiber itself.
   */
  unsafeAddObserver(observer: (exit: Exit.Exit<E, A>) => void): void

  /**
   * Removes the specified observer from the list of observers that will be
   * notified when the fiber exits.
   *
   * **NOTE**: This method must be invoked by the fiber itself.
   */
  unsafeRemoveObserver(observer: (exit: Exit.Exit<E, A>) => void): void

  /**
   * Deletes the specified fiber ref.
   *
   * **NOTE**: This method must be invoked by the fiber itself.
   */
  unsafeDeleteFiberRef<X>(fiberRef: FiberRef.FiberRef<X>): void

  /**
   * Retrieves all fiber refs of the fiber.
   *
   * **NOTE**: This method is safe to invoke on any fiber, but if not invoked
   * on this fiber, then values derived from the fiber's state (including the
   * log annotations and log level) may not be up-to-date.
   */
  unsafeGetFiberRefs(): FiberRefs.FiberRefs
}
```

Added in v1.0.0

# refinements

## isFiber

Returns `true` if the specified value is a `Fiber`, `false` otherwise.

**Signature**

```ts
export declare const isFiber: (u: unknown) => u is Fiber<unknown, unknown>
```

Added in v1.0.0

## isRuntimeFiber

Returns `true` if the specified `Fiber` is a `RuntimeFiber`, `false`
otherwise.

**Signature**

```ts
export declare const isRuntimeFiber: <E, A>(self: Fiber<E, A>) => self is RuntimeFiber<E, A>
```

Added in v1.0.0

# symbols

## FiberTypeId

**Signature**

```ts
export declare const FiberTypeId: typeof FiberTypeId
```

Added in v1.0.0

## FiberTypeId (type alias)

**Signature**

```ts
export type FiberTypeId = typeof FiberTypeId
```

Added in v1.0.0

## RuntimeFiberTypeId

**Signature**

```ts
export declare const RuntimeFiberTypeId: typeof RuntimeFiberTypeId
```

Added in v1.0.0

## RuntimeFiberTypeId (type alias)

**Signature**

```ts
export type RuntimeFiberTypeId = typeof RuntimeFiberTypeId
```

Added in v1.0.0

# zipping

## zip

Zips this fiber and the specified fiber together, producing a tuple of
their output.

**Signature**

```ts
export declare const zip: <E2, A2>(that: Fiber<E2, A2>) => <E, A>(self: Fiber<E, A>) => Fiber<E2 | E, readonly [A, A2]>
```

Added in v1.0.0

## zipLeft

Same as `zip` but discards the output of that `Fiber`.

**Signature**

```ts
export declare const zipLeft: <E2, A2>(that: Fiber<E2, A2>) => <E, A>(self: Fiber<E, A>) => Fiber<E2 | E, A>
```

Added in v1.0.0

## zipRight

Same as `zip` but discards the output of this `Fiber`.

**Signature**

```ts
export declare const zipRight: <E2, A2>(that: Fiber<E2, A2>) => <E, A>(self: Fiber<E, A>) => Fiber<E2 | E, A2>
```

Added in v1.0.0

## zipWith

Zips this fiber with the specified fiber, combining their results using the
specified combiner function. Both joins and interruptions are performed in
sequential order from left to right.

**Signature**

```ts
export declare const zipWith: <E2, A, B, C>(
  that: Fiber<E2, B>,
  f: (a: A, b: B) => C
) => <E>(self: Fiber<E, A>) => Fiber<E2 | E, C>
```

Added in v1.0.0
