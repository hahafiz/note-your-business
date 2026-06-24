import { Modal } from "../../components/ui/Modal";
import { useState } from "react";

interface ModalSharing {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function ModalSharing({ isOpen, onClose, title }: ModalSharing) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share ${title}`}>
      <p>Test Modal</p>
    </Modal>
  );
}
