import { CreateFormInput } from "../schemas/requests"
import { FormElement } from "../types/element"

interface StoreSnapshot {
  formTitle: string
  formDescription: string
  elements: FormElement[]
}

/**
 * Converts the current Zustand store state into a validated JSON payload
 * ready to be sent to the backend.
 *
 * `viewportStyles` is included inline on every element so the backend
 * receives the full picture for each breakpoint.
 */
export function buildFormPayload(state: StoreSnapshot): CreateFormInput {
  return {
    title: state.formTitle,
    description: state.formDescription || undefined,
    elements: state.elements.map((el: FormElement) => ({
      id: el.id,
      type: el.type,
      props: {
        ...el.props,
        viewportStyles: {
          mobile: el.props.viewportStyles.mobile,
          tablet: el.props.viewportStyles.tablet,
        },
      },
    })),
  }
}
