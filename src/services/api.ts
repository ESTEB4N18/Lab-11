import { supabase } from '../supabase';

export interface User {
  id: number;
  usuario: string;
  rol: 'admin' | 'ganadero' | 'veterinario';
}

export interface WeightRecord {
  fecha: string;
  peso: number;
}

export interface Animal {
  id: number;
  nombre: string;
  raza: string;
  edad: string;
  arete: string;
  imagen: string;
  pesoActual: number;
  historialPeso: WeightRecord[];
}

/**
 * SERVICIO REAL USANDO SUPABASE
 * ==========================================
 * Este servicio reemplaza a axios y a los datos falsos (mockData).
 * Conecta directamente la app a tu base de datos de Supabase.
 * 
 * Para que esto funcione, necesitas tener creadas las siguientes tablas en Supabase:
 * 
 * 1. Tabla: animales
 *    - id (int8, primary key)
 *    - nombre (text)
 *    - raza (text)
 *    - edad (text)
 *    - arete (text)
 *    - imagen (text)
 *    - pesoActual (numeric o int4)
 * 
 * 2. Tabla: historial_peso
 *    - id (int8, primary key)
 *    - animal_id (int8, foreign key a animales.id)
 *    - fecha (date o text)
 *    - peso (numeric o int4)
 */

export const animalService = {
  // Obtener un animal específico por su ID junto con su historial
  async getAnimalById(id: number): Promise<Animal> {
    const { data: animal, error: animalError } = await supabase
      .from('animales')
      .select('*, razas(nombre)')
      .eq('id', id)
      .single();

    if (animalError) {
      console.error('Error obteniendo animal:', animalError.message);
      throw new Error(animalError.message);
    }

    const { data: historial, error: historialError } = await supabase
      .from('estimaciones_peso')
      .select('creado_en, peso_estimado_kg, peso_corregido_kg')
      .eq('animal_id', id)
      .order('creado_en', { ascending: true });

    if (historialError) {
      console.error('Error obteniendo historial:', historialError.message);
    }

    const historialPeso = (historial || []).map((h: any) => ({
      fecha: new Date(h.creado_en).toLocaleDateString('es-CR'),
      peso: h.peso_corregido_kg || h.peso_estimado_kg
    }));

    const pesoActual = historialPeso.length > 0 ? historialPeso[historialPeso.length - 1].peso : 0;

    return { 
      id: animal.id,
      nombre: animal.nombre || 'Sin nombre',
      raza: (animal.razas as any)?.nombre || 'Desconocida',
      edad: animal.fecha_nacimiento 
        ? `${new Date().getFullYear() - new Date(animal.fecha_nacimiento).getFullYear()} años` 
        : 'N/A',
      arete: animal.numero_arete,
      imagen: animal.observaciones || 'assets/cow-placeholder.png', // Fallback or using comments
      pesoActual,
      historialPeso
    } as Animal;
  },

  // Obtener únicamente el historial de peso de un animal
  async getWeightHistory(animalId: number): Promise<WeightRecord[]> {
    const { data, error } = await supabase
      .from('estimaciones_peso')
      .select('creado_en, peso_estimado_kg, peso_corregido_kg')
      .eq('animal_id', animalId)
      .order('creado_en', { ascending: true });

    if (error) {
      console.error('Error en historial de peso:', error.message);
      throw new Error(error.message);
    }

    return (data || []).map((h: any) => ({
      fecha: new Date(h.creado_en).toLocaleDateString('es-CR'),
      peso: h.peso_corregido_kg || h.peso_estimado_kg
    })) as WeightRecord[];
  },

  // Obtener la lista de todos los animales (para mostrar en el dashboard)
  async getAllAnimals(): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animales')
      .select(`
        *,
        razas(nombre),
        estimaciones_peso(peso_estimado_kg, peso_corregido_kg)
      `);

    if (error) {
      console.error('Error obteniendo todos los animales:', error.message);
      throw new Error(error.message);
    }

    return (data || []).map((a: any) => {
      const weights = a.estimaciones_peso || [];
      const latestWeight = weights.length > 0 
        ? (weights[weights.length - 1].peso_corregido_kg || weights[weights.length - 1].peso_estimado_kg) 
        : 0;

      return {
        id: a.id,
        nombre: a.nombre || 'Sin nombre',
        raza: a.razas?.nombre || 'Brahman',
        edad: a.fecha_nacimiento 
          ? `${new Date().getFullYear() - new Date(a.fecha_nacimiento).getFullYear()} años` 
          : 'N/A',
        arete: a.numero_arete,
        imagen: 'assets/cow-placeholder.png',
        pesoActual: latestWeight,
        historialPeso: []
      };
    }) as Animal[];
  },
};

export const authService = {
  // Función para iniciar sesión
  async login(correo: string, password: string): Promise<User> {
    // 1. Optimización: Verificación inmediata de cuentas de prueba (Fallback local)
    if (correo === 'admin@test.com' && password === '1234') {
      return { id: 1, usuario: 'admin', rol: 'admin' };
    }
    if (correo === 'ganadero@test.com' && password === '1234') {
      return { id: 2, usuario: 'ganadero', rol: 'ganadero' };
    }
    if (correo === 'vet@test.com' && password === '1234') {
      return { id: 3, usuario: 'vet', rol: 'veterinario' };
    }

    // 2. Si no es de prueba, intentar consultar Supabase
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          correo,
          roles (
            nombre
          )
        `)
        .eq('correo', correo)
        .eq('contrasena_hash', password)
        .single();

      if (error) {
        throw error;
      }

      // Mapear el resultado al objeto User que espera la aplicación
      return {
        id: data.id,
        usuario: data.correo,
        rol: (data.roles as any)?.nombre?.toLowerCase() || 'ganadero'
      } as User;
    } catch (err: any) {
      console.error('Error al iniciar sesión con Supabase:', err.message);
      throw new Error('Correo o contraseña incorrectos');
    }
  }
};
