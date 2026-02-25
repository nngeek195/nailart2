"use client";
import * as React from "react";
import { X } from "lucide-react";

type DialogProps = { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void };

const DialogContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void }>({
    open: false,
    setOpen: () => { }
});

const Dialog = ({ children, open, onOpenChange }: DialogProps) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isOpen = open !== undefined ? open : internalOpen;
    const handleOpenChange = (val: boolean) => {
        if (onOpenChange) onOpenChange(val);
        setInternalOpen(val);
    };

    return (
        <DialogContext.Provider value={{ open: isOpen, setOpen: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

const DialogTrigger = ({ asChild = true, children, ...props }: any) => {
    const { setOpen } = React.useContext(DialogContext);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: () => setOpen(true),
            ...props
        });
    }
    return <button onClick={() => setOpen(true)} {...props}>{children}</button>;
};

const DialogContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    const { open, setOpen } = React.useContext(DialogContext);

    // Listen for ESC key to close
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        if (open) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [open, setOpen]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setOpen(false)} />

            <div
                className={`bg-white rounded-2xl shadow-2xl w-full relative overflow-hidden flex flex-col max-h-[95vh] z-[101] ${className}`}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 z-[110] p-2 bg-white/80 rounded-full hover:bg-gray-100 transition shadow-sm border border-gray-100"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>
                {children}
            </div>
        </div>
    );
};

// --- NEW EXPORTS TO MAKE THE MODAL WORK ---

const DialogHeader = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`px-6 py-4 border-b border-gray-50 ${className}`}>
        {children}
    </div>
);

const DialogTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <h2 className={`text-xl font-bold text-gray-900 ${className}`}>
        {children}
    </h2>
);

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };