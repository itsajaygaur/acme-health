// components/SessionExpiredModalProvider.tsx

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


import { setShowSessionExpiredModal } from '@/lib/sessionExpired';


type SessionExpiredModalContextType = {

  showModal: () => void;

};



const SessionExpiredModalContext = createContext<SessionExpiredModalContextType | undefined>(undefined);



export const useSessionExpiredModal = () => {

  const context = useContext(SessionExpiredModalContext);

  if (!context) throw new Error('useSessionExpiredModal must be used within a SessionExpiredModalProvider');

  return context;

};



export const SessionExpiredModalProvider = ({ children }: { children: ReactNode }) => {

  const [open, setOpen] = useState(false);



  const showModal = () => setOpen(true);



  const handleConfirm = () => {

    setOpen(false);

    window.location.href = '/'; // Adjust as per your login route

  };

useEffect(() => {
  setShowSessionExpiredModal(showModal)
}, [])

  return (

    <SessionExpiredModalContext.Provider value={{ showModal }}>

      {children}


      <AlertDialog  open={open} onOpenChange={setOpen} >
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Session Expired</AlertDialogTitle>
      <AlertDialogDescription>
        Your session has expired. Please log in again.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
      <AlertDialogAction onClick={handleConfirm} >Go to Login</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>


      {/* <Dialog open={open} onOpenChange={setOpen}>

        <DialogContent>

          <DialogHeader>

            <DialogTitle></DialogTitle>

          </DialogHeader>

          <p>Your session has expired. Please log in again.</p>

          <DialogFooter>

            <Button onClick={handleConfirm}>Go to Login</Button>

          </DialogFooter>

        </DialogContent>

      </Dialog> */}

    </SessionExpiredModalContext.Provider>

  );

};