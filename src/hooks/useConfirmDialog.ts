import { useState } from "react";
import type { ConfirmDialogConfig } from "../types";

function useConfirmDialog() {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogConfig | null>(null);
  const [isConfirmProcessing, setIsConfirmProcessing] = useState(false);

  function openConfirmDialog(dialogConfig: ConfirmDialogConfig) {
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
