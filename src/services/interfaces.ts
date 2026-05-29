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

export interface User {
  id: number;
  usuario: string;
  rol: 'admin' | 'ganadero' | 'veterinario';
}

export interface IAnimalRepository {
  getAllAnimals(): Promise<Animal[]>;
  getAnimalById(id: number): Promise<Animal>;
  getWeightHistory(animalId: number): Promise<WeightRecord[]>;
}

export interface IAuthRepository {
  login(correo: string, password: string): Promise<User>;
}
