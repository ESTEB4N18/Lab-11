import type { Animal, WeightRecord, IAnimalRepository } from './interfaces';

const mockAnimals: Animal[] = [
  {
    id: 1,
    nombre: 'Toro #402',
    raza: 'Brahman',
    edad: '4 años',
    arete: '402',
    imagen: 'assets/cow-placeholder.png',
    pesoActual: 380,
    historialPeso: [
      { fecha: '01/04/2026', peso: 340 },
      { fecha: '15/04/2026', peso: 360 },
      { fecha: '30/04/2026', peso: 380 }
    ]
  }
];

export class MockAnimalRepository implements IAnimalRepository {
  async getAllAnimals(): Promise<Animal[]> {
    return mockAnimals.map((animal) => ({ ...animal, historialPeso: [] }));
  }

  async getAnimalById(id: number): Promise<Animal> {
    const animal = mockAnimals.find((item) => item.id === id);
    if (!animal) {
      throw new Error('Animal de prueba no encontrado');
    }
    return animal;
  }

  async getWeightHistory(animalId: number): Promise<WeightRecord[]> {
    const animal = mockAnimals.find((item) => item.id === animalId);
    return animal?.historialPeso ?? [];
  }
}
