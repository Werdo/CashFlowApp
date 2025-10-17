import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  showCode?: boolean;
  title?: string;
  className?: string;
}

/**
 * Componente para generar y mostrar códigos QR
 * Permite descargar el QR como imagen SVG
 */
const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 256,
  level = 'H',
  includeMargin = true,
  showCode = true,
  title,
  className = ''
}) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Convertir SVG a Blob
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Crear enlace de descarga
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `QR-${value}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const handleDownloadPNG = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Crear canvas para convertir a PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `QR-${value}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(pngUrl);
      });
    };

    img.src = url;
  };

  return (
    <div className={`qr-code-generator ${className}`}>
      {title && <h5 className="mb-3">{title}</h5>}

      <div className="qr-code-container text-center">
        <div
          ref={qrRef}
          className="qr-code-wrapper d-inline-block p-3 bg-white border rounded"
          style={{ lineHeight: 0 }}
        >
          <QRCodeSVG
            value={value}
            size={size}
            level={level}
            includeMargin={includeMargin}
          />
        </div>

        {showCode && (
          <div className="mt-3">
            <div className="badge bg-secondary fs-6 py-2 px-3 font-monospace">
              {value}
            </div>
          </div>
        )}

        <div className="mt-3 d-flex gap-2 justify-content-center">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleDownloadPNG}
            title="Descargar como PNG"
          >
            <i className="bi bi-download me-1"></i>
            Descargar PNG
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={handleDownload}
            title="Descargar como SVG"
          >
            <i className="bi bi-file-earmark-code me-1"></i>
            Descargar SVG
          </button>
        </div>
      </div>

      <style>{`
        .qr-code-generator {
          width: 100%;
        }

        .qr-code-wrapper {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .qr-code-wrapper svg {
          display: block;
        }

        @media print {
          .qr-code-generator button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default QRCodeGenerator;
