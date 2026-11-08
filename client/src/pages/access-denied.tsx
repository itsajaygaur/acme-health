import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";

export default function AccessDenied() {
  const [location, setLocation] = useLocation();
  const [showLockoutDialog, setShowLockoutDialog] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  // Check for active lockout on page load
  useEffect(() => {
    const savedLockoutEndTime = localStorage.getItem('lockoutEndTime');
    
    if (savedLockoutEndTime) {
      const endTime = parseInt(savedLockoutEndTime);
      const now = Date.now();
      
      if (endTime > now) {
        setRemainingTime(endTime - now);
        setShowLockoutDialog(true);
        
        // Start countdown timer
        const interval = setInterval(() => {
          const currentTime = Date.now();
          const remaining = Math.max(0, endTime - currentTime);
          setRemainingTime(remaining);
          
          if (remaining === 0) {
            localStorage.removeItem('lockoutEndTime');
            localStorage.removeItem('failedAttempts');
            setShowLockoutDialog(false);
            clearInterval(interval);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      } else {
        // Lockout expired, clear localStorage
        localStorage.removeItem('lockoutEndTime');
        localStorage.removeItem('failedAttempts');
      }
    }
  }, []);

  // Format remaining time as MM:SS
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-red-600 mb-4">
          Access Denied
        </h1>
      </div>

      {/* Lockout Dialog */}
      <Dialog open={showLockoutDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[400px] [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Account Temporarily Locked</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Clock className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Too many failed login attempts. Your account has been temporarily locked for security purposes.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-2">Time Remaining:</p>
                <div className="text-2xl font-bold text-red-600 font-mono">
                  {formatTime(remainingTime)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Please wait until the timer expires before attempting to log in again.
              </p>
            </div>
            
            <div className="flex justify-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowLockoutDialog(false)}
              >
                OK
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowLockoutDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}