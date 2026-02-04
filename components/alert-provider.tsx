"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AlertVariant = "default" | "destructive";

type AppAlert = {
  id: number;
  variant?: AlertVariant;
  title?: string;
  description?: ReactNode;
};

type AppAlertContextValue = {
  showAlert: (alert: Omit<AppAlert, "id"> & { autoCloseMs?: number }) => void;
  hideAlert: () => void;
};

const AppAlertContext = createContext<AppAlertContextValue | null>(null);

let nextAlertId = 1;

export function AlertProvider({ children }: { children: ReactNode }) {
  const [currentAlert, setCurrentAlert] = useState<AppAlert | null>(null);

  const hideAlert = useCallback(() => {
    setCurrentAlert(null);
  }, []);

  const showAlert = useCallback(
    (alert: Omit<AppAlert, "id"> & { autoCloseMs?: number }) => {
      const id = nextAlertId++;
      const { autoCloseMs = 4000, ...rest } = alert;

      setCurrentAlert({ id, ...rest });

      if (autoCloseMs > 0) {
        window.setTimeout(() => {
          setCurrentAlert((current) => (current?.id === id ? null : current));
        }, autoCloseMs);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      showAlert,
      hideAlert,
    }),
    [showAlert, hideAlert]
  );

  return (
    <AppAlertContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex justify-end">
        <AnimatePresence mode="wait">
          {currentAlert && (
            <motion.div
              key={currentAlert.id}
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="pointer-events-auto"
            >
              <Alert
                variant={currentAlert.variant}
                className="max-w-md shadow-lg"
              >
                {currentAlert.title && (
                  <AlertTitle className="font-mono">
                    {currentAlert.title}
                  </AlertTitle>
                )}
                {currentAlert.description && (
                  <AlertDescription>{currentAlert.description}</AlertDescription>
                )}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppAlertContext.Provider>
  );
}

export function useAppAlert() {
  const ctx = useContext(AppAlertContext);

  if (!ctx) {
    throw new Error("useAppAlert must be used within an AlertProvider");
  }

  return ctx;
}

