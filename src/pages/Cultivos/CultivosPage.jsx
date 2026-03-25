import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  Sprout, 
  MapPin, 
  Calendar, 
  Eye, 
  Plus, 
  AlertCircle, 
  CheckCircle,
  Grid,
  Layers,
  ChevronRight,
  Filter,
  TrendingUp,
  Clock,
  Leaf,
  Search,
  X,
  ChevronLeft,
  Sparkles,
  Star,
  Flower2,
  Sun,
  Cloud,
  PartyPopper
} from "lucide-react";
import EditCultivoModal from "../../components/cultivo/EditCultivoModal";
import AddCultivoModal from "../../components/cultivo/AddCultivoModal";
import {
  getCultivos,
  createCultivo,
  updateCultivo,
  deleteCultivo
} from "../../services/cultivos.service";

export default function CultivosPage({ onOpenCultivo }) {
  const { user } = useAuth();
  const userRole = user?.role;

  const [cultivos, setCultivos] = useState([]);
  const [selectedCultivo, setSelectedCultivo] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUbicacion, setSelectedUbicacion] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [animateCard, setAnimateCard] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const loadCultivos = async () => {
      setLoading(true);
      try {
        const data = await getCultivos();
        setCultivos(Array.isArray(data) ? data : []);
      } catch {
        setCultivos([]);
      } finally {
        setLoading(false);
      }
    };
    loadCultivos();
  }, []);

  useEffect(() => {
    if (selectedCultivo || isAddOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedCultivo, isAddOpen]);

  const addNotification = (message, type = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const surcos = useMemo(() => {
    const grouped = {};
    cultivos.forEach(({ ubicacion = "Sin ubicación", ...cultivo }) => {
      if (!grouped[ubicacion]) grouped[ubicacion] = [];
      grouped[ubicacion].push({ ubicacion, ...cultivo });
    });
    return Object.entries(grouped).map(([ubicacion, lista]) => ({
      id: ubicacion,
      nombre: ubicacion,
      cultivos: lista
    }));
  }, [cultivos]);

  const surcosFiltrados = useMemo(() => {
    let filtered = surcos;
    
    if (selectedUbicacion !== "todas") {
      filtered = filtered.filter(surco => surco.nombre === selectedUbicacion);
    }
    
    if (searchTerm) {
      filtered = filtered.map(surco => ({
        ...surco,
        cultivos: surco.cultivos.filter(cultivo => 
          cultivo.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(surco => surco.cultivos.length > 0);
    }
    
    return filtered;
  }, [surcos, selectedUbicacion, searchTerm]);

  const handleCreateCultivo = async (nuevoCultivo) => {
    try {
      const creado = await createCultivo(nuevoCultivo);
      setCultivos(prev => [creado, ...prev]);
      setIsAddOpen(false);
      
      setAnimateCard(creado.id);
      setTimeout(() => setAnimateCard(null), 1000);
      
      addNotification(
        `${creado.nombre} ha sido agregado a tu huerto`,
        "success"
      );
    } catch (error) {
      console.error("Error creando cultivo:", error);
      addNotification(
        `No pudimos crear "${nuevoCultivo.nombre}". Intenta nuevamente.`,
        "error"
      );
    }
  };

  const handleUpdateCultivo = async (id, updatedData) => {
    try {
      const data = await updateCultivo(id, updatedData);
      setCultivos(prev => prev.map(c => c.id === id ? data : c));
      setSelectedCultivo(null);
      addNotification(
        `${data.nombre} ha sido actualizado correctamente`,
        "success"
      );
    } catch (err) {
      console.error("Error actualizando cultivo:", err);
      addNotification(
        `Error al actualizar el cultivo`,
        "error"
      );
    }
  };

  const handleDeleteCultivo = async (id) => {
    try {
      const cultivoEliminado = cultivos.find(c => c.id === id);
      await deleteCultivo(id);
      setCultivos(prev => prev.filter(c => c.id !== id));
      setSelectedCultivo(null);
      addNotification(
        `${cultivoEliminado?.nombre || 'El cultivo'} ha sido eliminado`,
        "info"
      );
    } catch (err) {
      console.error("Error eliminando cultivo:", err);
      addNotification(
        `Error al eliminar el cultivo`,
        "error"
      );
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      activo: "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200",
      inactivo: "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 border-gray-200",
      alerta: "bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-200 animate-pulse",
      saludable: "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200",
      cosechado: "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200",
      perdido: "bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-200"
    };
    return colores[estado?.toLowerCase()] || "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 border-gray-200";
  };

  const getEstadoIcon = (estado) => {
    if (estado?.toLowerCase() === "alerta") return <AlertCircle size={12} className="text-red-600 animate-bounce" />;
    if (estado?.toLowerCase() === "saludable") return <Sparkles size={12} className="text-green-600" />;
    if (estado?.toLowerCase() === "activo") return <CheckCircle size={12} className="text-green-600" />;
    if (estado?.toLowerCase() === "cosechado") return <Star size={12} className="text-amber-600" />;
    return null;
  };

  const getRandomGradient = () => {
    const gradients = [
      "from-amber-50 via-orange-50 to-rose-50",
      "from-emerald-50 via-teal-50 to-cyan-50",
      "from-indigo-50 via-purple-50 to-pink-50",
      "from-green-50 via-lime-50 to-yellow-50",
      "from-sky-50 via-blue-50 to-indigo-50"
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const totalActivos = cultivos.filter(c => c.estado?.toLowerCase() === "activo" || c.estado?.toLowerCase() === "saludable").length;
  const totalCosechados = cultivos.filter(c => c.estado?.toLowerCase() === "cosechado").length;
  const mesesActivos = useMemo(() => {
    const meses = new Set();
    cultivos.forEach(c => {
      if (c.fechaSiembra) {
        const mes = new Date(c.fechaSiembra).toLocaleDateString('es-MX', { month: 'long' });
        meses.add(mes);
      }
    });
    return meses.size;
  }, [cultivos]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-gray-200 border-t-[#8B6F47] rounded-full animate-spin"></div>
          <Sprout size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8B6F47] animate-pulse" />
        </div>
        <p className="mt-4 text-gray-500 text-sm sm:text-base animate-pulse">Cargando tus cultivos...</p>
        <div className="mt-2 flex gap-1">
          <div className="w-1.5 h-1.5 bg-[#8B6F47] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-1.5 h-1.5 bg-[#8B6F47] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1.5 h-1.5 bg-[#8B6F47] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 relative">
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[10000] space-y-2 max-w-[calc(100%-2rem)] sm:max-w-md">
        {notifications.map((notif, index) => (
          <div
            key={notif.id}
            className="animate-slideInRight rounded-lg shadow-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 backdrop-blur-lg transform transition-all duration-300"
            style={{
              backgroundColor: notif.type === "success" 
                ? "rgba(34, 197, 94, 0.95)" 
                : notif.type === "error" 
                ? "rgba(239, 68, 68, 0.95)"
                : "rgba(59, 130, 246, 0.95)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02)"
            }}
          >
            <div className="flex-shrink-0 animate-bounce">
              {notif.type === "success" && <PartyPopper size={18} className="text-white" />}
              {notif.type === "error" && <AlertCircle size={18} className="text-white" />}
              {notif.type === "info" && <CheckCircle size={18} className="text-white" />}
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-white">
                {notif.message}
              </p>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-2 sm:gap-3 group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-500 group-hover:rotate-3">
            <Sprout size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Mis Cultivos
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Grid size={12} />
              Gestiona y cuida tus cultivos
            </p>
          </div>
        </div>
        
        <button
          className="bg-gradient-to-r from-[#8B6F47] to-[#6b5436] hover:from-[#7a5f3c] hover:to-[#5a4530] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 transform hover:scale-105 active:scale-95"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus size={14} className="animate-pulse" />
          <span>Nuevo cultivo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 animate-slideUp">
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Total cultivos</p>
              <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{cultivos.length}</p>
            </div>
            <div className="p-1.5 sm:p-3 bg-gradient-to-br from-[#8B6F47]/10 to-[#8B6F47]/5 rounded-lg sm:rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-all">
              <Sprout size={14} className="text-[#8B6F47]" />
            </div>
          </div>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-1 sm:mt-2 flex items-center gap-1">
            <TrendingUp size={8} className="group-hover:animate-pulse" />
            Registrados en el sistema
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Ubicaciones</p>
              <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{surcos.length}</p>
            </div>
            <div className="p-1.5 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-lg sm:rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-all">
              <MapPin size={14} className="text-blue-600" />
            </div>
          </div>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-1 sm:mt-2 flex items-center gap-1">
            <Layers size={8} />
            Zonas de cultivo
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Activos</p>
              <p className="text-xl sm:text-3xl font-bold text-green-600">{totalActivos}</p>
            </div>
            <div className="p-1.5 sm:p-3 bg-gradient-to-br from-green-50 to-green-100/30 rounded-lg sm:rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-all">
              <CheckCircle size={14} className="text-green-600" />
            </div>
          </div>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-1 sm:mt-2 flex items-center gap-1">
            <Leaf size={8} />
            En buen estado
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 p-3 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-amber-600 mb-0.5 sm:mb-1">Cosechados</p>
              <p className="text-xl sm:text-3xl font-bold text-amber-700">{totalCosechados}</p>
            </div>
            <div className="p-1.5 sm:p-3 bg-white/50 rounded-lg sm:rounded-xl group-hover:scale-110 transition-all">
              <Star size={14} className="text-amber-600" />
            </div>
          </div>
          <p className="text-[9px] sm:text-xs text-amber-600 mt-1 sm:mt-2 flex items-center gap-1">
            <Calendar size={8} />
            {mesesActivos} {mesesActivos === 1 ? 'mes activo' : 'meses activos'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5 animate-slideUp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-[#8B6F47]/10 rounded-lg">
              <Filter size={14} className="text-[#8B6F47]" />
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Filtrar cultivos</h3>
          </div>
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 hover:text-red-500 transition-all hover:scale-105"
            >
              <X size={10} />
              Limpiar búsqueda
            </button>
          )}
        </div>

        <div className="relative mb-4 group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8B6F47] transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nombre de cultivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setSelectedUbicacion("todas")}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-medium whitespace-nowrap transition-all transform hover:scale-105 ${
              selectedUbicacion === "todas"
                ? "bg-gradient-to-r from-[#8B6F47] to-[#6b5436] text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todas las ubicaciones
          </button>
          {surcos.map(surco => (
            <button
              key={surco.id}
              onClick={() => setSelectedUbicacion(surco.nombre)}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-medium whitespace-nowrap transition-all transform hover:scale-105 ${
                selectedUbicacion === surco.nombre
                  ? "bg-gradient-to-r from-[#8B6F47] to-[#6b5436] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {surco.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {surcosFiltrados.map(({ id, nombre, cultivos }, index) => (
          <section 
            key={id} 
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden animate-slideUp"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="bg-gradient-to-r from-[#fffaf8] via-[#fbefe1] to-transparent px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-md transform group-hover:scale-110 transition-all">
                  <MapPin size={14} className="text-[#8B6F47]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">{nombre}</h2>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Layers size={10} />
                    {cultivos.length} cultivo{cultivos.length !== 1 ? 's' : ''} en esta ubicación
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] sm:text-xs bg-gradient-to-r from-emerald-50 to-emerald-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-emerald-700 font-medium whitespace-nowrap animate-pulse">
                    {cultivos.filter(c => c.estado?.toLowerCase() === "activo" || c.estado?.toLowerCase() === "saludable").length} activos
                  </span>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {cultivos.map((cultivo, idx) => (
                  <div
                    key={cultivo.id || idx}
                    className={`group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden hover:border-[#8B6F47]/40 hover:-translate-y-2 cursor-pointer ${
                      animateCard === cultivo.id ? 'animate-pulse-ring' : ''
                    }`}
                    onClick={() => setSelectedCultivo(cultivo)}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    <div className={`h-32 sm:h-44 bg-gradient-to-br ${getRandomGradient()} flex items-center justify-center relative overflow-hidden`}>
                      {cultivo.imagen ? (
                        <>
                          <img
                            src={
                              cultivo.imagen.startsWith('http') && !cultivo.imagen.includes('localhost:3000')
                                ? cultivo.imagen 
                                : `${import.meta.env.VITE_API_URL}${cultivo.imagen.replace('http://localhost:3000', '').replace(/\\/g, '/').startsWith('/') ? '' : '/'}${cultivo.imagen.replace('http://localhost:3000', '').replace(/\\/g, '/')}`
                            }
                            alt={cultivo.nombre}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/400x300?text=Cultivo+sin+imagen";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </>
                      ) : (
                        <div className="relative">
                          <Sprout size={40} className="text-[#8B6F47]/30 group-hover:scale-110 transition-transform duration-500" />
                          <Flower2 size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8B6F47]/20 group-hover:scale-110 transition-transform" />
                        </div>
                      )}
                      
                      <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-medium border shadow-lg backdrop-blur-sm bg-opacity-95 ${getEstadoColor(cultivo.estado)} flex items-center gap-1 transform group-hover:scale-105 transition-all`}>
                        {getEstadoIcon(cultivo.estado)}
                        <span className="capitalize">{cultivo.estado}</span>
                      </div>

                      {cultivo.fechaSiembra && (
                        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] sm:text-xs text-white flex items-center gap-0.5 sm:gap-1 transform group-hover:scale-105 transition-all">
                          <Calendar size={8} />
                          {new Date(cultivo.fechaSiembra).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </div>
                      )}

                      {cultivo.estado?.toLowerCase() === "saludable" && (
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                          <Sparkles size={12} className="text-yellow-500 animate-pulse" />
                        </div>
                      )}
                    </div>

                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-gray-800 group-hover:text-[#8B6F47] transition-colors text-sm sm:text-base truncate mb-2 flex items-center gap-1">
                        {cultivo.nombre}
                        {cultivo.estado?.toLowerCase() === "saludable" && (
                          <Sparkles size={12} className="text-yellow-500 animate-pulse" />
                        )}
                      </h3>

                      <button
                        className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#8B6F47] hover:to-[#7a5f3c] text-gray-600 hover:text-white py-1.5 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-300 border border-gray-200 hover:border-transparent flex items-center justify-center gap-1.5 sm:gap-2 group/btn transform hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCultivo(cultivo);
                        }}
                      >
                        <Eye size={10} className="group-hover/btn:animate-pulse" />
                        <span>Ver bitácora</span>
                        <ChevronRight size={10} className="opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {!surcosFiltrados.length && surcos.length > 0 && (
          <div className="text-center py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200 animate-fadeIn">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-bounce">
              <Search size={36} className="text-amber-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-1 sm:mb-2">No se encontraron cultivos</h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              {searchTerm ? `No hay cultivos que coincidan con "${searchTerm}"` : "No hay cultivos en esta ubicación"}
            </p>
            {(searchTerm || selectedUbicacion !== "todas") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedUbicacion("todas");
                }}
                className="mt-4 sm:mt-6 inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#8B6F47] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm hover:bg-[#7a5f3c] transition-all transform hover:scale-105"
              >
                <ChevronLeft size={12} />
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!surcos.length && (
          <div className="text-center py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200 animate-fadeIn">
            <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-[#8B6F47]/20 to-[#8B6F47]/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-pulse">
              <Sprout size={40} className="text-[#8B6F47]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-1 sm:mb-2">Bienvenido a tu huerto digital</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 sm:mb-8 max-w-xs sm:max-w-md mx-auto px-4">
              Comienza añadiendo tu primer cultivo al sistema y observa cómo crece
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#8B6F47] to-[#6b5436] text-white rounded-lg sm:rounded-xl hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-sm sm:text-base font-medium animate-bounce"
            >
              <Plus size={16} />
              Añadir mi primer cultivo
              <Sparkles size={14} className="animate-pulse" />
            </button>
          </div>
        )}
      </div>

      <EditCultivoModal
        isOpen={!!selectedCultivo}
        onClose={() => setSelectedCultivo(null)}
        cultivo={selectedCultivo}
        onSave={handleUpdateCultivo}
        onDelete={handleDeleteCultivo}
        userRole={userRole}
      />

      <AddCultivoModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleCreateCultivo}
      />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulseRing {
          0% {
            box-shadow: 0 0 0 0 rgba(139, 111, 71, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(139, 111, 71, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(139, 111, 71, 0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out forwards;
        }
        
        .animate-pulse-ring {
          animation: pulseRing 0.8s ease-out;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-bounce {
          animation: bounce 0.5s ease-out;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}