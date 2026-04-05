/**
 * AccountManager — Trading Journal Pro
 * Design: Swiss International Style — gestión de cuentas
 * Crear, editar, eliminar y seleccionar cuentas de trading
 */

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, ChevronDown, Calendar, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useJournal, TradingAccount, ACCOUNT_COLORS } from "@/contexts/JournalContext";

const ACCOUNT_COLORS_LIST = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

interface AccountManagerProps {
  selectedAccountId: string;
  onSelectAccount: (accountId: string) => void;
}

export default function AccountManager({
  selectedAccountId,
  onSelectAccount,
}: AccountManagerProps) {
  const { getAllAccounts, createAccount, updateAccount, deleteAccount, getAccount, getAccountBalance } = useJournal();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", initialBalance: "" });
  const [selectedColor, setSelectedColor] = useState(ACCOUNT_COLORS_LIST[0]);

  const accounts = getAllAccounts();
  const selectedAccount = getAccount(selectedAccountId);
  const currentBalance = getAccountBalance(selectedAccountId);

  const handleCreateAccount = async () => {
    if (!formData.name.trim() || !formData.initialBalance) return;
    try {
      await createAccount(formData.name, parseFloat(formData.initialBalance), selectedColor);
      setFormData({ name: "", initialBalance: "" });
      setSelectedColor(ACCOUNT_COLORS_LIST[0]);
      setShowCreateModal(false);
      toast.success("Cuenta creada correctamente");
    } catch (err: any) {
      console.error("Error al crear cuenta:", err);
      toast.error(err?.message || "Error al crear la cuenta");
    }
  };

  const handleUpdateAccount = async () => {
    if (!editingId || !formData.name.trim()) return;
    try {
      await updateAccount(editingId, {
        name: formData.name,
        initialBalance: parseFloat(formData.initialBalance) || undefined,
        color: selectedColor,
      });
      setEditingId(null);
      setFormData({ name: "", initialBalance: "" });
      setShowCreateModal(false);
      toast.success("Cuenta actualizada correctamente");
    } catch (err: any) {
      console.error("Error al actualizar cuenta:", err);
      toast.error(err?.message || "Error al actualizar la cuenta");
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (accounts.length > 1) {
      try {
        await deleteAccount(accountId);
        if (selectedAccountId === accountId) {
          const remaining = accounts.filter((a) => a.id !== accountId);
          if (remaining.length > 0) onSelectAccount(remaining[0].id);
        }
        toast.success("Cuenta eliminada");
      } catch (err: any) {
        console.error("Error al eliminar cuenta:", err);
        toast.error(err?.message || "Error al eliminar la cuenta");
      }
    }
  };

  const handleEditClick = (account: TradingAccount) => {
    setEditingId(account.id);
    setFormData({ name: account.name, initialBalance: String(account.initialBalance) });
    setSelectedColor(account.color);
    setShowCreateModal(true);
  };

  return (
    <>
      {/* Account selector dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:border-emerald-300 transition-colors shadow-sm w-full md:w-auto"
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: selectedAccount?.color || "#10b981" }}
          />
          <span className="truncate">{selectedAccount?.name || "Seleccionar cuenta"}</span>
          <ChevronDown size={14} className="text-gray-400 ml-auto shrink-0" />
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-20 overflow-hidden">
            {accounts.map((account) => {
              const balance = getAccountBalance(account.id);
              const isSelected = account.id === selectedAccountId;
              return (
                <button
                  key={account.id}
                  onClick={() => {
                    onSelectAccount(account.id);
                    setShowDropdown(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 flex items-center justify-between group",
                    isSelected && "bg-emerald-50"
                  )}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: account.color }}
                    />
                    <div className="min-w-0">
                      <p className={cn("font-semibold truncate", isSelected && "text-emerald-600")}>
                        {account.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(account);
                        setShowDropdown(false);
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Edit2 size={12} />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAccount(account.id);
                          setShowDropdown(false);
                        }}
                        className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </button>
              );
            })}
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({ name: "", initialBalance: "" });
                setSelectedColor(ACCOUNT_COLORS_LIST[0]);
                setShowCreateModal(true);
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-emerald-600 hover:bg-emerald-50 transition-colors font-semibold flex items-center gap-2 border-t border-gray-100"
            >
              <Plus size={14} />
              Nueva cuenta
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit account modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md w-full bg-white border border-gray-100 shadow-2xl rounded-2xl p-0 overflow-hidden">
          <div className="bg-[#111827] px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-white font-semibold text-base">
                {editingId ? "Editar cuenta" : "Nueva cuenta de trading"}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Nombre de la cuenta
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej: Cuenta FTMO 50K"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50"
              />
            </div>

            {/* Initial Balance */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Balance inicial (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                  $
                </span>
                <input
                  type="number"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                  placeholder="1000"
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>

            {/* Color selector */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Color de la cuenta
              </label>
              <div className="grid grid-cols-8 gap-2">
                {ACCOUNT_COLORS_LIST.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-7 h-7 rounded-lg border-2 transition-all",
                      selectedColor === color
                        ? "border-gray-900 ring-2 ring-offset-1 ring-gray-900"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50">
            <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={editingId ? handleUpdateAccount : handleCreateAccount}
              disabled={!formData.name.trim() || !formData.initialBalance}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {editingId ? "Guardar cambios" : "Crear cuenta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
