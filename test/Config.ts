import * as ConfigSecret from "@effect/io/Config/Secret"
import * as it from "@effect/io/test/utils/extend"
import * as Chunk from "@fp-ts/data/Chunk"
import * as Equal from "@fp-ts/data/Equal"
import { assert, describe } from "vitest"

describe.concurrent("Config", () => {
  describe.concurrent("Secret", () => {
    it.it("chunk constructor", () => {
      const secret = ConfigSecret.fromChunk(Chunk.fromIterable("secret".split("")))
      assert.isTrue(Equal.equals(secret, ConfigSecret.fromString("secret")))
    })
  })

  it.it("chunk extractor", () => {
    const chunk = Chunk.fromIterable("secret".split(""))
    const secret = ConfigSecret.fromChunk(chunk)
    const value = ConfigSecret.value(secret)
    assert.isTrue(Equal.equals(chunk, value))
  })

  it.it("toString", () => {
    const secret = ConfigSecret.fromString("secret")
    assert.strictEqual(`${secret}`, "ConfigSecret(<redacted>)")
  })

  it.it("wipe", () => {
    const secret = ConfigSecret.fromString("secret")
    ConfigSecret.unsafeWipe(secret)
    assert.isTrue(
      Equal.equals(
        ConfigSecret.value(secret),
        Chunk.unsafeFromArray(
          Array.from({ length: "secret".length }, () => String.fromCharCode(0))
        )
      )
    )
  })
})
