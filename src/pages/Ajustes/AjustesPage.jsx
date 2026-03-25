import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCultivos } from '../../services/cultivos.service';
import { Globe, Sliders, Save, Eye, MapPin, Building2, Calendar, Download, Upload, Check, TrendingUp, AlertCircle } from 'lucide-react';

export default function AjustesPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    farmName: user?.farmName || 'Tetlalli - Huerto Escolar UTT',
    location: user?.location || 'Tlaxcala, México',
    dateFormat: 'DD/MM/YYYY',
    theme: user?.darkMode ? 'dark' : 'light',
    autoBackup: false,
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Protección de Ruta: Solo Admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    setError('');

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          farmName: settings.farmName,
          location: settings.location,
          darkMode: settings.theme === 'dark'
        })
      });

      if (!res.ok) throw new Error("Error al guardar cambios");
      
      const updatedData = await res.json();
      
      // Actualizar contexto global para que el Sidebar refleje el cambio
      updateUser({
        farmName: updatedData.farmName,
        location: updatedData.location,
        darkMode: updatedData.darkMode
      });

      setSuccessMessage('¡Configuración del Huerto guardada correctamente!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Fallo al guardar en el servidor');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tetlalli_huerto_config_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = async () => {
    try {
      const cultivos = await getCultivos();
      if (!cultivos || cultivos.length === 0) {
        alert("No hay cultivos para exportar");
        return;
      }

      const headers = ['Nombre', 'Estado', 'Ubicación', 'Fecha Siembra', 'Riego (días)'];
      const csvContent = [
        headers.join(','),
        ...cultivos.map(c => [
          `"${c.nombre}"`,
          `"${c.estado}"`,
          `"${c.ubicacion}"`,
          `"${new Date(c.fechaSiembra).toLocaleDateString()}"`,
          c.frecuenciaRiego
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tetlalli_cultivos_neon_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exportando CSV:", err);
      alert("Error al obtener cultivos de la base de datos");
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setSettings(prev => ({ ...prev, ...imported }));
        setSuccessMessage('Configuración importada. ¡No olvides Guardar!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } catch (err) {
        alert('Archivo JSON inválido');
      }
    };
    reader.readAsText(file);
  };

  if (user && user.role !== 'admin') return null;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
            <Sliders size={18} className="sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Configuración del Sistema
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Globe size={12} className="sm:w-3.5 sm:h-3.5" />
              Gestión del Huerto Escolar y formatos regionales
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {successMessage && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-green-50 text-green-700 rounded-lg text-[10px] sm:text-sm border border-green-200">
              <Check size={12} className="sm:w-4 sm:h-4" />
              {successMessage}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-red-50 text-red-700 rounded-lg text-[10px] sm:text-sm border border-red-200">
              <AlertCircle size={12} className="sm:w-4 sm:h-4" />
              {error}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-[#8B6F47] to-[#6b5436] hover:from-[#7a5f3c] hover:to-[#5a4530] text-white px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={14} className="sm:w-4.5 sm:h-4.5" />
                <span>Guardar cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Huerto</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-[100px] sm:max-w-[150px]">{settings.farmName}</p>
            </div>
            <div className="p-1.5 sm:p-3 bg-[#8B6F47]/10 rounded-lg sm:rounded-xl">
              <Building2 size={14} className="sm:w-5 sm:h-5 text-[#8B6F47]" />
            </div>
          </div>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-1 sm:mt-2 flex items-center gap-1">
            <MapPin size={8} className="sm:w-2.5 sm:h-2.5" />
            {settings.location}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Formato fecha</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-800">{settings.dateFormat}</p>
            </div>
            <div className="p-1.5 sm:p-3 bg-[#8B6F47]/10 rounded-lg sm:rounded-xl">
              <Calendar size={14} className="sm:w-5 sm:h-5 text-[#8B6F47]" />
            </div>
          </div>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-1 sm:mt-2 flex items-center gap-1">
            <Globe size={8} className="sm:w-2.5 sm:h-2.5" />
            Estilo regional México
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Backup Neon</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-800">
                {settings.autoBackup ? 'Auto Activo' : 'Manual CSV/JSON'}
              </p>
            </div>
            <div className="p-1.5 sm:p-3 bg-[#8B6F47]/10 rounded-lg sm:rounded-xl">
              <Download size={14} className="sm:w-5 sm:h-5 text-[#8B6F47]" />
            </div>
          </div>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-1 sm:mt-2 flex items-center gap-1">
            <TrendingUp size={8} className="sm:w-2.5 sm:h-2.5" />
            Respaldar lista cultivos
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-3 sm:mb-5">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#8B6F47]/20 to-[#8B6F47]/10 rounded-lg">
              <Building2 size={14} className="sm:w-4.5 sm:h-4.5 text-[#8B6F47]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Información del Huerto Escolar</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Building2 size={10} className="sm:w-3 sm:h-3" />
                Nombre del Huerto
              </label>
              <input
                type="text"
                value={settings.farmName}
                onChange={(e) => handleChange('farmName', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all bg-white"
                placeholder="Ej: Tetlalli - Huerto UTT"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={10} className="sm:w-3 sm:h-3" />
                Ubicación Regional
              </label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all bg-white"
                placeholder="Ej: Tlaxcala, México"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-3 sm:mb-5">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#8B6F47]/20 to-[#8B6F47]/10 rounded-lg">
              <Globe size={14} className="sm:w-4.5 sm:h-4.5 text-[#8B6F47]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Formatos Regionales (México)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={10} className="sm:w-3 sm:h-3" />
                Formato de fecha
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all bg-white"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Ej: 24/03/2026)</option>
                <option value="DD de MMMM de YYYY">DD de MMMM de YYYY (Ej: 24 de Marzo de 2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (Estándar)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                Tema de Interfaz
              </label>
              <select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all bg-white"
              >
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-3 sm:mb-5">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#8B6F47]/20 to-[#8B6F47]/10 rounded-lg">
              <Download size={14} className="sm:w-4.5 sm:h-4.5 text-[#8B6F47]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Datos y Respaldo Escolar</h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-[#8B6F47]/5 transition-all cursor-pointer group">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 bg-white rounded-lg group-hover:bg-[#8B6F47]/10 transition-colors">
                  <Download size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500 group-hover:text-[#8B6F47]" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700">Respaldo automático en Nube</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={() => handleToggle('autoBackup')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-[#8B6F47] relative"></div>
              </div>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-[#8B6F47] hover:text-white transition-all group"
              >
                <Download size={12} className="sm:w-4 sm:h-4" />
                Exportar JSON
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-green-600 hover:text-white transition-all group"
              >
                <TrendingUp size={12} className="sm:w-4 sm:h-4" />
                Exportar Crops (CSV)
              </button>

              <label className="cursor-pointer flex-1">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-blue-600 hover:text-white transition-all group text-center">
                  <Upload size={12} className="sm:w-4 sm:h-4" />
                  Importar JSON
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}