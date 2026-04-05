/*
 * TradeModal — Trading Journal Pro (Multi-Account)
 * Design: Swiss International Style — modal limpio con selector de cuenta
 * Permite ingresar resultado, profit, balance, notas, instrumento e imagen del trade
 */

import { useState, useEffect, useRef } from "react";
import { X, Upload, Trash2, CheckCircle2, XCircle, Minus, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useJournal, TradeResult } from "@/contexts/JournalContext";
import { toast } from "sonner";

interface TradeModalProps {
  open: boolean;
  onClose: () => void;
  date: string; // "YYYY-MM-DD"
  accountId: string;
  existingTradeId?: string;
  onSave: (trade: { result: TradeResult; profit: number; instrument: string; notes: string; imageUrl: string }) => void | Promise<void>;
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

const COMMON_INSTRUMENTS = ["EUR/USD", "GBP/USD", "USD/JPY", "BTC/USD", "ETH/USD", "NASDAQ", "S&P 500"];

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
  const { getTrade, getAccount, updateTrade, deleteTrade } = useJournal();
  const existingTrade = existingTradeId ? getTrade(existingTradeId) : undefined;
  const account = getAccount(accountId);

  const [result, setResult] = useState<TradeResult>(existingTrade?.result ?? null);
  const [profitStr, setProfitStr] = useState(
    existingTrade ? String(existingTrade.profit) : ""
  );
  const [instrument, setInstrument] = useState(existingTrade?.instrument ?? "");
  const [showInstrumentSuggestions, setShowInstrumentSuggestions] = useState(false);
  const [notes, setNotes] = useState(existingTrade?.notes ?? "");
  const [imageUrl, setImageUrl] = useState(existingTrade?.imageUrl ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredInstruments = instrument
    ? COMMON_INSTRUMENTS.filter((i) => i.toLowerCase().includes(instrument.toLowerCase()))
    : [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!result || !profitStr || !instrument) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const tradeData = {
      result,
      profit: parseFloat(profitStr),
      instrument,
      notes,
      imageUrl,
    };

    try {
      if (existingTradeId) {
        await updateTrade(existingTradeId, tradeData);
        toast.success("Trade actualizado correctamente");
        onClose();
      } else {
        if (onSave) {
          await onSave(tradeData);
        }
      }
    } catch (err: any) {
      console.error("Error al guardar trade:", err);
      toast.error(err?.message || "Error al guardar el trade");
    }
  };

  const handleDelete = async () => {
    if (!existingTradeId) return;
    if (confirm("\u00bfEliminar este trade? Los balances se recalcular\u00e1n autom\u00e1ticamente.")) {
      try {
        await deleteTrade(existingTradeId);
        toast.success("Trade eliminado correctamente");
        onClose();
      } catch (err: any) {
        console.error("Error al eliminar trade:", err);
        toast.error(err?.message || "Error al eliminar el trade");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <div className="text-sm font-normal text-gray-600">
                {account?.name} • {formatDate(date)}
              </div>
              <div className="text-lg font-bold text-gray-900 mt-1">
                {existingTradeId ? "Editar trade" : "Nuevo trade"}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Resultado */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <span className="text-red-500">*</span> RESULTADO
            </label>
            <div className="flex gap-3">
              {RESULT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setResult(option.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                    result === option.value
                      ? `${option.bg} border-current`
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <span className={option.color}>{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profit / Pérdida */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <span className="text-red-500">*</span> PROFIT / PÉRDIDA (USD)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={profitStr}
              onChange={(e) => setProfitStr(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Instrumento */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <span className="text-red-500">*</span> INSTRUMENTO / PAR
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="ej: EUR/USD, BTC/USD, NASDAQ"
                value={instrument}
                onChange={(e) => {
                  setInstrument(e.target.value);
                  setShowInstrumentSuggestions(true);
                }}
                onFocus={() => setShowInstrumentSuggestions(true)}
                onBlur={() => setTimeout(() => setShowInstrumentSuggestions(false), 200)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showInstrumentSuggestions && filteredInstruments.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {filteredInstruments.map((inst) => (
                    <button
                      key={inst}
                      onClick={() => {
                        setInstrument(inst);
                        setShowInstrumentSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              NOTAS DEL TRADE
            </label>
            <Textarea
              placeholder="¿Qué hice bien? ¿Qué mejorar? Contexto del mercado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24 resize-none"
            />
          </div>

          {/* Captura de pantalla */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              CAPTURA DEL TRADE
            </label>
            {imageUrl ? (
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img src={imageUrl} alt="Trade screenshot" className="w-full h-full object-cover" />
                <button
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors flex flex-col items-center gap-2 text-gray-600 hover:text-blue-500"
              >
                <ImageIcon size={24} />
                <span className="text-sm">Subir captura de pantalla</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {existingTradeId && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex-1"
            >
              <Trash2 size={16} className="mr-2" />
              Eliminar
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
          >
            {existingTradeId ? "Actualizar" : "Guardar"} trade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
