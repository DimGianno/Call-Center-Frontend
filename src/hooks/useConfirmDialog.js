import { useState } from "react";

function useConfirmDialog() {
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isConfirmProcessing, setIsConfirmProcessing] = useState(false);

  function openConfirmDialog(dialogConfig) {
    setConfirmDialog(dialogConfig);
  }

  function closeConfirmDialog() {
    if (!isConfirmProcessing) {
      setConfirmDialog(null);
    }
  }

  async function handleConfirmAction() {
    if (!confirmDialog) {
      return;
    }

    setIsConfirmProcessing(true);

    try {
      await confirmDialog.onConfirm();
      setConfirmDialog(null);
    } finally {
      setIsConfirmProcessing(false);
    }
  }

  return {
    confirmDialog,
    isConfirmProcessing,
    openConfirmDialog,
    closeConfirmDialog,
    handleConfirmAction,
  };
}

export default useConfirmDialog;
