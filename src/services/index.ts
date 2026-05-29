import { createAnimalRepository } from './repository-factory';
import { SupabaseAuthRepository } from './supabase-auth-repository';
import { animalService, authService } from './api';
import type {
  Animal,
  WeightRecord,
  User,
  IAnimalRepository,
  IAuthRepository
} from './interfaces';

export const animalRepository: IAnimalRepository = createAnimalRepository();
export const authRepository: IAuthRepository = new SupabaseAuthRepository();
export const dataService = animalRepository;

// Compatibilidad con código existente
export { animalService, authService };
export type { Animal, WeightRecord, User, IAnimalRepository, IAuthRepository };
