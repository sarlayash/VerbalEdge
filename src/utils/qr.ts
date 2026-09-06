import QRCode from 'qrcode';

export async function generateQrCode(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code', err);
    // Fallback simple SVG data URI
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%230f172a"/><text x="10" y="55" fill="white" font-size="10">QR CODE</text></svg>`;
  }
}
