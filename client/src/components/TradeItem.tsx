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
    TP: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400",
    SL: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400",
    BE: "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300",
    null: "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300",
  }[trade.result || "null"];

  const resultBg = {
    TP: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400",
    SL: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400",
    BE: "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300",
    null: "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300",
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
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{trade.instrument}</span>
            <span className={cn("text-sm font-mono font-bold", trade.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
              {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
            </span>
            {trade.commission > 0 && (
              <span className="text-[10px] font-mono font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                com: -${trade.commission.toFixed(2)}
              </span>
            )}
          </div>
          {trade.notes && (
            <p className="text-xs opacity-70 dark:opacity-60 truncate text-gray-600 dark:text-gray-400">{trade.notes}</p>
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
          className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
          title="Eliminar trade"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}