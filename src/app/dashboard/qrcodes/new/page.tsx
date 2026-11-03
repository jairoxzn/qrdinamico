"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  QrCode,
  Sparkles,
  Link2,
  Globe,
  Radio,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import QRCodePreview from "@/components/qr/QRCodePreview";
import QRCodeCustomizer from "@/components/qr/QRCodeCustomizer";
import { generateShortCode } from "@/lib/utils";

export default function NewQRCodePage() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("https://");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [targetUserId, setTargetUserId] = useState("");

  // Styling states
  const [fgColor, setFgColor] = useState("#010B47");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [dotStyle, setDotStyle] = useState("square");
  const [cornerSquareStyle, setCornerSquareStyle] = useState("square");

  // Temporary short code for real-time live preview
  const [previewShortCode, setPreviewShortCode] = useState("");

  // Clients list if admin
  const [clients, setClients] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreviewShortCode(generateShortCode(8));

    // Check if user is admin and fetch clients
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.role === "ADMIN") {
          setIsAdmin(true);
          fetch("/api/clients")
            .then((r) => r.json())
            .then((cData) => setClients(cData.clients || []));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/qrcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          destinationUrl,
          category,
          description,
          fgColor,
          bgColor,
          dotStyle,
          cornerSquareStyle,
          targetUserId: targetUserId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear el código QR");
      }

      router.push(`/dashboard/qrcodes/${data.qr.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al guardar el código QR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back button and page title */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/qrcodes"
          className="p-2 text-slate-500 hover:text-[#010B47] hover:bg-slate-100 rounded-xl transition-smooth"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-[#010B47] tracking-tight">
            Generador de Código QR Dinámico
          </h2>
          <p className="text-sm text-slate-500">
            Configure la URL permanente y personalice el diseño para tarjetas NFC o impresiones
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Configuration Form & Customizer */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Link2 className="w-4 h-4 text-[#025CF3]" />
              <h3 className="text-sm font-bold text-[#010B47] uppercase tracking-wider">
                Información del Enlace Dinámico
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombre o Título del Código QR *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Tarjeta NFC CEO / Menú Restaurante / Catálogo 2025"
                className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#025CF3] transition-smooth font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                URL de Destino Inicial (Redirección Dinámica) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  placeholder="https://suempresa.com/pagina-destino"
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#025CF3] transition-smooth font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Puede cambiar esta dirección en cualquier momento desde el panel sin modificar el código impreso ni el chip NFC.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
                >
                  <option value="General">General</option>
                  <option value="Networking & Tarjetas">Networking & Tarjetas NFC</option>
                  <option value="Restaurante">Menú & Restaurante</option>
                  <option value="Comercial">Comercial & Catálogos</option>
                  <option value="Eventos">Eventos & Ferias</option>
                  <option value="Wifi">Wifi & Acceso</option>
                </select>
              </div>

              {isAdmin && clients.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Asignar a Cliente
                  </label>
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
                  >
                    <option value="">Para mi cuenta (Administrador)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company || c.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Descripción o Notas Adicionales
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Observaciones de uso, ubicación física o lote..."
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
              />
            </div>
          </div>

          {/* Visual Customization Card */}
          <QRCodeCustomizer
            fgColor={fgColor}
            setFgColor={setFgColor}
            bgColor={bgColor}
            setBgColor={setBgColor}
            dotStyle={dotStyle}
            setDotStyle={setDotStyle}
            cornerSquareStyle={cornerSquareStyle}
            setCornerSquareStyle={setCornerSquareStyle}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#025CF3] hover:bg-[#0146BD] text-white font-bold text-sm shadow-md hover:shadow-glow transition-smooth flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generando Código QR en Neon DB...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Guardar y Generar Código QR Dinámico</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column (5 cols): Real-Time Live Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft text-center">
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
                Vista Previa en Tiempo Real
              </span>

              <QRCodePreview
                shortCode={previewShortCode || "demo-code"}
                title={title || "Título del Código QR"}
                fgColor={fgColor}
                bgColor={bgColor}
                dotStyle={dotStyle}
                cornerSquareStyle={cornerSquareStyle}
                size={230}
              />
            </div>

            <div className="bg-[#010B47] text-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-2.5 mb-2">
                <Radio className="w-4 h-4 text-[#025CF3]" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Compatibilidad Física NFC
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Este código QR genera una URL corta permanente{" "}
                <span className="font-mono text-blue-300 font-bold">
                  /q/{previewShortCode}
                </span>{" "}
                que se puede grabar directamente en el chip NDEF de tarjetas de PVC, metal o acrílico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

