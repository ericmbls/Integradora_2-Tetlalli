import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Upload,
  X,
  ChevronDown,
  MapPin,
  Calendar,
  FileText,
  Info,
  Sprout
} from "lucide-react";

export default function AddCultivoModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    fechaSiembra: "",
    descripcion: "",
    imagen: null,
  });
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (formData.imagen) {
      const url = URL.createObjectURL(formData.imagen);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
  }, [formData.imagen]);

  if (!isOpen && !isAnimatingOut) return null;

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsAnimatingOut(false);
      onClose();
    }, 300);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const { nombre, fechaSiembra, ubicacion, descripcion, imagen } = formData;

    if (!nombre || !fechaSiembra) {
      alert("Nombre y fecha son obligatorios");
      return;
    }

    const data = new FormData();
    data.append("nombre", nombre);
    data.append("descripcion", descripcion);
    data.append("ubicacion", ubicacion || "Sin ubicación");
    data.append("fechaSiembra", new Date(fechaSiembra).toISOString());
    data.append("frecuenciaRiego", "2");
    data.append("estado", "activo");

    if (imagen) {
      data.append("imagen", imagen);
    }

    onSave(data);
    handleClose();
  };

  const handleRemoveImage = () => {
    handleChange("imagen", null);
  };

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 transition-all duration-300 ${
        isAnimatingOut ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl w-full max-w-3xl shadow-2xl relative overflow-hidden transition-all duration-500 mx-2 sm:mx-0 max-h-[98vh] sm:max-h-[95vh] overflow-y-auto ${
          isAnimatingOut 
            ? "opacity-0 scale-95 translate-y-8" 
            : "opacity-100 scale-100 translate-y-0"
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 animate-slideInRight">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg animate-pulse-subtle">
              <Sprout size={16} className="sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-semibold text-gray-800">
                Nuevo cultivo
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block animate-fadeIn">
                Registra un nuevo cultivo en el sistema
              </p>
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 transition-all duration-300 p-1.5 hover:bg-gray-100 rounded-full hover:rotate-90 active:scale-90"
            onClick={handleClose}
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1 animate-slideInUp" style={{ animationDelay: "0.1s" }}>
              <div
                className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center gap-2 min-h-[150px] sm:min-h-[200px] transition-all duration-300 cursor-pointer group ${
                  formData.imagen
                    ? "border-[#8B6F47] bg-[#8B6F47]/5"
                    : "border-gray-200 bg-gray-50 hover:border-[#8B6F47] hover:bg-[#8B6F47]/5 active:scale-[0.98]"
                }`}
              >
                {imagePreview ? (
                  <div className="relative w-full animate-scaleIn">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full h-24 sm:h-32 object-cover rounded-lg shadow-md transition-all duration-300 hover:scale-105"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-300 shadow-lg active:scale-95 hover:rotate-90"
                    >
                      <X size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#8B6F47]/10 rounded-full flex items-center justify-center group-active:scale-95 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#8B6F47]/20">
                      <Upload size={18} className="sm:w-6 sm:h-6 text-[#8B6F47] transition-transform duration-300 group-hover:translate-y-[-2px]" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-[#8B6F47] transition-colors">
                      Subir imagen
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                      <Info size={10} />
                      PNG, JPG hasta 5MB
                    </span>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleChange("imagen", e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <p className="text-[10px] sm:text-xs text-gray-400 text-center mt-2 sm:mt-3 animate-fadeIn">
                Imagen opcional del cultivo
              </p>
            </div>

            <div className="lg:col-span-2 space-y-3 sm:space-y-5">
              <div className="space-y-1 animate-slideInUp" style={{ animationDelay: "0.15s" }}>
                <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider transition-all duration-200 group-focus-within:text-[#8B6F47]">
                  <FileText size={10} className="sm:w-3 sm:h-3 transition-transform duration-200 group-hover:scale-110" /> 
                  Nombre del cultivo
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onFocus={() => setFocusedField("nombre")}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => handleChange("nombre", e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-0 border-b-2 transition-all duration-300 outline-none bg-transparent ${
                    focusedField === "nombre"
                      ? "border-[#8B6F47] scale-[1.02]"
                      : "border-gray-200 focus:border-[#8B6F47]"
                  }`}
                  placeholder="Ej: Tomates cherry"
                />
              </div>

              <div className="space-y-1 animate-slideInUp" style={{ animationDelay: "0.2s" }}>
                <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <MapPin size={10} className="sm:w-3 sm:h-3" /> 
                  Ubicación
                </label>
                <div className="relative group">
                  <select
                    value={formData.ubicacion}
                    onChange={e => handleChange("ubicacion", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all duration-300 bg-white hover:border-[#8B6F47]"
                  >
                    <option value="">Seleccionar ubicación</option>
                    <option value="Invernadero A">Invernadero A</option>
                    <option value="Invernadero B">Invernadero B</option>
                    <option value="Campo Abierto">Campo Abierto</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-300 group-hover:rotate-180"
                  />
                </div>
              </div>

              <div className="space-y-1 animate-slideInUp" style={{ animationDelay: "0.25s" }}>
                <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Calendar size={10} className="sm:w-3 sm:h-3" /> 
                  Fecha de siembra
                </label>
                <input
                  type="date"
                  value={formData.fechaSiembra}
                  onChange={e => handleChange("fechaSiembra", e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-0 border-b-2 border-gray-200 focus:border-[#8B6F47] outline-none transition-all duration-300 bg-transparent focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-1 animate-slideInUp" style={{ animationDelay: "0.3s" }}>
                <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <FileText size={10} className="sm:w-3 sm:h-3" /> 
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={e => handleChange("descripcion", e.target.value)}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all duration-300 resize-none hover:border-[#8B6F47]"
                  placeholder="Notas adicionales sobre el cultivo..."
                />
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 animate-fadeIn">
                  <Info size={10} className="animate-pulse-subtle" />
                  Información adicional opcional
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 hover:scale-[0.98] active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="w-full sm:w-auto bg-gradient-to-r from-[#8B6F47] to-[#6b5436] hover:from-[#7a5f3c] hover:to-[#5a4530] active:scale-[0.98] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-md flex items-center justify-center gap-2 group animate-slideInUp"
              style={{ animationDelay: "0.35s" }}
            >
              <Sprout size={14} className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              Guardar cultivo
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulseSubtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }

        .animate-slideInUp {
          animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-pulse-subtle {
          animation: pulseSubtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>,
    document.body
  );
}