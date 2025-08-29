import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

type ModalProps = Readonly<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}>;

export function Modal({ open, onClose, title, children }: ModalProps) {
  const { t } = useTranslation();
  const dlgRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dlg = dlgRef.current;
    if (!dlg) return;

    if (open) {
      if (!dlg.open) {
        try {
          dlg.showModal();
        } catch {
          if (!dlg.open) dlg.setAttribute("open", "");
        }
      }
    } else if (dlg.open) {
      dlg.close();
    }
  }, [open]);

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    e.preventDefault();
    onClose();
  };

  const handleClose = () => {
    if (open) onClose();
  };

  if (!open && !dlgRef.current?.open) {
    return null;
  }

  return (
    <dialog
      ref={dlgRef}
      aria-labelledby="modal-title"
      onCancel={handleCancel}
      onClose={handleClose}
      className="m-auto w-[min(92vw,40rem)] rounded-2xl p-0 border-0">
      <div className="relative w-full rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>

          {/* Interactive Close-Button (A11y-compliant) */}
          <button
            type="button"
            onClick={onClose}
            aria-label={t("status.closeModal")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-3">{children}</div>
      </div>
    </dialog>
  );
}
