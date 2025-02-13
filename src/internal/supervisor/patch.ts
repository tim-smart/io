import * as supervisor from "@effect/io/internal/supervisor"
import type * as Supervisor from "@effect/io/Supervisor"
import * as Differ from "@fp-ts/data/Differ"
import * as Equal from "@fp-ts/data/Equal"
import { pipe } from "@fp-ts/data/Function"
import * as HashSet from "@fp-ts/data/HashSet"
import * as List from "@fp-ts/data/List"

/** @internal */
export type SupervisorPatch = Empty | AddSupervisor | RemoveSupervisor | AndThen

/** @internal */
export const OP_EMPTY = 0 as const

/** @internal */
export type OP_EMPTY = typeof OP_EMPTY

/** @internal */
export const OP_ADD_SUPERVISOR = 1 as const

/** @internal */
export type OP_ADD_SUPERVISOR = typeof OP_ADD_SUPERVISOR

/** @internal */
export const OP_REMOVE_SUPERVISOR = 2 as const

/** @internal */
export type OP_REMOVE_SUPERVISOR = typeof OP_REMOVE_SUPERVISOR

/** @internal */
export const OP_AND_THEN = 3 as const

/** @internal */
export type OP_AND_THEN = typeof OP_AND_THEN

/** @internal */
export interface Empty {
  readonly op: OP_EMPTY
}

/** @internal */
export interface AddSupervisor {
  readonly op: OP_ADD_SUPERVISOR
  readonly supervisor: Supervisor.Supervisor<any>
}

/** @internal */
export interface RemoveSupervisor {
  readonly op: OP_REMOVE_SUPERVISOR
  readonly supervisor: Supervisor.Supervisor<any>
}

/** @internal */
export interface AndThen {
  readonly op: OP_AND_THEN
  readonly first: SupervisorPatch
  readonly second: SupervisorPatch
}

/**
 * The empty `SupervisorPatch`.
 *
 * @internal
 */
export const empty: SupervisorPatch = { op: OP_EMPTY }

/**
 * Combines two patches to produce a new patch that describes applying the
 * updates from this patch and then the updates from the specified patch.
 *
 * @internal
 */
export const combine = (self: SupervisorPatch, that: SupervisorPatch): SupervisorPatch => {
  return {
    op: OP_AND_THEN,
    first: self,
    second: that
  }
}

/**
 * Applies a `SupervisorPatch` to a `Supervisor` to produce a new `Supervisor`.
 *
 * @internal
 */
export const patch = (
  self: SupervisorPatch,
  supervisor: Supervisor.Supervisor<any>
): Supervisor.Supervisor<any> => {
  return patchLoop(supervisor, List.of(self))
}

/** @internal */
const patchLoop = (
  _supervisor: Supervisor.Supervisor<any>,
  _patches: List.List<SupervisorPatch>
): Supervisor.Supervisor<any> => {
  let supervisor = _supervisor
  let patches = _patches
  while (List.isCons(patches)) {
    switch (patches.head.op) {
      case OP_EMPTY: {
        patches = patches.tail
        break
      }
      case OP_ADD_SUPERVISOR: {
        supervisor = supervisor.zip(patches.head.supervisor)
        patches = patches.tail
        break
      }
      case OP_REMOVE_SUPERVISOR: {
        supervisor = removeSupervisor(supervisor, patches.head.supervisor)
        patches = patches.tail
        break
      }
      case OP_AND_THEN: {
        patches = List.cons(patches.head.first, List.cons(patches.head.second, patches.tail))
        break
      }
    }
  }
  return supervisor
}

/** @internal */
const removeSupervisor = (
  self: Supervisor.Supervisor<any>,
  that: Supervisor.Supervisor<any>
): Supervisor.Supervisor<any> => {
  if (Equal.equals(self, that)) {
    return supervisor.none
  } else {
    if (self instanceof supervisor.Zip) {
      return removeSupervisor(self.left, that).zip(removeSupervisor(self.right, that))
    } else {
      return self
    }
  }
}

/** @internal */
const toSet = (self: Supervisor.Supervisor<any>): HashSet.HashSet<Supervisor.Supervisor<any>> => {
  if (Equal.equals(self, supervisor.none)) {
    return HashSet.empty()
  } else {
    if (self instanceof supervisor.Zip) {
      return pipe(toSet(self.left), HashSet.union(toSet(self.right)))
    } else {
      return HashSet.make(self)
    }
  }
}

/** @internal */
export const diff = (
  oldValue: Supervisor.Supervisor<any>,
  newValue: Supervisor.Supervisor<any>
): SupervisorPatch => {
  if (Equal.equals(oldValue, newValue)) {
    return empty
  }
  const oldSupervisors = toSet(oldValue)
  const newSupervisors = toSet(newValue)
  const added = pipe(
    newSupervisors,
    HashSet.difference(oldSupervisors),
    HashSet.reduce(
      empty as SupervisorPatch,
      (patch, supervisor) => combine(patch, { op: OP_ADD_SUPERVISOR, supervisor })
    )
  )
  const removed = pipe(
    oldSupervisors,
    HashSet.difference(newSupervisors),
    HashSet.reduce(
      empty as SupervisorPatch,
      (patch, supervisor) => combine(patch, { op: OP_REMOVE_SUPERVISOR, supervisor })
    )
  )
  return combine(added, removed)
}

/** @internal */
export const differ = Differ.make<Supervisor.Supervisor<any>, SupervisorPatch>({
  empty,
  patch,
  combine,
  diff
})
