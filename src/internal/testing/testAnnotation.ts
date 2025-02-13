import type * as Fiber from "@effect/io/Fiber"
import * as Chunk from "@fp-ts/data/Chunk"
import * as Context from "@fp-ts/data/Context"
import * as Either from "@fp-ts/data/Either"
import * as Equal from "@fp-ts/data/Equal"
import { pipe } from "@fp-ts/data/Function"
import * as HashSet from "@fp-ts/data/HashSet"
import type * as MutableRef from "@fp-ts/data/mutable/MutableRef"
import type * as SortedSet from "@fp-ts/data/SortedSet"

const TestAnnotationSymbolKey = "@effect/test/TestAnnotation"
export const TestAnnotationTypeId = Symbol.for(TestAnnotationSymbolKey)
export type TestAnnotationTypeId = typeof TestAnnotationTypeId

export interface TestAnnotation<A> extends Equal.Equal {
  readonly [TestAnnotationTypeId]: TestAnnotationTypeId
  readonly identifier: string
  readonly tag: Context.Tag<A>
  readonly initial: A
  readonly combine: (a: A, b: A) => A
}

class TestAnnotationImpl<A> implements Equal.Equal {
  readonly [TestAnnotationTypeId]: TestAnnotationTypeId = TestAnnotationTypeId
  constructor(
    readonly identifier: string,
    readonly tag: Context.Tag<A>,
    readonly initial: A,
    readonly combine: (a: A, b: A) => A
  ) {}
  [Equal.symbolHash](): number {
    return pipe(
      Equal.hash(TestAnnotationSymbolKey),
      Equal.hashCombine(Equal.hash(this.identifier)),
      Equal.hashCombine(Equal.hash(this.tag))
    )
  }
  [Equal.symbolEqual](that: unknown): boolean {
    return isTestAnnotation(that) &&
      this.identifier === that.identifier &&
      Equal.equals(this.tag, that.tag)
  }
}

export const isTestAnnotation = (u: unknown): u is TestAnnotation<unknown> => {
  return typeof u === "object" && u != null && TestAnnotationTypeId in u
}

export const make = <A>(
  identifier: string,
  tag: Context.Tag<A>,
  initial: A,
  combine: (a: A, b: A) => A
): TestAnnotation<A> => {
  return new TestAnnotationImpl(identifier, tag, initial, combine)
}

export const compose = <A>(
  left: Either.Either<number, Chunk.Chunk<A>>,
  right: Either.Either<number, Chunk.Chunk<A>>
): Either.Either<number, Chunk.Chunk<A>> => {
  if (Either.isLeft(left) && Either.isLeft(right)) {
    return Either.left(left.left + right.left)
  }
  if (Either.isRight(left) && Either.isRight(right)) {
    return Either.right(pipe(left.right, Chunk.concat(right.right)))
  }
  if (Either.isRight(left) && Either.isLeft(right)) {
    return right
  }
  if (Either.isLeft(left) && Either.isRight(right)) {
    return right
  }
  throw new Error("BUG: TestAnnotation.compose - please report an issue at https://github.com/Effect-TS/io/issues")
}

export const fibers: TestAnnotation<
  Either.Either<
    number,
    Chunk.Chunk<MutableRef.MutableRef<SortedSet.SortedSet<Fiber.RuntimeFiber<unknown, unknown>>>>
  >
> = make(
  "fibers",
  Context.Tag<
    Either.Either<number, Chunk.Chunk<MutableRef.MutableRef<SortedSet.SortedSet<Fiber.RuntimeFiber<unknown, unknown>>>>>
  >(),
  Either.left(0),
  compose
)

/**
 * An annotation which counts ignored tests.
 */
export const ignored: TestAnnotation<number> = make(
  "ignored",
  Context.Tag<number>(),
  0,
  (a, b) => a + b
)

/**
 * An annotation which counts repeated tests.
 */
export const repeated: TestAnnotation<number> = make(
  "repeated",
  Context.Tag<number>(),
  0,
  (a, b) => a + b
)

/**
 * An annotation which counts retried tests.
 */
export const retried: TestAnnotation<number> = make(
  "retried",
  Context.Tag<number>(),
  0,
  (a, b) => a + b
)

/**
 * An annotation which tags tests with strings.
 */
export const tagged: TestAnnotation<HashSet.HashSet<string>> = make(
  "tagged",
  Context.Tag<HashSet.HashSet<string>>(),
  HashSet.empty(),
  (a, b) => pipe(a, HashSet.union(b))
)
