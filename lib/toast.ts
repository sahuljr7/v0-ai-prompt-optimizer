import { toast as sonnerToast } from 'sonner';

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  switch (type) {
    case 'success':
      sonnerToast.success(message);
      break;
    case 'error':
      sonnerToast.error(message);
      break;
    default:
      sonnerToast.message(message);
  }
}
