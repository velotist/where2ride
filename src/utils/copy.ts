export async function copyText(
  text: string,
  onSuccess: () => void,
  onError: () => void
) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const temporaryTextArea = document.createElement("textarea");
      temporaryTextArea.value = text;
      temporaryTextArea.setAttribute("readonly", "");
      temporaryTextArea.style.position = "fixed";
      temporaryTextArea.style.left = "-1000px";
      document.body.appendChild(temporaryTextArea);
      temporaryTextArea.select();
      document.body.removeChild(temporaryTextArea);
    }
    onSuccess();
  } catch {
    onError();
  }
}

export const formatCoordinateToSixDecimals = (coordinate: number) =>
  coordinate.toFixed(6);
