import React from 'react';
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialogProps } from '@/types/ConfirmDialogProps';

function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message }: ConfirmDialogProps) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
          <div className="flex justify-between items-center border-b border-gray-800 p-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              {title}
            </h3>
            <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <p className="text-muted-foreground mb-4">{message}</p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="border-gray-700 hover:bg-gray-800 hover:text-white transition-colors"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={onConfirm}
                className="bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Clear History
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
export default ConfirmDialog;