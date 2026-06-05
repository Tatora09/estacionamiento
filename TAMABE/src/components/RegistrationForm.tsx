/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserType } from '../types';
import { formatRut, validarRut } from '../utils/mockData';
import { Shield, Check, Info, FileLock, UserCheck, AlertCircle } from 'lucide-react';

interface RegistrationFormProps {
  onRegisterSuccess: (user: User) => void;
  registeredUsers: User[];
}

export function RegistrationForm({ onRegisterSuccess, registeredUsers }: RegistrationFormProps) {
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [celular, setCelular] = useState('');
  const [tipo, setTipo] = useState<UserType>('Estudiante');
  const [patente, setPatente] = useState('');
  const [modeloVehiculo, setModeloVehiculo] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  
  // Validation states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setRut(formatted);
    if (errors.rut) {
      setErrors(prev => ({ ...prev, rut: '' }));
    }
  };

  const handlePatenteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Patente format in Chile: 4 letters & 2 numbers (e.g. ABCD12) or 2 letters, 4 numbers (e.g. AB1234)
    // sanitize to allow only letters, numbers, and dashes
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    // Auto insert dash if user types a block (e.g. AA1234 -> AA-12-34 or ABCD12 -> AB-CD-12)
    setPatente(val);
    if (errors.patente) {
      setErrors(prev => ({ ...prev, patente: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre completo es obligatorio';
    } else if (nombre.trim().split(' ').length < 2) {
      newErrors.nombre = 'Por favor ingrese nombre y apellido';
    }

    if (!rut) {
      newErrors.rut = 'El RUT es obligatorio';
    } else if (!validarRut(rut)) {
      newErrors.rut = 'El RUT ingresado no es válido';
    }

    if (!correo) {
      newErrors.correo = 'El correo institucional es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      newErrors.correo = 'Formato de correo inválido';
    } else if (tipo !== 'Visita' && tipo !== 'Externo' && !correo.endsWith('duocuc.cl')) {
      newErrors.correo = 'Alumnos y funcionarios deben usar el correo corporativo @duocuc.cl';
    }

    if (!celular) {
      newErrors.celular = 'El número de celular es obligatorio';
    } else if (!/^\+?56\s?9\s?\d{4}\s?\d{4}$|^\s?9\s?\d{8}$/.test(celular.replace(/\s+/g, ''))) {
      newErrors.celular = 'Formato de celular requerido: +56 9 XXXX XXXX o 9XXXXXXXX';
    }

    if (!patente) {
      newErrors.patente = 'La patente del vehículo es obligatoria';
    } else if (patente.replace(/-/g, '').length < 6) {
      newErrors.patente = 'La patente debe tener al menos 6 caracteres';
    }

    if (!aceptaTerminos) {
      newErrors.aceptaTerminos = 'Debe aceptar los términos de Protección de Datos Personales (Ley 19.628)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newUser: User = {
      rut,
      nombre: nombre.trim(),
      correo: correo.trim(),
      celular: celular.trim(),
      tipo,
      patente: patente.toUpperCase().replace(/-/g, ''),
      modeloVehiculo: modeloVehiculo.trim() || undefined,
      aceptaTerminos
    };

    onRegisterSuccess(newUser);
    setSuccessMsg('¡Registro completado con éxito! Ahora puede obtener su pase QR.');
    
    // reset form fields
    setRut('');
    setNombre('');
    setCorreo('');
    setCelular('');
    setPatente('');
    setModeloVehiculo('');
    setAceptaTerminos(false);

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 relative" id="registration-form-card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl" id="reg-form-icon-wrap">
          <UserCheck className="w-6 h-6" id="reg-form-icon" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800" id="reg-form-title">Autorregistro de Conductor y Vehículo</h2>
          <p className="text-xs text-slate-500" id="reg-form-subtitle">Sede Duoc UC Maipú - Acceso seguro y controlado</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl flex items-start space-x-3" id="reg-success">
          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" id="reg-success-icon" />
          <p className="text-sm font-medium text-emerald-800" id="reg-success-text">{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" id="reg-form-element">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="reg-form-grid">
          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="nombre-input">
              Nombre Completo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="nombre-input"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errors.nombre) setErrors(prev => ({ ...prev, nombre: '' }));
              }}
              className={`w-full px-4 py-2 text-sm rounded-xl border ${errors.nombre ? 'border-rose-500 bg-rose-50/10' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition`}
              placeholder="Ej: Marcelo Tobar Muñoz"
            />
            {errors.nombre && <p className="text-xs text-rose-500 mt-1" id="err-nombre">{errors.nombre}</p>}
          </div>

          {/* RUT */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="rut-input">
              RUT Chileno <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="rut-input"
              value={rut}
              onChange={handleRutChange}
              className={`w-full px-4 py-2 text-sm font-mono rounded-xl border ${errors.rut ? 'border-rose-500 bg-rose-50/10' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition`}
              placeholder="Ej: 12.345.678-K"
            />
            {errors.rut && <p className="text-xs text-rose-500 mt-1" id="err-rut">{errors.rut}</p>}
          </div>

          {/* Perfil del Conductor */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="tipo-select">
              Perfil / Rol Duoc UC <span className="text-rose-500">*</span>
            </label>
            <select
              id="tipo-select"
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value as UserType);
                if (errors.correo) setErrors(prev => ({ ...prev, correo: '' })); // clear mail error if student/visitor changes
              }}
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
            >
              <option value="Estudiante">Estudiante</option>
              <option value="Docente">Docente</option>
              <option value="Colaborador">Colaborador / Funcionario</option>
              <option value="Directivo">Directivo Sede</option>
              <option value="Visita">Visita Externa</option>
              <option value="Externo">Contratista / Solicitudes Especiales</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="correo-input">
              Correo Electrónico <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              id="correo-input"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                if (errors.correo) setErrors(prev => ({ ...prev, correo: '' }));
              }}
              className={`w-full px-4 py-2 text-sm rounded-xl border ${errors.correo ? 'border-rose-500 bg-rose-50/10' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition`}
              placeholder={tipo === 'Visita' || tipo === 'Externo' ? "ejemplo@correo.com" : "usuario@duocuc.cl"}
            />
            {errors.correo && <p className="text-xs text-rose-500 mt-1" id="err-correo">{errors.correo}</p>}
          </div>

          {/* Celular */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="celular-input">
              Teléfono Celular <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              id="celular-input"
              value={celular}
              onChange={(e) => {
                setCelular(e.target.value);
                if (errors.celular) setErrors(prev => ({ ...prev, celular: '' }));
              }}
              className={`w-full px-4 py-2 text-sm rounded-xl border ${errors.celular ? 'border-rose-500 bg-rose-50/10' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition`}
              placeholder="Ej: +56 9 1234 5678"
            />
            {errors.celular && <p className="text-xs text-rose-500 mt-1" id="err-celular">{errors.celular}</p>}
          </div>

          {/* Patente Vehículo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="patente-input">
              Patente del Vehículo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="patente-input"
              value={patente}
              onChange={handlePatenteChange}
              maxLength={8}
              className={`w-full px-4 py-2 text-sm font-semibold tracking-wider font-mono rounded-xl border ${errors.patente ? 'border-rose-500 bg-rose-50/10' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition uppercase`}
              placeholder="Ej: ABCD12 o BB-CC-11"
            />
            {errors.patente && <p className="text-xs text-rose-500 mt-1" id="err-patente">{errors.patente}</p>}
          </div>

          {/* Marca / Modelo (Opcional) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="modelo-input">
              Modelo y Color del Vehículo <span className="text-slate-400 text-xs">(Opcional para verificación visual)</span>
            </label>
            <input
              type="text"
              id="modelo-input"
              value={modeloVehiculo}
              onChange={(e) => setModeloVehiculo(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              placeholder="Ej: Hyundai Accent Gris Platino, Chevrolet Sail Rojo"
            />
          </div>
        </div>

        {/* Chile Ley 19.628 Compliance Box */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200" id="ley-compliance-container">
          <div className="flex items-start space-x-3" id="ley-compliance-flex">
            <input
              type="checkbox"
              id="aceptaTerminos"
              checked={aceptaTerminos}
              onChange={(e) => {
                setAceptaTerminos(e.target.checked);
                if (errors.aceptaTerminos) setErrors(prev => ({ ...prev, aceptaTerminos: '' }));
              }}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
            />
            <div className="text-xs text-slate-600" id="ley-info-block">
              <label htmlFor="aceptaTerminos" className="font-medium text-slate-700 block cursor-pointer mb-1">
                Acepto la Política de Protección de Datos Personales (Ley N° 19.628 de Chile)
              </label>
              <p className="text-slate-500 leading-relaxed">
                De conformidad con la Ley 19.628, autorizo expresamente a Duoc UC Sede Maipú a tratar mis datos personales (RUT, Patente, Correo institucional y Registro de accesos) únicamente con fines informativos de seguridad del recinto, control de aforo y ocupación vehicular en tiempo real. Mis datos serán encriptados localmente y no serán compartidos con terceros ni utilizados con fines comerciales. 
                <button 
                  type="button" 
                  onClick={() => setShowConsentModal(true)} 
                  className="text-amber-600 font-semibold hover:underline block mt-1 hover:text-amber-700"
                  id="view-detailed-terms"
                >
                  Ver Términos de Datos Personales Detallados
                </button>
              </p>
            </div>
          </div>
          {errors.aceptaTerminos && <p className="text-xs text-rose-500 mt-2" id="err-acepta">{errors.aceptaTerminos}</p>}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2" id="submit-button-container">
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white hover:text-yellow-400 font-bold text-sm rounded-xl transition-all shadow-sm flex items-center space-x-2 cursor-pointer border border-slate-950"
            id="register-driver-btn"
          >
            <span>Registrar Conductor y Patente</span>
          </button>
        </div>
      </form>

      {/* Detailed Chile Ley 19.628 Privacy Terms Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="policy-modal">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200" id="policy-modal-card">
            <div className="flex items-center space-x-2 text-slate-800 mb-4" id="policy-header-wrap">
              <FileLock className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold">Aviso Legal - Ley 19.628 del Estado de Chile</h3>
            </div>
            
            <div className="space-y-3 text-slate-600 text-xs max-h-[300px] overflow-y-auto pr-2 mb-6 border-b border-t py-3 border-slate-100" id="policy-content">
              <h4 className="font-bold text-slate-700">1. Principio de Licitud y Finalidad Limitada</h4>
              <p>Los datos que recopila esta aplicación del Sistema de Estacionamientos de Duoc UC Maipú son: Nombre completo, RUT, Correo, Celular y Patente de su vehículo. La finalidad exclusiva de este registro es asegurar el control de acceso a los alumnos regulares, docentes, visitas y personal autorizado de la Sede Duoc Maipú, y generar el código de acceso QR intransferible.</p>
              
              <h4 className="font-bold text-slate-700">2. Seguridad de Datos y Cifrado</h4>
              <p>El sistema implementa medidas de confidencialidad y controles cibernéticos estándar. Toda patente escaneada por seguridad en los tótems QR o validadas por los guardias de turno se contrastan localmente en memoria y en bases de datos locales sandboxed, no expuestas externamente. Ninguna base de datos de patentes es pública ni indexable.</p>

              <h4 className="font-bold text-slate-700">3. Derechos ARCO del Usuario</h4>
              <p>En estricto cumplimiento con la legislación chilena (Ley N° 19.628), usted conserva en todo momento sus derechos de **Acceso, Rectificación, Cancelación y Oposición (ARCO)**. Para solicitar la remoción inmediata de su patente y datos personales de los registros activos de la sede informática de Duoc UC Maipú, puede acudir al departamento de Operaciones o realizar el borrado de cookies y datos persistidos desde la sección de restablecimiento del sistema en esta pantalla.</p>

              <h4 className="font-bold text-slate-700">4. Geolocalización y Control Físico</h4>
              <p>El sistema únicamente registra la asignación del espacio de estacionamiento que usted ocupa físicamente, registrando la hora de entrada y salida, sin almacenar telemetría de GPS de su dispositivo celular una vez fuera del establecimiento.</p>
            </div>

            <div className="flex justify-end" id="policy-actions">
              <button
                type="button"
                onClick={() => {
                  setAceptaTerminos(true);
                  if (errors.aceptaTerminos) setErrors(prev => ({ ...prev, aceptaTerminos: '' }));
                  setShowConsentModal(false);
                }}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 border border-yellow-500 font-bold text-xs rounded-lg transition"
                id="policy-accept-btn"
              >
                Aceptar Términos de Datos Legalmente
              </button>
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="ml-2 px-4 py-2 bg-slate-100 text-slate-600 font-medium text-xs rounded-lg hover:bg-slate-200 transition"
                id="policy-close-btn"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
