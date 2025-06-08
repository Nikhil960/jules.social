import { toast } from 'react-toastify';

// You can configure default options for all toasts here if needed
// Example:
// toast.configure({
//   autoClose: 8000,
//   draggable: false,
//   // etc...
// });

export default toast;

// You can also export specific types of toasts if you want to pre-configure them
export const toastSuccess = (message) => toast.success(message);
export const toastError = (message) => toast.error(message);
export const toastInfo = (message) => toast.info(message);
export const toastWarning = (message) => toast.warn(message);
export const toastPromise = (promise, messages, options) => {
    const { pending, success, error } = messages;
    return toast.promise(promise, {
        pending: pending || 'Loading...',
        success: success || 'Success!',
        error: error || 'Something went wrong!'
    }, options);
};
