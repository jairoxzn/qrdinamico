"use client";

import { useState, useEffect } from "react";
import { X, Users, Loader2, AlertCircle } from "lucide-react";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: any | null;
  onSuccess: () => void;
}

export default function ClientModal({
  isOpen,
  onClose,
  clientToEdit,
  onSuccess,
}: ClientModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [maxQRs, setMaxQRs] = useState(50);
  const [status, setStatus] = useState("ACTIVE");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (clientToEdit) {
        setName(clientToEdit.name);
        setEmail(clientToEdit.email);
        setPassword("");
        setCompany(clientToEdit.company || "");
        setPhone(clientToEdit.phone || "");
        setMaxQRs(clientToEdit.maxQRs || 50);
        setStatus(clientToEdit.status || "ACTIVE");
      } else {
        setName("");
        setEmail("");
        setPassword("");
        setCompany("");
        setPhone("");
        setMaxQRs(50);
        setStatus("ACTIVE");
      }
      setError(null);
    }
  }, [isOpen, clientToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = clientToEdit ? `/api/clients/${clientToEdit.id}` : "/api/clients";
      const method = clientToEdit ? "PATCH" : "POST";

      const payload: any = {
        name,
        company: company || null,
        phone: phone || null,
        maxQRs: Number(maxQRs),
      };

      if (!clientToEdit) {
        payload.email = email;
        payload.password = password;
      } else {
        payload.status = status;
        if (password) {
          payload.newPassword = password;
        }
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al procesar el cliente");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-dropdown overflow-hidden">
        {/* Header */}
        <div className="bg-[#010B47] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#025CF3] flex items-center justify-center shadow-glow">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {clientToEdit ? "Editar Cliente" : "Registrar Nuevo Cliente"}
              </h2>
              <p className="text-xs text-blue-200">
                Gestión de cuentas corporativas y cuotas de servicio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Carlos Mendoza"
              className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#025CF3] transition-smooth"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                disabled={!!clientToEdit}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@empresa.com"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#025CF3] disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {clientToEdit ? "Nueva Contraseña (Opcional)" : "Contraseña *"}
              </label>
              <input
                type="password"
                required={!clientToEdit}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Empresa u Organización
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Innovación Retail S.A.S"
                className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Cuota Máxima de Códigos QR
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                value={maxQRs}
                onChange={(e) => setMaxQRs(Number(e.target.value))}
                className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
              />
            </div>

            {clientToEdit && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estado de la Cuenta
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#025CF3]"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="SUSPENDED">Suspendido</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-smooth"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#025CF3] hover:bg-[#0146BD] text-white text-xs font-bold rounded-xl shadow-md transition-smooth disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{clientToEdit ? "Guardar Cambios" : "Crear Cliente"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

