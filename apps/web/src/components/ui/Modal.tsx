import { Button } from "../../components/ui/Button";

type ModalPosition = "center" | "top" | "bottom" | "drawer-right";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: ModalPosition;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  position = "center",
  children,
}: ModalProps) => {
  if (!isOpen) return null;

  const positionClasses: Record<ModalPosition, string> = {
    center: "items-center justify-center",
    top: "items-start justify-center pt-16",
    bottom: "items-end justify-center",
    "drawer-right": "items-stretch justify-end",
  };

  const cardClasses: Record<ModalPosition, string> = {
    center: "rounded-lg max-w-lg w-full -m-4",
    top: "rounded-lg max-w-lg w-full m4",
    bottom: "rounded-t-2xl w-full max-w-xl",
    "drawer-right": "h-full max-w-md w-full",
  };

  return (
    // backdrop overlay
    <div
      className={`fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm transition-opacity ${positionClasses[position]}`}
      onClick={onClose}
    >
      {/* modal content */}
      <div
        className={`bg-white p-6 shadow-xl transform transition-all ${cardClasses[position]}`}
        onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside
      >
        <header className="flex justify-between">
          <h2 className="text-lg font-semibold">{title || "Notification"}</h2>
          <Button variant="ghost" onClick={onClose}>
            &#x2715;
          </Button>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
};

export { Modal };
