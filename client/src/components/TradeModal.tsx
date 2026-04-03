/**
 * TradeModal — Trading Journal Pro (Multi-Account)
 * Design: Swiss International Style — modal limpio con selector de cuenta
 * Permite ingresar resultado, profit, balance, notas e imagen del trade
 */

import { useState, useEffect, useRef } from "react";
import { X, Upload, Trash2, CheckCircle2, XCircle, Minus, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useJournal, TradeResult } from "@/contexts/JournalContext";

interface TradeModalProps {
  open: boolean;
  onClose: () => void;
  date: string; // "YYYY-MM-DD"
  accountId: string;
  existingTradeId?: string;
  onSave: (trade: { result: TradeResult; profit: number; notes: string; imageUrl: string }) => void;
  onDelete?: () => void;
}

const RESULT_OPTIONS: { value: TradeResult; label: string; color: string; bg: string; icon: React.ReactNode }[] = [
  {
    value: "TP",
    label: "Take Profit",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-300 hover:bg-emerald-100",
    icon: <CheckCircle2 size={16} />,
  },
  {
    value: "SL",
    label: "Stop Loss",
    color: "text-red-600",
    bg: "bg-red-50 border-red-300 hover:bg-red-100",
    icon: <XCircle size={16} />,
  },
  {
    value: "BE",
    label: "Break Even",
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-300 hover:bg-gray-100",
    icon: <Minus size={16} />,
  },
];

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function TradeModal({
  open,
  onClose,
  date,
  accountId,
  existingTradeId,
  onSave,
  onDelete,
}: TradeModalProps) {
  const { getTrade, getAccount } = useJournal();
  const existingTrade = existingTradeId ? getTrade(existingTradeId) : undefined;
  const account = getAccount(accountId);

  const [result, setResult] = useState<TradeResult>(existingTrade?.result ?? null);
  const [profitStr, setProfitStr] = useState(
    existingTrade ? String(existingTrade.profit) : ""
  );
  const [notes, setNotes] = useState(existingTrade?.notes ?? "");
  const [imageUrl, setImageUrl] = useState(existingTrade?.imageUrl ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setResult(existingTrade?.result ?? null);
      setProfitStr(existingTrade ? String(existingTrade.profit) : "");
      setNotes(existingTrade?.notes ?? "");
      setImageUrl(existingTrade?.imageUrl ?? "");
    }
  }, [open, existingTrade]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const profit = parseFloat(profitStr) || 0;
    onSave({ result, profit, notes, imageUrl });
    onClose();
  };

  const isValid = result !== null && profitStr !== "";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-full bg-white border border-gray-100 shadow-2xl rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-[#111827] px-6 py-4">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: account?.color || "#10b981" }}
              />
              <DialogTitle className="text-white font-semibold text-base">
                {account?.name || "Cuenta"}
              </DialogTitle>
            </div>
            <p className="text-gray-400 text-xs mt-0.5 capitalize">{formatDate(date)}</p>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Result selector */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Resultado
            </label>
            <div className="grid grid-cols-3 gap-2">
              {RESULT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setResult(opt.value)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 text-sm font-semibold transition-all",
                    opt.bg,
                    opt.color,
                    result === opt.value
                      ? "ring-2 ring-offset-1 ring-current scale-[1.02]"
                      : "opacity-60"
                  )}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Profit */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Profit / Pérdida (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                $
              </span>
              <input
                type="number"
                value={profitStr}
                onChange={(e) => setProfitStr(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Notas del trade
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Qué hice bien? ¿Qué mejorar? Contexto del mercado..."
              className="resize-none h-24 text-sm bg-gray-50 border-gray-200 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Captura del trade
            </label>
            {imageUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imageUrl}
                  alt="Trade screenshot"
                  className="w-full h-36 object-cover"
                />
                <button
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors"
              >
                <ImageIcon size={20} />
                <span className="text-xs font-medium">Subir captura de pantalla</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            {existingTrade && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { onDelete(); onClose(); }}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
              >
                <Trash2 size={14} />
                Eliminar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isValid}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              Guardar trade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
