import { useEffect, useRef } from "react";
import { Button } from "../../components/ui/Button";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) dialog.showModal();
    else dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="backdrop:bg-black/50 p-0 rounded-lg"
    >
      <div className="p-6">
        <header className="flex justify-between items-center border-b pb-2">
          <h2>{title || "Notification"}</h2>
          <Button variant="primary" size="lg" onClick={onClose}>
            Test btn
          </Button>
        </header>
        <main>{children}</main>
      </div>
    </dialog>
  );
};

export { Modal };
