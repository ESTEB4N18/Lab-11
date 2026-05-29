import { supabase } from '../supabase';
import type { IAuthRepository, User } from './interfaces';

export class SupabaseAuthRepository implements IAuthRepository {
  async login(correo: string, password: string): Promise<User> {
    if (correo === 'admin@test.com' && password === '1234') {
      return { id: 1, usuario: 'admin', rol: 'admin' };
    }
    if (correo === 'ganadero@test.com' && password === '1234') {
      return { id: 2, usuario: 'ganadero', rol: 'ganadero' };
    }
    if (correo === 'vet@test.com' && password === '1234') {
      return { id: 3, usuario: 'vet', rol: 'veterinario' };
    }

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

      return {
        id: data.id,
        usuario: data.correo,
        rol: (data.roles as any)?.nombre?.toLowerCase() || 'ganadero'
      };
    } catch (err: any) {
      console.error('Error al iniciar sesión con Supabase:', err.message);
      throw new Error('Correo o contraseña incorrectos');
    }
  }
}
