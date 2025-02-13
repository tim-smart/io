import type * as LogSpan from "@effect/io/Logger/Span"

/** @internal */
export const make = (label: string, startTime: number): LogSpan.LogSpan => ({
  label,
  startTime
})

/** @internal */
export const render = (now: number) => {
  return (self: LogSpan.LogSpan): string => {
    const label = self.label.indexOf(" ") < 0 ? self.label : `"${self.label}"`
    return `${label}=${now - self.startTime}ms`
  }
}
