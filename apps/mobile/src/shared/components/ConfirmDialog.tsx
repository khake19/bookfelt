import { Text } from "react-native";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@bookfelt/ui";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
}: ConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="rounded-2xl px-6 py-5">
        <AlertDialogHeader className="items-center">
          <AlertDialogTitle className="text-foreground font-serif text-base">
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-muted text-xs text-center">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-3 mt-2">
          <AlertDialogCancel className="flex-1 rounded-full border-border">
            <Text className="text-foreground text-sm">{cancelLabel}</Text>
          </AlertDialogCancel>
          <AlertDialogAction
            onPress={onConfirm}
            className={`flex-1 rounded-full ${destructive ? "bg-destructive" : "bg-primary"}`}
          >
            <Text className="text-background text-sm font-medium">
              {confirmLabel}
            </Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
