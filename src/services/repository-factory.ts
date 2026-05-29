import { MockAnimalRepository } from './mock-animal-repository';
import { SupabaseAnimalRepository } from './supabase-animal-repository';
import type { IAnimalRepository } from './interfaces';

export function createAnimalRepository(): IAnimalRepository {
  const useMock = import.meta.env.VITE_USE_MOCK === 'true';
  if (useMock) {
    return new MockAnimalRepository();
  }

  return new SupabaseAnimalRepository();
}
