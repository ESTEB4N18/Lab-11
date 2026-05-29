import { supabase } from '../supabase';
import { adaptAnimalRecord, adaptWeightHistory } from './data-adapter';
import type { Animal, WeightRecord, IAnimalRepository } from './interfaces';

export class SupabaseAnimalRepository implements IAnimalRepository {
  async getAnimalById(id: number): Promise<Animal> {
    const { data: rawAnimal, error: animalError } = await supabase
      .from('animales')
      .select('*, razas(nombre)')
      .eq('id', id)
      .single();

    if (animalError) {
      console.error('Error obteniendo animal:', animalError.message);
      throw new Error(animalError.message || 'Error al obtener el animal');
    }

    const { data: rawHistory, error: historyError } = await supabase
      .from('estimaciones_peso')
      .select('creado_en, peso_estimado_kg, peso_corregido_kg')
      .eq('animal_id', id)
      .order('creado_en', { ascending: true });

    if (historyError) {
      console.error('Error obteniendo historial:', historyError.message);
    }

    return adaptAnimalRecord(rawAnimal, rawHistory || []);
  }

  async getWeightHistory(animalId: number): Promise<WeightRecord[]> {
    const { data, error } = await supabase
      .from('estimaciones_peso')
      .select('creado_en, peso_estimado_kg, peso_corregido_kg')
      .eq('animal_id', animalId)
      .order('creado_en', { ascending: true });

    if (error) {
      console.error('Error en historial de peso:', error.message);
      throw new Error(error.message || 'Error al obtener historial de peso');
    }

    return adaptWeightHistory(data || []);
  }

  async getAllAnimals(): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animales')
      .select(`
        *,
        razas(nombre),
        estimaciones_peso(creado_en, peso_estimado_kg, peso_corregido_kg)
      `);

    if (error) {
      console.error('Error obteniendo todos los animales:', error.message);
      throw new Error(error.message || 'Error al obtener los animales');
    }

    return (data || []).map((raw: any) => {
      const history = raw.estimaciones_peso || [];
      const animal = adaptAnimalRecord(raw, history);
      return {
        ...animal,
        historialPeso: []
      };
    }) as Animal[];
  }
}
