import { toast } from 'react-toastify';

export const toastSuccess = (toastMsg: string) => toast.success(toastMsg, {
    position: "top-right",
    autoClose: 7000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    theme: "dark",
});

export const toastError = (toastMsg: string) => toast.error(toastMsg, {
    position: "top-right",
    autoClose: 7000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    theme: "dark",
});