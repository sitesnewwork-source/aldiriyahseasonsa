import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";

interface Column {
  key: string;
  label: string;
  format?: (value: any, row: any) => string;
}

interface ExportButtonsProps {
  data: any[];
  columns: Column[];
  filename: string;
  title: string;
}

const ExportButtons = ({ data, columns, filename, title }: ExportButtonsProps) => {
  const [exporting, setExporting] = useState(false);

  const getValue = (row: any, col: Column) => {
    const raw = row[col.key];
    if (col.format) return col.format(raw, row);
    if (raw === null || raw === undefined) return "";
    return String(raw);
  };

  const exportCSV = () => {
    const BOM = "\uFEFF";
    const header = columns.map(c => `"${c.label}"`).join(",");
    const rows = data.map(row =>
      columns.map(col => `"${getValue(row, col).replace(/"/g, '""')}"`).join(",")
    );
    const csv = BOM + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      // Title
      doc.setFontSize(16);
      doc.text(title, 270, 15, { align: "right" });
      doc.setFontSize(8);
      doc.text(new Date().toLocaleDateString("ar-SA"), 270, 22, { align: "right" });

      // Table
      const startY = 30;
      const colWidth = 260 / columns.length;
      const rowHeight = 8;
      const pageHeight = 190;

      // Header
      doc.setFillColor(59, 130, 246);
      doc.rect(15, startY, 262, rowHeight, "F");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      columns.forEach((col, i) => {
        doc.text(col.label, 275 - i * colWidth, startY + 5.5, { align: "right" });
      });

      // Rows
      doc.setTextColor(51, 51, 51);
      let y = startY + rowHeight;

      data.forEach((row, rowIdx) => {
        if (y + rowHeight > pageHeight) {
          doc.addPage();
          y = 15;
        }

        if (rowIdx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, 262, rowHeight, "F");
        }

        doc.setFontSize(6.5);
        columns.forEach((col, i) => {
          const val = getValue(row, col);
          const truncated = val.length > 30 ? val.slice(0, 27) + "..." : val;
          doc.text(truncated, 275 - i * colWidth, y + 5.5, { align: "right" });
        });

        y += rowHeight;
      });

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(`${data.length} :إجمالي السجلات`, 270, y + 10, { align: "right" });

      doc.save(`${filename}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  if (data.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={exportCSV}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
        title="تصدير CSV"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        CSV
      </button>
      <button
        onClick={exportPDF}
        disabled={exporting}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-[11px] font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
        title="تصدير PDF"
      >
        <FileText className="w-3.5 h-3.5" />
        {exporting ? "..." : "PDF"}
      </button>
    </div>
  );
};

export default ExportButtons;
