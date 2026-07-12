import type { ReactNode } from "react";
import useBodyScrollLock from "../hooks/useBodyScrollLock";

interface ModalProps {
  children: ReactNode;
  className: string;
  isTutorialActive?: boolean;
  labelledBy: string;
  overlayClassName?: string;
}

function Modal({
  children,
  className,
  isTutorialActive = false,
  labelledBy,
  overlayClassName = "",
}: ModalProps) {
  useBodyScrollLock();

  const overlayClasses = ["modal-overlay", overlayClassName].filter(Boolean).join(" ");

  return (
    <div className={overlayClasses}>
      <section
        className={`modal-surface ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        data-tutorial-active={isTutorialActive ? "true" : undefined}
      >
        {children}
      </section>
    </div>
  );
}

export default Modal;
