import { useEffect } from "react";

/**
 * Hook to manage ARIA attributes on HTML elements
 * @param elementRef Reference to the HTML element
 * @param attributeName Name of the ARIA attribute (without 'aria-' prefix)
 * @param isEnabled Whether the attribute should be enabled or disabled
 */
export function useAriaAttr(
  elementRef: React.RefObject<HTMLElement>,
  attributeName: string,
  isEnabled: boolean
) {
  useEffect(() => {
    const targetElement = elementRef.current;
    if (!targetElement) return;

    if (isEnabled) targetElement.setAttribute(attributeName, "true");
    else targetElement.removeAttribute(attributeName);
  }, [elementRef, attributeName, isEnabled]);
}
