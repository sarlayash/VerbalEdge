import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function downloadElementAsPng(elementId: string, filename: string): Promise<boolean> {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    const dataUrl = await toPng(node, {
      quality: 0.98,
      pixelRatio: 2,
      cacheBust: true,
    });
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (err) {
    console.error('Error downloading element as PNG:', err);
    return false;
  }
}

export async function downloadElementAsPdf(
  elementId: string,
  filename: string,
  orientation: 'p' | 'l' = 'l'
): Promise<boolean> {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    const dataUrl = await toPng(node, {
      quality: 0.98,
      pixelRatio: 2,
      cacheBust: true,
    });

    const pdf = new jsPDF({
      orientation: orientation === 'l' ? 'landscape' : 'portrait',
      unit: 'px',
      format: orientation === 'l' ? [800, 560] : [560, 800],
    });

    const width = orientation === 'l' ? 800 : 560;
    const height = orientation === 'l' ? 560 : 800;

    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (err) {
    console.error('Error downloading element as PDF:', err);
    // Fallback: window.print()
    window.print();
    return false;
  }
}

export function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header];
          const stringVal = val === null || val === undefined ? '' : String(val);
          return `"${stringVal.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
