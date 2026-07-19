import { useMemo } from "react"

import { ElementProps, ViewportAppearance } from "../types/element"
import { Viewports } from "../types/general"

/**
 * Resolves the effective appearance values for the given element props
 * and active viewport.
 *
 * Resolution order (highest → lowest priority):
 *   1. Viewport-specific override (mobile / tablet)
 *   2. Desktop baseline (props.labelPosition, .labelAlign, .width, .size)
 *
 * Desktop has no separate override — the baseline IS the desktop value.
 */
export function resolveViewportAppearance(
  props: ElementProps,
  viewport: Viewports
): Required<ViewportAppearance> {
  const baseline: Required<ViewportAppearance> = {
    labelPosition: props.labelPosition,
    labelAlign: props.labelAlign,
    width: props.width,
    size: props.size,
  }

  if (viewport === "desktop") return baseline

  const override = props.viewportStyles[viewport]

  return {
    labelPosition: override.labelPosition ?? baseline.labelPosition,
    labelAlign: override.labelAlign ?? baseline.labelAlign,
    width: override.width ?? baseline.width,
    size: override.size ?? baseline.size,
  }
}

/**
 * React hook that returns the resolved appearance values for the selected
 * element in the currently active viewport.
 *
 * @param props   - The element's full props object
 * @param viewport - The currently active viewport
 */
export function useViewportStyles(
  props: ElementProps,
  viewport: Viewports
): Required<ViewportAppearance> {
  return useMemo(
    () => resolveViewportAppearance(props, viewport),
    [
      viewport,
      props.labelPosition,
      props.labelAlign,
      props.width,
      props.size,
      props.viewportStyles.mobile,
      props.viewportStyles.tablet,
    ]
  )
}

/**
 * Returns only the fields that differ from the desktop baseline for a given
 * viewport — useful when serialising the form JSON for the backend (avoid
 * sending redundant data).
 */
export function getViewportOverrides(
  props: ElementProps,
  viewport: Viewports
): ViewportAppearance {
  if (viewport === "desktop") return {}

  const override = props.viewportStyles[viewport]
  const result: ViewportAppearance = {}

  if (override.labelPosition !== undefined) result.labelPosition = override.labelPosition
  if (override.labelAlign !== undefined) result.labelAlign = override.labelAlign
  if (override.width !== undefined) result.width = override.width
  if (override.size !== undefined) result.size = override.size

  return result
}
