import { supabase } from '@/supabase';

export interface Rol {
  id: number;
  nombre: string;
}

export interface UsuarioInfo {
  id: number;
  correo: string;
  nombre_completo: string;
  activo: boolean;
  rol_id: number;
  rol_nombre?: string;
  creado_en?: string;
}

export const adminService = {
  // Obtener todos los roles
  async getRoles(): Promise<Rol[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('id, nombre')
      .order('id');
      
    if (error) {
      console.error('Error fetching roles:', error.message);
    }

    if (!data || data.length === 0) {
      console.warn('La tabla roles está vacía o protegida. Cargando roles base...');
      return [
        { id: 1, nombre: 'admin' },
        { id: 2, nombre: 'ganadero' },
        { id: 3, nombre: 'veterinario' }
      ];
    }
    return data as Rol[];
  },

  // Obtener todos los usuarios
  async getUsuarios(): Promise<UsuarioInfo[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        correo,
        nombre_completo,
        activo,
        rol_id,
        creado_en,
        roles (
          nombre
        )
      `)
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error fetching usuarios:', error.message);
      throw new Error(error.message);
    }

    return (data || []).map((u: any) => {
      let nombreRol = u.roles?.nombre;
      if (!nombreRol) {
        if (u.rol_id === 1) nombreRol = 'admin';
        else if (u.rol_id === 2) nombreRol = 'ganadero';
        else if (u.rol_id === 3) nombreRol = 'veterinario';
      }

      return {
        id: u.id,
        correo: u.correo,
        nombre_completo: u.nombre_completo || 'Sin nombre',
        activo: u.activo,
        rol_id: u.rol_id,
        rol_nombre: nombreRol,
        creado_en: new Date(u.creado_en).toLocaleDateString('es-CR')
      };
    });
  },

  // Crear un nuevo usuario manualmente
  async crearUsuario(usuario: { correo: string; contrasena: string; rol_id: number; nombre_completo: string }): Promise<void> {
    // Validaciones básicas antes de insertar
    if (!usuario.correo || !usuario.correo.includes('@')) {
      throw new Error('El correo electrónico no es válido.');
    }
    if (!usuario.contrasena || usuario.contrasena.length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres.');
    }
    if (!usuario.nombre_completo || usuario.nombre_completo.trim().length === 0) {
      throw new Error('El nombre completo es requerido.');
    }

    // Verificar si el correo ya existe
    const { data: existente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('correo', usuario.correo)
      .maybeSingle();

    if (existente) {
      throw new Error(`Ya existe un usuario con el correo: ${usuario.correo}`);
    }

    const { error } = await supabase
      .from('usuarios')
      .insert([
        { 
          correo: usuario.correo, 
          contrasena_hash: usuario.contrasena,
          rol_id: usuario.rol_id,
          nombre_completo: usuario.nombre_completo,
          activo: true
        }
      ]);
      
    if (error) {
      console.error('Error creating user:', error.message, error.details, error.hint, error.code);
      // Mensajes amigables para errores comunes de Supabase
      if (error.code === '42501' || error.message.includes('row-level security')) {
        throw new Error('Permiso denegado: Las políticas de seguridad (RLS) de Supabase bloquean esta operación. Debes agregar una política INSERT en la tabla "usuarios" desde el panel de Supabase.');
      }
      if (error.code === '23505') {
        throw new Error('Ya existe un usuario con ese correo electrónico.');
      }
      if (error.code === '23502') {
        throw new Error(`Falta un campo requerido en la tabla: ${error.message}`);
      }
      throw new Error(`Error de Supabase: ${error.message}`);
    }
  },

  // Eliminar usuario
  async eliminarUsuario(id: number): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting user:', error.message);
      throw new Error(error.message);
    }
  },

  // Bloquear / Desbloquear usuario
  async toggleEstadoUsuario(id: number, nuevoEstado: boolean): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .update({ activo: nuevoEstado })
      .eq('id', id);
      
    if (error) {
      console.error('Error updating user status:', error.message);
      throw new Error(error.message);
    }
  },

  // Obtener estadísticas reales para el dashboard
  async getDashboardStats(): Promise<{ personalActivo: number, bovinos: number, pesajes: number, alertas: number }> {
    const { count: personalCount } = await supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('activo', true);
    const { count: bovinosCount } = await supabase.from('animales').select('*', { count: 'exact', head: true });
    const { count: pesajesCount } = await supabase.from('estimaciones_peso').select('*', { count: 'exact', head: true });
    
    // Si no hay tabla de alertas, mantenemos en 0 o intentamos
    let alertasCount = 0;
    try {
      const { count } = await supabase.from('alertas_medicas').select('*', { count: 'exact', head: true });
      alertasCount = count || 0;
    } catch {
      alertasCount = 0;
    }

    return {
      personalActivo: personalCount || 0,
      bovinos: bovinosCount || 0,
      pesajes: pesajesCount || 0,
      alertas: alertasCount
    };
  },

  // Obtener datos reales para la gráfica de 6 meses
  async getChartData(): Promise<{ labels: string[], pesajes: number[], nacimientos: number[] }> {
    const { data: pesajesData } = await supabase.from('estimaciones_peso').select('creado_en');
    const { data: animalesData } = await supabase.from('animales').select('fecha_nacimiento');

    const labels = [];
    const pesajes = [0, 0, 0, 0, 0, 0];
    const nacimientos = [0, 0, 0, 0, 0, 0];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      labels.push(d.toLocaleString('es-CR', { month: 'short' }).toUpperCase());
    }

    if (pesajesData) {
      pesajesData.forEach((p: any) => {
        if (!p.creado_en) return;
        const d = new Date(p.creado_en);
        const monthDiff = (new Date().getFullYear() - d.getFullYear()) * 12 + new Date().getMonth() - d.getMonth();
        if (monthDiff >= 0 && monthDiff < 6) {
          pesajes[5 - monthDiff]++;
        }
      });
    }

    if (animalesData) {
      animalesData.forEach((a: any) => {
        if (!a.fecha_nacimiento) return;
        const d = new Date(a.fecha_nacimiento);
        const monthDiff = (new Date().getFullYear() - d.getFullYear()) * 12 + new Date().getMonth() - d.getMonth();
        if (monthDiff >= 0 && monthDiff < 6) {
          nacimientos[5 - monthDiff]++;
        }
      });
    }

    return { labels, pesajes, nacimientos };
  }
};
