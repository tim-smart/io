import * as Cause from "@effect/io/Cause"
import * as Deferred from "@effect/io/Deferred"
import * as Effect from "@effect/io/Effect"
import * as Exit from "@effect/io/Exit"
import * as Fiber from "@effect/io/Fiber"
import * as Ref from "@effect/io/Ref"
import * as it from "@effect/io/test/utils/extend"
import * as Either from "@fp-ts/data/Either"
import { constFalse, constTrue, pipe } from "@fp-ts/data/Function"
import * as HashSet from "@fp-ts/data/HashSet"
import * as Option from "@fp-ts/data/Option"
import { assert, describe } from "vitest"

describe.concurrent("Effect", () => {
  it.effect("flattens nested effects", () =>
    Effect.gen(function*($) {
      const effect = Effect.succeed(Effect.succeed("test"))
      const flatten1 = yield* $(Effect.flatten(effect))
      const flatten2 = yield* $(Effect.flatten(effect))
      assert.strictEqual(flatten1, "test")
      assert.strictEqual(flatten2, "test")
    }))
  it.effect("flattenErrorOption - fails when given Some error", () =>
    Effect.gen(function*($) {
      const result = yield* $(
        pipe(Effect.fail(Option.some("error")), Effect.flattenErrorOption("default"), Effect.exit)
      )
      assert.deepStrictEqual(Exit.unannotate(result), Exit.fail("error"))
    }))
  it.effect("flattenErrorOption - fails with default when given None error", () =>
    Effect.gen(function*($) {
      const result = yield* $(pipe(Effect.fail(Option.none), Effect.flattenErrorOption("default"), Effect.exit))
      assert.deepStrictEqual(Exit.unannotate(result), Exit.fail("default"))
    }))
  it.effect("flattenErrorOption - succeeds when given a value", () =>
    Effect.gen(function*($) {
      const result = yield* $(pipe(Effect.succeed(1), Effect.flattenErrorOption("default")))
      assert.strictEqual(result, 1)
    }))
  it.effect("ifEffect - runs `onTrue` if result of `b` is `true`", () =>
    Effect.gen(function*($) {
      const result = yield* $(pipe(Effect.succeed(true), Effect.ifEffect(Effect.succeed(true), Effect.succeed(false))))
      assert.isTrue(result)
    }))
  it.effect("ifEffect - runs `onFalse` if result of `b` is `false`", () =>
    Effect.gen(function*($) {
      const result = yield* $(pipe(Effect.succeed(false), Effect.ifEffect(Effect.succeed(true), Effect.succeed(false))))
      assert.isFalse(result)
    }))
  describe.concurrent("", () => {
    it.effect("tapErrorCause - effectually peeks at the cause of the failure of this effect", () =>
      Effect.gen(function*($) {
        const ref = yield* $(Ref.make(false))
        const result = yield* $(
          pipe(Effect.dieMessage("die"), Effect.tapErrorCause(() => pipe(ref, Ref.set(true))), Effect.exit)
        )
        const effect = yield* $(Ref.get(ref))
        assert.isTrue(Exit.isFailure(result) && Option.isSome(Cause.dieOption(result.cause)))
        assert.isTrue(effect)
      }))
  })
  it.effect("tapDefect - effectually peeks at the cause of the failure of this effect", () =>
    Effect.gen(function*($) {
      const ref = yield* $(Ref.make(false))
      const result = yield* $(
        pipe(Effect.dieMessage("die"), Effect.tapDefect(() => pipe(ref, Ref.set(true))), Effect.exit)
      )
      const effect = yield* $(Ref.get(ref))
      assert.isTrue(Exit.isFailure(result) && Option.isSome(Cause.dieOption(result.cause)))
      assert.isTrue(effect)
    }))
  it.effect("tapEither - effectually peeks at the failure of this effect", () =>
    Effect.gen(function*($) {
      const ref = yield* $(Ref.make(0))
      yield* $(pipe(
        Effect.fail(42),
        Effect.tapEither(Either.match((n) => pipe(ref, Ref.set(n)), () => pipe(ref, Ref.set(-1)))),
        Effect.exit
      ))
      const result = yield* $(Ref.get(ref))
      assert.strictEqual(result, 42)
    }))
  it.effect("tapEither - effectually peeks at the success of this effect", () =>
    Effect.gen(function*($) {
      const ref = yield* $(Ref.make(0))
      yield* $(pipe(
        Effect.succeed(42),
        Effect.tapEither(Either.match(() => pipe(ref, Ref.set(-1)), (n) => pipe(ref, Ref.set(n)))),
        Effect.exit
      ))
      const result = yield* $(Ref.get(ref))
      assert.strictEqual(result, 42)
    }))
  it.effect("tapSome - is identity if the function doesn't match", () =>
    Effect.gen(function*($) {
      const ref = yield* $(Ref.make(false))
      const result = yield* $(
        pipe(
          ref,
          Ref.set(true),
          Effect.as(42),
          Effect.tapSome((): Option.Option<Effect.Effect<never, never, never>> => Option.none)
        )
      )
      const effect = yield* $(Ref.get(ref))
      assert.strictEqual(result, 42)
      assert.isTrue(effect)
    }))
  it.effect("tapSome - runs the effect if the function matches", () =>
    Effect.gen(function*($) {
      const ref = yield* $(Ref.make(0))
      const result = yield* $(
        pipe(ref, Ref.set(10), Effect.as(42), Effect.tapSome((n) => Option.some(pipe(ref, Ref.set(n)))))
      )
      const effect = yield* $(Ref.get(ref))
      assert.strictEqual(result, 42)
      assert.strictEqual(effect, 42)
    }))
  it.effect("unless - executes correct branch only", () =>
    Effect.gen(function*($) {
      const ref = yield* $(Ref.make(0))
      yield* $(pipe(ref, Ref.set(1), Effect.unless(constTrue)))
      const v1 = yield* $(Ref.get(ref))
      yield* $(pipe(ref, Ref.set(2), Effect.unless(constFalse)))
      const v2 = yield* $(Ref.get(ref))
      const failure = new Error("expected")
      yield* $(pipe(Effect.fail(failure), Effect.unless(constTrue)))
      const failed = yield* $(pipe(Effect.fail(failure), Effect.unless(constFalse), Effect.either))
      assert.strictEqual(v1, 0)
      assert.strictEqual(v2, 2)
      assert.deepStrictEqual(failed, Either.left(failure))
    }))
  it.effect("unlessEffect - executes condition effect and correct branch", () =>
    Effect.gen(function*($) {
      const effectRef = yield* $(Ref.make(0))
      const conditionRef = yield* $(Ref.make(0))
      const conditionTrue = pipe(conditionRef, Ref.update((n) => n + 1), Effect.as(true))
      const conditionFalse = pipe(conditionRef, Ref.update((n) => n + 1), Effect.as(false))
      yield* $(pipe(effectRef, Ref.set(1), Effect.unlessEffect(conditionTrue)))
      const v1 = yield* $(Ref.get(effectRef))
      const c1 = yield* $(Ref.get(conditionRef))
      yield* $(pipe(effectRef, Ref.set(2), Effect.unlessEffect(conditionFalse)))
      const v2 = yield* $(Ref.get(effectRef))
      const c2 = yield* $(Ref.get(conditionRef))
      const failure = new Error("expected")
      yield* $(pipe(Effect.fail(failure), Effect.unlessEffect(conditionTrue)))
      const failed = yield* $(pipe(Effect.fail(failure), Effect.unlessEffect(conditionFalse), Effect.either))
      assert.strictEqual(v1, 0)
      assert.strictEqual(c1, 1)
      assert.strictEqual(v2, 2)
      assert.strictEqual(c2, 2)
      assert.deepStrictEqual(failed, Either.left(failure))
    }))
  it.effect("when - executes correct branch only", () =>
    Effect.gen(function*($) {
      const ref = yield* $(Ref.make(0))
      yield* $(pipe(ref, Ref.set(1), Effect.when(constFalse)))
      const v1 = yield* $(Ref.get(ref))
      yield* $(pipe(ref, Ref.set(2), Effect.when(constTrue)))
      const v2 = yield* $(Ref.get(ref))
      const failure = new Error("expected")
      yield* $(pipe(Effect.fail(failure), Effect.when(constFalse)))
      const failed = yield* $(pipe(Effect.fail(failure), Effect.when(constTrue), Effect.either))
      assert.strictEqual(v1, 0)
      assert.strictEqual(v2, 2)
      assert.deepStrictEqual(failed, Either.left(failure))
    }))
  it.effect("whenCase - executes correct branch only", () =>
    Effect.gen(function*($) {
      const v1 = Option.none as Option.Option<number>
      const v2 = Option.some(0)
      const ref = yield* $(Ref.make(false))
      yield* $(Effect.whenCase(() => v1, (option) =>
        option._tag === "Some" ?
          Option.some(pipe(ref, Ref.set(true))) :
          Option.none))
      const res1 = yield* $(Ref.get(ref))
      yield* $(Effect.whenCase(() => v2, (option) =>
        option._tag === "Some" ?
          Option.some(pipe(ref, Ref.set(true))) :
          Option.none))
      const res2 = yield* $(Ref.get(ref))
      assert.isFalse(res1)
      assert.isTrue(res2)
    }))
  it.effect("whenCaseEffect - executes condition effect and correct branch", () =>
    Effect.gen(function*($) {
      const v1 = Option.none as Option.Option<number>
      const v2 = Option.some(0)
      const ref = yield* $(Ref.make(false))
      yield* $(pipe(
        Effect.succeed(v1),
        Effect.whenCaseEffect((option) =>
          option._tag === "Some" ?
            Option.some(pipe(ref, Ref.set(true))) :
            Option.none
        )
      ))
      const res1 = yield* $(Ref.get(ref))
      yield* $(pipe(
        Effect.succeed(v2),
        Effect.whenCaseEffect((option) =>
          option._tag === "Some" ?
            Option.some(pipe(ref, Ref.set(true))) :
            Option.none
        )
      ))
      const res2 = yield* $(Ref.get(ref))
      assert.isFalse(res1)
      assert.isTrue(res2)
    }))
  it.effect("whenEffect - executes condition effect and correct branch", () =>
    Effect.gen(function*($) {
      const effectRef = yield* $(Ref.make(0))
      const conditionRef = yield* $(Ref.make(0))
      const conditionTrue = pipe(conditionRef, Ref.update((n) => n + 1), Effect.as(true))
      const conditionFalse = pipe(conditionRef, Ref.update((n) => n + 1), Effect.as(false))
      yield* $(pipe(pipe(effectRef, Ref.set(1)), Effect.whenEffect(conditionFalse)))
      const v1 = yield* $(Ref.get(effectRef))
      const c1 = yield* $(Ref.get(conditionRef))
      yield* $(pipe(pipe(effectRef, Ref.set(2)), Effect.whenEffect(conditionTrue)))
      const v2 = yield* $(Ref.get(effectRef))
      const c2 = yield* $(Ref.get(conditionRef))
      const failure = new Error("expected")
      yield* $(pipe(Effect.fail(failure), Effect.whenEffect(conditionFalse)))
      const failed = yield* $(pipe(Effect.fail(failure), Effect.whenEffect(conditionTrue), Effect.either))
      assert.strictEqual(v1, 0)
      assert.strictEqual(c1, 1)
      assert.strictEqual(v2, 2)
      assert.strictEqual(c2, 2)
      assert.deepStrictEqual(failed, Either.left(failure))
    }))
  it.effect("zipPar - combines results", () =>
    Effect.gen(function*($) {
      const result = yield* $(pipe(
        Effect.succeed(1),
        Effect.zipPar(Effect.succeed(2)),
        Effect.flatMap((tuple) => Effect.succeed(tuple[0] + tuple[1])),
        Effect.map((n) => n === 3)
      ))
      assert.isTrue(result)
    }))
  it.effect("zipPar - does not swallow exit causes of loser", () =>
    Effect.gen(function*($) {
      const result = yield* $(
        pipe(
          Effect.interrupt(),
          Effect.zipPar(Effect.interrupt()),
          Effect.exit,
          Effect.map((exit) =>
            pipe(Exit.causeOption(exit), Option.map(Cause.interruptors), Option.getOrElse(() => HashSet.empty()))
          )
        )
      )
      assert.isAbove(HashSet.size(result), 0)
    }))
  it.effect("zipPar - does not report failure when interrupting loser after it succeeded", () =>
    Effect.gen(function*($) {
      const result = yield* $(
        pipe(
          Effect.interrupt(),
          Effect.zipPar(Effect.succeed(1)),
          Effect.sandbox,
          Effect.either,
          Effect.map(Either.mapLeft(Cause.isInterrupted))
        )
      )
      assert.deepStrictEqual(result, Either.left(true))
    }))
  it.effect("zipPar - paralellizes simple success values", () =>
    Effect.gen(function*($) {
      const countdown = (n: number): Effect.Effect<never, never, number> => {
        return n === 0
          ? Effect.succeed(0)
          : pipe(
            Effect.succeed(1),
            Effect.zipPar(Effect.succeed(2)),
            Effect.flatMap((tuple) => pipe(countdown(n - 1), Effect.map((y) => tuple[0] + tuple[1] + y)))
          )
      }
      const result = yield* $(countdown(50))
      assert.strictEqual(result, 150)
    }))
  it.effect("zipPar - does not kill fiber when forked on parent scope", () =>
    Effect.gen(function*($) {
      const latch1 = yield* $(Deferred.make<never, void>())
      const latch2 = yield* $(Deferred.make<never, void>())
      const latch3 = yield* $(Deferred.make<never, void>())
      const ref = yield* $(Ref.make(false))
      const left = Effect.uninterruptibleMask((restore) =>
        pipe(
          latch2,
          Deferred.succeed<void>(void 0),
          Effect.zipRight(restore(pipe(Deferred.await(latch1), Effect.zipRight(Effect.succeed("foo"))))),
          Effect.onInterrupt(() => pipe(ref, Ref.set(true)))
        )
      )
      const right = pipe(latch3, Deferred.succeed<void>(void 0), Effect.as(42))
      yield* $(
        pipe(
          Deferred.await(latch2),
          Effect.zipRight(Deferred.await(latch3)),
          Effect.zipRight(pipe(latch1, Deferred.succeed<void>(void 0))),
          Effect.fork
        )
      )
      const result = yield* $(pipe(Effect.fork(left), Effect.zipPar(right)))
      const leftInnerFiber = result[0]
      const rightResult = result[1]
      const leftResult = yield* $(Fiber.await(leftInnerFiber))
      const interrupted = yield* $(Ref.get(ref))
      assert.isFalse(interrupted)
      assert.deepStrictEqual(Exit.unannotate(leftResult), Exit.succeed("foo"))
      assert.strictEqual(rightResult, 42)
    }))
})
