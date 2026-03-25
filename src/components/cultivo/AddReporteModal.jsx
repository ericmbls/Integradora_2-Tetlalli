import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Upload, FileText, Info, Calendar, Droplets, Bug, Sprout, Eye } from "lucide-react";

export default function AddReporteModal({ isOpen, onClose, cultivoId, onSave }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "OBSERVACION",
    file: null
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [fieldAnimations, setFieldAnimations] = useState({
    titulo: false,
    tipo: false,
    descripcion: false,
    imagen: false
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setFieldAnimations({
          titulo: true,
          tipo: true,
          descripcion: true,
          imagen: true
        });
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setFieldAnimations({
        titulo: false,
        tipo: false,
        descripcion: false,
        imagen: false
      });
    }
  }, [isOpen]);

  if (!isOpen && !isAnimatingOut) return null;

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsAnimatingOut(false);
      onClose();
    }, 300);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      file
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.titulo.trim()) {
        alert("El título es obligatorio");
        return;
      }
      if (!formData.descripcion.trim()) {
        alert("La descripción es obligatoria");
        return;
      }

      setLoading(true);

      const data = new FormData();
      data.append("titulo", formData.titulo);
      data.append("descripcion", formData.descripcion);
      data.append("tipo", formData.tipo);
      data.append("cultivoId", String(cultivoId));

      if (formData.file) {
        data.append("imagen", formData.file);
      }

      await onSave(data);

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setFormData({
        titulo: "",
        descripcion: "",
        tipo: "OBSERVACION",
        file: null
      });

      setPreview(null);
      handleClose();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      RIEGO: <Droplets size={14} className="text-blue-500" />,
      FERTILIZACION: <Sprout size={14} className="text-green-500" />,
      PLAGA: <Bug size={14} className="text-red-500" />,
      COSECHA: <Sprout size={14} className="text-amber-500" />,
      OBSERVACION: <Eye size={14} className="text-purple-500" />
    };
    return icons[tipo] || <FileText size={14} className="text-gray-500" />;
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      RIEGO: "Riego",
      FERTILIZACION: "Fertilización",
      PLAGA: "Plaga",
      COSECHA: "Cosecha",
      OBSERVACION: "Observación"
    };
    return labels[tipo] || "Observación";
  };

  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFormData(prev => ({ ...prev, file: null }));
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
        onClick={handleClose}
      />
      <div
        className={`fixed inset-0 flex items-center justify-center z-[9999] p-2 sm:p-4 transition-all duration-300 ${
          isAnimatingOut ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      >
        <div
          className={`bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden transition-all duration-500 mx-2 sm:mx-0 max-h-[98vh] sm:max-h-[95vh] overflow-y-auto ${
            isAnimatingOut 
              ? "opacity-0 scale-95 translate-y-8" 
              : "opacity-100 scale-100 translate-y-0"
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 animate-slideInRight">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg animate-pulse-subtle">
                <FileText size={16} className="sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-semibold text-gray-800">
                  Nuevo reporte
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block animate-fadeIn">
                  Registra una nueva entrada en la bitácora
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
            <div className="space-y-4 sm:space-y-5">
              <div 
                className={`space-y-1 transition-all duration-500 ease-out transform ${
                  fieldAnimations.titulo 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                }`}
              >
                <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider transition-all duration-200">
                  <FileText size={10} className="sm:w-3 sm:h-3 transition-transform duration-200" />
                  Título del reporte
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onFocus={() => setFocusedField("titulo")}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-0 border-b-2 transition-all duration-300 outline-none bg-transparent ${
                    focusedField === "titulo"
                      ? "border-[#8B6F47] scale-[1.02]"
                      : "border-gray-200 focus:border-[#8B6F47]"
                  }`}
                  placeholder="Ej: Aplicación de fertilizante"
                />
              </div>

              <div 
                className={`space-y-1 transition-all duration-500 ease-out transform delay-100 ${
                  fieldAnimations.tipo 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                }`}
              >
                <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Calendar size={10} className="sm:w-3 sm:h-3" />
                  Tipo de reporte
                </label>
                <div className="relative group">
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all duration-300 bg-white hover:border-[#8B6F47]"
                  >
                    <option value="RIEGO">Riego</option>
                    <option value="FERTILIZACION">Fertilización</option>
                    <option value="PLAGA">Plaga</option>
                    <option value="COSECHA">Cosecha</option>
                    <option value="OBSERVACION">Observación</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <span className="transition-transform duration-300 group-hover:scale-110">
                      {getTipoIcon(formData.tipo)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getTipoLabel(formData.tipo)}
                    </span>
                    <ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-300 group-hover:rotate-180" />
                  </div>
                </div>
              </div>

              <div 
                className={`space-y-1 transition-all duration-500 ease-out transform delay-200 ${
                  fieldAnimations.descripcion 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                }`}
              >
                <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <FileText size={10} className="sm:w-3 sm:h-3" />
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  rows={4}
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all duration-300 resize-none hover:border-[#8B6F47]"
                  placeholder="Describe los detalles del reporte..."
                />
              </div>

              <div 
                className={`space-y-1 transition-all duration-500 ease-out transform delay-300 ${
                  fieldAnimations.imagen 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                }`}
              >
                <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Upload size={10} className="sm:w-3 sm:h-3" />
                  Imagen (opcional)
                </label>
                <div className={`
                  relative border-2 border-dashed rounded-xl p-4 sm:p-6
                  flex flex-col items-center justify-center gap-2 
                  min-h-[150px] sm:min-h-[180px] transition-all duration-300 cursor-pointer group
                  ${preview 
                    ? 'border-[#8B6F47] bg-[#8B6F47]/5' 
                    : 'border-gray-200 bg-gray-50 hover:border-[#8B6F47] hover:bg-[#8B6F47]/5 active:scale-[0.98]'
                  }
                `}>
                  {preview ? (
                    <div className="relative w-full animate-scaleIn">
                      <img
                        src={preview}
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
                    onChange={handleFile}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 mt-1 animate-fadeIn">
                  <Info size={10} className="animate-pulse-subtle" />
                  La imagen aparecerá en el reporte
                </p>
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
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-[#8B6F47] to-[#6b5436] hover:from-[#7a5f3c] hover:to-[#5a4530] active:scale-[0.98] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                <FileText size={14} className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                {loading ? "Guardando..." : "Registrar reporte"}
              </button>
            </div>
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
    </>,
    document.body
  );
}

const ChevronDownIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);