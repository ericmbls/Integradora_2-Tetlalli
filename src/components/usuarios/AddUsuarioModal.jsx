import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, Mail, Lock, Shield, Building2, MapPin, Info, Eye, EyeOff, Users } from "lucide-react";

export default function AddUsuarioModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    farmName: "",
    location: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    handleClose();
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] animate-fadeIn"
        onClick={handleClose}
      />
      <div
        className={`fixed inset-0 flex items-center justify-center z-[9999] p-2 sm:p-4 transition-all duration-300 ${
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
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg animate-scaleIn">
                <User size={16} className="sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-semibold text-gray-800 animate-slideInRight">
                  Nuevo Usuario
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block animate-fadeIn">
                  Registra un nuevo usuario en el sistema
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
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-1 animate-slideInUp">
                  <div className="flex flex-col items-center justify-center gap-4 p-6 bg-gradient-to-br from-[#FDF8F0] to-[#F9F1E6] rounded-xl border border-[#E8DCC8]">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-full blur-xl opacity-20 animate-pulse"></div>
                      <div className="relative w-28 h-28 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-full flex items-center justify-center text-white shadow-xl transform transition-transform duration-300 hover:scale-105">
                        <Users size={52} strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-semibold text-gray-800">Nuevo Usuario</p>
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <Info size={10} />
                        Completa los datos
                      </p>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8B6F47] animate-pulse-subtle"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8B6F47] animate-pulse-subtle" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8B6F47] animate-pulse-subtle" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4 sm:space-y-5">
                  <div className="space-y-1 animate-slideInUp">
                    <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <User size={10} className="sm:w-3 sm:h-3" />
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-0 border-b-2 transition-all duration-300 outline-none bg-transparent ${
                        focusedField === "name"
                          ? "border-[#8B6F47] scale-[1.02]"
                          : "border-gray-200 focus:border-[#8B6F47]"
                      }`}
                      placeholder="Ej: Juan Pérez"
                      value={formData.name}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      onChange={e => handleChange("name", e.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="space-y-1 animate-slideInUp" style={{ animationDelay: "0.1s" }}>
                    <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Mail size={10} className="sm:w-3 sm:h-3" />
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-0 border-b-2 transition-all duration-300 outline-none bg-transparent ${
                        focusedField === "email"
                          ? "border-[#8B6F47] scale-[1.02]"
                          : "border-gray-200 focus:border-[#8B6F47]"
                      }`}
                      placeholder="usuario@ejemplo.com"
                      value={formData.email}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      onChange={e => handleChange("email", e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-1 animate-slideInUp" style={{ animationDelay: "0.2s" }}>
                    <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Lock size={10} className="sm:w-3 sm:h-3" />
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-0 border-b-2 transition-all duration-300 outline-none bg-transparent pr-10 ${
                          focusedField === "password"
                            ? "border-[#8B6F47] scale-[1.02]"
                            : "border-gray-200 focus:border-[#8B6F47]"
                        }`}
                        placeholder="••••••••"
                        value={formData.password}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        onChange={e => handleChange("password", e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
                      <Info size={10} className="animate-pulse-subtle" />
                      Mínimo 8 caracteres
                    </div>
                  </div>

                  <div className="animate-slideInUp" style={{ animationDelay: "0.3s" }}>
                    <div className="space-y-1">
                      <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Shield size={10} className="sm:w-3 sm:h-3" />
                        Rol
                      </label>
                      <div className="relative group">
                        <select
                          value={formData.role}
                          onChange={e => handleChange("role", e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all duration-300 bg-white hover:border-[#8B6F47]"
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Administrador</option>
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform duration-300 group-hover:rotate-180" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 animate-slideInUp" style={{ animationDelay: "0.4s" }}>
                    <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Building2 size={10} className="sm:w-3 sm:h-3" />
                      Nombre de la granja
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-0 border-b-2 transition-all duration-300 outline-none bg-transparent ${
                        focusedField === "farmName"
                          ? "border-[#8B6F47] scale-[1.02]"
                          : "border-gray-200 focus:border-[#8B6F47]"
                      }`}
                      placeholder="Ej: Granja El Rosal"
                      value={formData.farmName}
                      onFocus={() => setFocusedField("farmName")}
                      onBlur={() => setFocusedField(null)}
                      onChange={e => handleChange("farmName", e.target.value)}
                      autoComplete="organization"
                    />
                  </div>

                  <div className="space-y-1 animate-slideInUp" style={{ animationDelay: "0.5s" }}>
                    <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <MapPin size={10} className="sm:w-3 sm:h-3" />
                      Ubicación
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-0 border-b-2 transition-all duration-300 outline-none bg-transparent ${
                        focusedField === "location"
                          ? "border-[#8B6F47] scale-[1.02]"
                          : "border-gray-200 focus:border-[#8B6F47]"
                      }`}
                      placeholder="Ej: Antioquia, Colombia"
                      value={formData.location}
                      onFocus={() => setFocusedField("location")}
                      onBlur={() => setFocusedField(null)}
                      onChange={e => handleChange("location", e.target.value)}
                      autoComplete="address-level1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100 animate-slideInUp" style={{ animationDelay: "0.6s" }}>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 hover:scale-[0.98] active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#8B6F47] to-[#6b5436] hover:from-[#7a5f3c] hover:to-[#5a4530] active:scale-[0.98] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-md flex items-center justify-center gap-2 group"
                >
                  <User size={14} className="transition-transform duration-300 group-hover:scale-110" />
                  Crear Usuario
                </button>
              </div>
            </form>
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