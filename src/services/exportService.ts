import { fmtMoney } from '../utils/format';
import * as XLSX from 'xlsx';
import type { BOQProject, BOQRoom, BOQItem } from '../types/boq';

const CATEGORY_LABELS: Record<string, string> = {
  civil: 'Civil Works', flooring: 'Flooring', wall_finish: 'Wall Finish',
  ceiling: 'Ceiling', furniture: 'Furniture', fixtures: 'Fixtures',
  electrical: 'Electrical', plumbing: 'Plumbing', doors_windows: 'Doors & Windows',
  kitchen: 'Kitchen', decorative: 'Decorative', miscellaneous: 'Miscellaneous',
};

export class ExportService {
  static exportExcel(project: BOQProject, rooms: BOQRoom[], items: BOQItem[]) {
    const wb = XLSX.utils.book_new();
    const fmt = (n: number) => fmtMoney(n);
    const grandTotal = items.reduce((s, i) => s + (i.amount || 0), 0);

    // === Cover Sheet ===
    const coverData = [
      ['BILL OF QUANTITIES'],
      [],
      ['Project:', project.name],
      ['Client:', project.client],
      ['Location:', project.location || '-'],
      ['Style:', project.style || '-'],
      ['Area:', project.total_area_sqft ? `${project.total_area_sqft} sqft` : '-'],
      ['Date:', new Date().toLocaleDateString('en-IN')],
      [],
      ['Total Rooms:', rooms.length],
      ['Total Items:', items.length],
      ['Grand Total:', fmtMoney(grandTotal)],
    ];
    const coverWs = XLSX.utils.aoa_to_sheet(coverData);
    coverWs['!cols'] = [{ wch: 15 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, coverWs, 'Cover');

    // === Room-wise Sheets ===
    rooms.forEach(room => {
      const rItems = items.filter(i => i.room_id === room.id);
      if (rItems.length === 0) return;

      // Group by category
      const grouped: Record<string, BOQItem[]> = {};
      rItems.forEach(item => {
        const cat = item.category || 'miscellaneous';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
      });

      const rows: any[][] = [
        [room.name, '', '', '', '', '', ''],
        [`Area: ${room.area_sqft || '-'} sqft`, '', '', '', '', '', ''],
        [],
        ['S.No', 'Category', 'Description', 'Specification', 'Unit', 'Qty', 'Rate', 'Amount'],
      ];

      let sno = 1;
      let roomTotal = 0;
      Object.entries(grouped).forEach(([cat, catItems]) => {
        rows.push([CATEGORY_LABELS[cat] || cat, '', '', '', '', '', '', '']);
        catItems.forEach(item => {
          rows.push([
            sno++, '', item.description, item.specification || '', item.unit,
            item.quantity, fmt(item.rate), fmt(item.amount)
          ]);
          roomTotal += item.amount || 0;
        });
      });

      rows.push([]);
      rows.push(['', '', '', '', '', '', 'Room Total', fmt(roomTotal)]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [
        { wch: 6 }, { wch: 14 }, { wch: 35 }, { wch: 30 },
        { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 14 }
      ];

      const sheetName = room.name.substring(0, 31).replace(/[\\/*?[\]:]/g, '');
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // === Summary Sheet ===
    const summaryRows: any[][] = [
      ['BOQ SUMMARY'],
      [],
      ['Category', 'Items', 'Amount', '% of Total'],
    ];

    const byCategory: Record<string, { count: number; amount: number }> = {};
    items.forEach(item => {
      const cat = item.category || 'miscellaneous';
      if (!byCategory[cat]) byCategory[cat] = { count: 0, amount: 0 };
      byCategory[cat].count++;
      byCategory[cat].amount += item.amount || 0;
    });

    Object.entries(byCategory)
      .sort((a, b) => b[1].amount - a[1].amount)
      .forEach(([cat, data]) => {
        summaryRows.push([
          CATEGORY_LABELS[cat] || cat,
          data.count,
          fmt(data.amount),
          grandTotal > 0 ? `${(data.amount / grandTotal * 100).toFixed(1)}%` : '0%'
        ]);
      });

    summaryRows.push([]);
    summaryRows.push(['TOTAL', items.length, fmt(grandTotal), '100%']);
    summaryRows.push([]);
    summaryRows.push(['Room-wise Summary']);
    summaryRows.push(['Room', 'Items', 'Amount', '% of Total']);

    rooms.forEach(room => {
      const rItems = items.filter(i => i.room_id === room.id);
      const rTotal = rItems.reduce((s, i) => s + (i.amount || 0), 0);
      summaryRows.push([
        room.name, rItems.length, fmt(rTotal),
        grandTotal > 0 ? `${(rTotal / grandTotal * 100).toFixed(1)}%` : '0%'
      ]);
    });

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
    summaryWs['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Download
    XLSX.writeFile(wb, `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_BOQ.xlsx`);
  }

  static exportPDF(project: BOQProject, rooms: BOQRoom[], items: BOQItem[], marginPct: number = 0) {
    const fmt = (n: number) => fmtMoney(n);
    const grandTotal = items.reduce((s, i) => s + (i.amount || 0), 0);
    const clientTotal = grandTotal * (1 + marginPct / 100);

    const CATEGORY_LABELS_LOCAL: Record<string, string> = CATEGORY_LABELS;

    let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>${project.name} - BOQ</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; font-size: 12px; }
      .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #a21caf; padding-bottom: 20px; }
      .header h1 { font-size: 22px; color: #a21caf; margin-bottom: 4px; }
      .header p { color: #666; font-size: 13px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; background: #fdf4ff; padding: 16px; border-radius: 8px; }
      .info-grid div { font-size: 12px; }
      .info-grid strong { color: #333; }
      .room-section { margin-bottom: 24px; page-break-inside: avoid; }
      .room-title { font-size: 15px; font-weight: 700; color: #a21caf; margin-bottom: 8px; padding: 8px 12px; background: #fdf4ff; border-radius: 6px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
      th { background: #f3e8ff; color: #6b21a8; font-weight: 600; text-align: left; padding: 6px 8px; font-size: 11px; border-bottom: 2px solid #d8b4fe; }
      td { padding: 5px 8px; border-bottom: 1px solid #f0e0ff; }
      .text-right { text-align: right; }
      .total-row { font-weight: 700; background: #fdf4ff; }
      .grand-total { text-align: center; margin-top: 24px; padding: 16px; background: linear-gradient(135deg, #a21caf, #7c3aed); color: white; border-radius: 10px; font-size: 18px; }
      .cat-header td { font-weight: 700; background: #faf5ff; color: #7c3aed; font-size: 11px; }
      @media print { body { padding: 20px; } .no-print { display: none; } }
    </style></head><body>
    <div class="header">
      <h1>Cre8</h1>
      <p>Bill of Quantities Report</p>
    </div>
    <div class="info-grid">
      <div><strong>Project:</strong> ${project.name}</div>
      <div><strong>Client:</strong> ${project.client}</div>
      <div><strong>Location:</strong> ${project.location || '-'}</div>
      <div><strong>Style:</strong> ${project.style || '-'}</div>
      <div><strong>Area:</strong> ${project.total_area_sqft ? project.total_area_sqft + ' sqft' : '-'}</div>
      <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</div>
      <div><strong>Rooms:</strong> ${rooms.length}</div>
      <div><strong>Items:</strong> ${items.length}</div>
    </div>`;

    rooms.forEach(room => {
      const rItems = items.filter(i => i.room_id === room.id);
      if (rItems.length === 0) return;
      const rTotal = rItems.reduce((s, i) => s + (i.amount || 0), 0);

      const grouped: Record<string, BOQItem[]> = {};
      rItems.forEach(item => {
        const cat = item.category || 'miscellaneous';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
      });

      html += `<div class="room-section">
        <div class="room-title">${room.name} ${room.area_sqft ? `(${room.area_sqft} sqft)` : ''}</div>
        <table>
          <thead><tr><th>#</th><th>Description</th><th>Spec</th><th>Unit</th><th class="text-right">Qty</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr></thead>
          <tbody>`;

      let sno = 1;
      Object.entries(grouped).forEach(([cat, catItems]) => {
        html += `<tr class="cat-header"><td colspan="7">${CATEGORY_LABELS_LOCAL[cat] || cat}</td></tr>`;
        catItems.forEach(item => {
          html += `<tr><td>${sno++}</td><td>${item.description}</td><td>${item.specification || ''}</td><td>${item.unit}</td><td class="text-right">${item.quantity}</td><td class="text-right">${fmt(item.rate)}</td><td class="text-right">${fmt(item.amount)}</td></tr>`;
        });
      });

      html += `<tr class="total-row"><td colspan="6" class="text-right">Room Total</td><td class="text-right">${fmt(rTotal)}</td></tr>`;
      html += `</tbody></table></div>`;
    });

    html += `<div class="grand-total">
      <div>Grand Total: ${fmt(grandTotal)}</div>
      ${marginPct > 0 ? `<div style="font-size:14px;margin-top:6px;">Client Price (${marginPct}% margin): ${fmt(clientTotal)}</div>` : ''}
    </div>`;
    html += `</body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  }
}
