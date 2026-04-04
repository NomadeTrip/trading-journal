/*
 * TradeItem — Trading Journal Pro
 * Componente para mostrar un trade individual con opciones editar/eliminar
 */

import { TradeEntry } from "@/contexts/JournalContext";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TradeItemProps {
  trade: TradeEntry;
  onEdit: (trade: TradeEntry) => void;
  onDelete: (tradeId: string) => void;
}

export default function TradeItem({ trade, onEdit, onDelete }: TradeItemProps) {
  const resultColor = {
    TP: "bg-green-50 border-green-200 text-green-700",
    SL: "bg-red-50 border-red-200 text-red-700",
    BE: "bg-gray-50 border-gray-200 text-gray-700",
    null: "bg-gray-50 border-gray-200 text-gray-700",
  }[trade.result || "null"];

  const resultBg = {
    TP: "bg-green-100",
    SL: "bg-red-100",
    BE: "bg-gray-100",
    null: "bg-gray-100",
  }[trade.result || "null"];

  const resultText = {
    TP: "Take Profit",
    SL: "Stop Loss",
    BE: "Break Even",
    null: "—",
  }[trade.result || "null"];

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm",
        resultColor
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Result badge */}
        <div className={cn("px-2 py-1 rounded text-xs font-semibold", resultBg)}>
          {resultText}
        </div>

        {/* Trade details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold">{trade.instrument}</span>
            <span className={cn("text-sm font-mono font-bold", trade.profit >= 0 ? "text-green-600" : "text-red-600")}>
              {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
            </span>
          </div>
          {trade.notes && (
            <p className="text-xs opacity-70 truncate">{trade.notes}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-2">
        <Button
          onClick={() => onEdit(trade)}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          title="Editar trade"
        >
          <Edit2 size={16} />
        </Button>
        <Button
          onClick={() => {
            if (confirm("¿Eliminar este trade? Los balances se recalcularán automáticamente.")) {
              onDelete(trade.id);
            }
          }}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Eliminar trade"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}
