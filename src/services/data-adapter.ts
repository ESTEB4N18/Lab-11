import type { Animal, WeightRecord } from './interfaces';

const placeholderImage = 'assets/cow-placeholder.png';

function calculateAge(fechaNacimiento?: string): string {
  if (!fechaNacimiento) return 'N/A';
  const birth = new Date(fechaNacimiento);
  const age = new Date().getFullYear() - birth.getFullYear();
  return `${age} años`;
}

function normalizeWeightValue(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  return 0;
}

export function adaptWeightHistory(rows: any[] = []): WeightRecord[] {
  return (rows || []).map((row: any) => ({
    fecha: new Date(row.creado_en).toLocaleDateString('es-CR'),
    peso: normalizeWeightValue(row.peso_corregido_kg || row.peso_estimado_kg)
  }));
}

export function adaptAnimalRecord(raw: any, history: any[] = []): Animal {
  const historialPeso = adaptWeightHistory(history);
  const latestWeight = historialPeso.length > 0 ? historialPeso[historialPeso.length - 1].peso : 0;

  return {
    id: raw.id,
    nombre: raw.nombre || 'Sin nombre',
    raza: raw.razas?.nombre || raw.raza || 'Desconocida',
    edad: calculateAge(raw.fecha_nacimiento),
    arete: raw.numero_arete || raw.arete || 'N/A',
    imagen: raw.imagen || placeholderImage,
    pesoActual: latestWeight,
    historialPeso
  };
}
