/*
 * ExportData — Trading Journal Pro
 * Componente para exportar datos a CSV y PDF
 */

import { Download, FileText, Sheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJournal, TradeEntry } from "@/contexts/JournalContext";

interface ExportDataProps {
  accountId: string;
  year: number;
}

export default function ExportData({ accountId, year }: ExportDataProps) {
  const { getTradesByAccount, getAccount, getYearMetrics } = useJournal();

  const exportToCSV = () => {
    const account = getAccount(accountId);
    if (!account) return;

    const trades = getTradesByAccount(accountId).filter((t) => t.date.startsWith(String(year)));
    const metrics = getYearMetrics(accountId, year);

    // CSV headers
    const headers = ["Fecha", "Cuenta", "Instrumento", "Resultado", "Profit/Pérdida", "Comisión", "Profit Neto", "Notas"];
    const rows = trades.map((t) => [
      t.date,
      account.name,
      t.instrument,
      t.result || "—",
      t.profit,
      t.commission || 0,
      t.profit - (t.commission || 0),
      t.notes.replace(/"/g, '""'),
    ]);

    // Add metrics summary
    rows.push([]);
    rows.push(["RESUMEN ANUAL", year, "", "", "", ""]);
    rows.push(["Profit Total", "", "", "", metrics.totalProfit, ""]);
    rows.push(["Retorno %", "", "", "", metrics.returnPct, ""]);
    rows.push(["Winrate", "", "", "", metrics.winrate, ""]);
    rows.push(["Número de Trades", "", "", "", metrics.tradeCount, ""]);
    rows.push(["Profit Factor", "", "", "", metrics.profitFactor, ""]);
    rows.push(["Max Drawdown", "", "", "", metrics.maxDrawdown, ""]);

    // Convert to CSV
    const csv = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((row) =>
        row.map((cell) => {
          const str = String(cell);
          return str.includes(",") || str.includes('"') ? `"${str}"` : str;
        }).join(",")
      ),
    ].join("\n");

    // Download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `trading-journal-${account.name}-${year}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const account = getAccount(accountId);
    if (!account) return;

    const trades = getTradesByAccount(accountId).filter((t) => t.date.startsWith(String(year)));
    const metrics = getYearMetrics(accountId, year);

    // Create a simple HTML for PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>BastianTrader Journal Report V1.0</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h1 { color: #111827; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 20px; }
          .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
          .metric-card { background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; }
          .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
          .metric-value { font-size: 24px; font-weight: bold; color: #111827; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f3f4f6; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #e5e7eb; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background: #f9fafb; }
          .positive { color: #10b981; font-weight: bold; }
          .negative { color: #ef4444; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>BastianTrader Journal Report V1.0</h1>
        <p><strong>Cuenta:</strong> ${account.name}</p>
        <p><strong>Año:</strong> ${year}</p>
        <p><strong>Fecha de Generación:</strong> ${new Date().toLocaleDateString("es-ES")}</p>

        <h2>Métricas Anuales</h2>
        <div class="metrics">
          <div class="metric-card">
            <div class="metric-label">Profit Total</div>
            <div class="metric-value ${metrics.totalProfit >= 0 ? "positive" : "negative"}">
              ${metrics.totalProfit >= 0 ? "+" : ""}$${metrics.totalProfit.toFixed(2)}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Retorno %</div>
            <div class="metric-value ${metrics.returnPct >= 0 ? "positive" : "negative"}">
              ${metrics.returnPct >= 0 ? "+" : ""}${metrics.returnPct.toFixed(2)}%
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Winrate</div>
            <div class="metric-value">${metrics.winrate.toFixed(1)}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Número de Trades</div>
            <div class="metric-value">${metrics.tradeCount}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Profit Factor</div>
            <div class="metric-value">${metrics.profitFactor.toFixed(2)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Max Drawdown</div>
            <div class="metric-value negative">${metrics.maxDrawdown.toFixed(2)}%</div>
          </div>
        </div>

        <h2>Trades del Año</h2>
        <table>
          <thead>
	            <tr>
	              <th>Fecha</th>
	              <th>Instrumento</th>
	              <th>Resultado</th>
	              <th>Profit/Pérdida</th>
	              <th>Comisión</th>
	              <th>Neto</th>
	              <th>Notas</th>
	            </tr>
          </thead>
          <tbody>
            ${trades
              .map(
                (t) => `
	              <tr>
	                <td>${t.date}</td>
	                <td>${t.instrument}</td>
	                <td>${t.result || "—"}</td>
	                <td class="${t.profit >= 0 ? "positive" : "negative"}">
	                  ${t.profit >= 0 ? "+" : ""}$${t.profit.toFixed(2)}
	                </td>
	                <td>$${(t.commission || 0).toFixed(2)}</td>
	                <td class="${(t.profit - (t.commission || 0)) >= 0 ? "positive" : "negative"}">
	                  $${(t.profit - (t.commission || 0)).toFixed(2)}
	                </td>
	                <td>${t.notes.substring(0, 50)}${t.notes.length > 50 ? "..." : ""}</td>
	              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>Trading Journal Pro — Reporte generado automáticamente</p>
        </div>
      </body>
      </html>
    `;

    // Use print dialog to save as PDF
    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportToCSV}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Sheet size={16} />
        CSV
      </Button>
      <Button
        onClick={exportToPDF}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <FileText size={16} />
        PDF
      </Button>
    </div>
  );
}
