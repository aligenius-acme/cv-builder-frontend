import { useState, useCallback } from 'react';

/**
 * Custom hook for managing modal state
 *
 * Replaces the common pattern:
 * ```typescript
 * const [showModal, setShowModal] = useState(false);
 * ```
 *
 * With a cleaner API:
 * ```typescript
 * const modal = useModal();
 * // modal.isOpen, modal.open(), modal.close(), modal.toggle()
 * ```
 *
 * @param defaultOpen - Initial state of the modal (default: false)
 * @returns Object with isOpen state and control functions
 *
 * @example
 * ```typescript
 * const deleteModal = useModal();
 *
 * <Button onClick={deleteModal.open}>Delete</Button>
 * <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close}>
 *   ...
 * </Modal>
 * ```
 */
export function useModal(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen, // For advanced use cases
  };
}
