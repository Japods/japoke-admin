import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar accion',
  message = 'Esta seguro de continuar?',
  confirmLabel = 'Confirmar',
  confirmVariant = 'primary',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} className="w-full max-w-md mx-4">
      <div className="p-6">
        <h3 className="text-lg font-heading font-bold text-negro mb-2">{title}</h3>
        <p className="text-gris text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
