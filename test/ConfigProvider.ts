import * as Config from "@effect/io/Config"
import * as ConfigProvider from "@effect/io/Config/Provider"
import * as Effect from "@effect/io/Effect"
import * as it from "@effect/io/test/utils/extend"
import { pipe } from "@fp-ts/data/Function"
// import type * as List from "@fp-ts/data/List"
import { assert, describe } from "vitest"

interface HostPort {
  readonly host: string
  readonly port: number
}

const hostPortConfig: Config.Config<HostPort> = Config.struct({
  host: Config.string("host"),
  port: Config.integer("port")
})

// interface HostPorts {
//   readonly hostPorts: List.List<HostPort>
// }

// const hostPortsConfig: Config.Config<HostPorts> = Config.struct({
//   hostPorts: Config.listOf(hostPortConfig, "hostPorts")
// })

interface ServiceConfig {
  readonly hostPort: HostPort
  readonly timeout: number
}

const serviceConfigConfig: Config.Config<ServiceConfig> = Config.struct({
  hostPort: pipe(hostPortConfig, Config.nested("hostPort")),
  timeout: Config.integer("timeout")
})

const provider = (map: Map<string, string>): ConfigProvider.ConfigProvider => {
  return ConfigProvider.fromMap(map)
}

describe.concurrent("ConfigProvider", () => {
  it.effect("flat atoms", () =>
    Effect.gen(function*() {
      const map = new Map([["host", "localhost"], ["port", "8080"]])
      const config = yield* provider(map).load(hostPortConfig)
      assert.deepStrictEqual(config, {
        host: "localhost",
        port: 8080
      })
    }))

  it.effect("nested atoms", () =>
    Effect.gen(function*() {
      const map = new Map([
        ["hostPort.host", "localhost"],
        ["hostPort.port", "8080"],
        ["timeout", "1000"]
      ])
      const config = yield* provider(map).load(serviceConfigConfig)
      assert.deepStrictEqual(config, {
        hostPort: {
          host: "localhost",
          port: 8080
        },
        timeout: 1000
      })
    }))

  // TODO(Max): fix
  // it.effect("top-level list with same number of elements per key", () =>
  //   Effect.gen(function*() {
  //     const map = new Map([
  //       ["hostPorts.host", "localhost,localhost,localhost"],
  //       ["hostPorts.port", "8080,8080,8080"]
  //     ])
  //     const config = yield* provider(map).load(hostPortsConfig)
  //     console.log(config)
  //     assert.deepStrictEqual(config, {
  //       hostPorts: List.fromIterable(
  //         Array.from({ length: 3 }, () => ({ host: "localhost", port: 8080 }))
  //       )
  //     })
  //   }))
})
