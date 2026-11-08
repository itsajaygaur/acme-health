// utils/sessionExpired.ts

let showSessionExpiredModal: (() => void) | null = null;



export const setShowSessionExpiredModal = (fn: () => void) => {

  showSessionExpiredModal = fn;

};



export const triggerSessionExpiredModal = () => {

  if (showSessionExpiredModal) {

    showSessionExpiredModal();

  }
//    else {

//     alert('Session expired. Please log in again.');

//     window.location.href = '/';

//   }

};