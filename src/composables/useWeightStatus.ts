import { computed, type Ref } from 'vue';
import { arrowUpOutline, arrowDownOutline, removeOutline } from 'ionicons/icons';
import type { Animal, WeightRecord } from '@/services/interfaces';

interface StatusStrategy {
  condition(history: WeightRecord[]): boolean;
  icon: typeof arrowUpOutline;
  message: string;
}

const strategies: StatusStrategy[] = [
  {
    condition: (history) => history.length < 2,
    icon: removeOutline,
    message: 'Sin datos suficientes para evaluar'
  },
  {
    condition: (history) => {
      const change = history[history.length - 1].peso - history[0].peso;
      return change > 25;
    },
    icon: arrowUpOutline,
    message: '🚀 Ganancia acelerada'
  },
  {
    condition: (history) => {
      const change = history[history.length - 1].peso - history[0].peso;
      return change > 15;
    },
    icon: arrowUpOutline,
    message: '📈 Crecimiento estable'
  },
  {
    condition: (history) => {
      const change = history[history.length - 1].peso - history[0].peso;
      return change > 0;
    },
    icon: arrowUpOutline,
    message: '✅ Crecimiento moderado'
  },
  {
    condition: (history) => {
      const change = history[history.length - 1].peso - history[0].peso;
      return change === 0;
    },
    icon: removeOutline,
    message: '➡️ Peso estable'
  },
  {
    condition: (history) => {
      const change = history[history.length - 1].peso - history[0].peso;
      return change < 0;
    },
    icon: arrowDownOutline,
    message: '🔻 Pérdida de peso — revisar'
  }
];

function getBestStrategy(history: WeightRecord[]) {
  return strategies.find((strategy) => strategy.condition(history)) ?? strategies[0];
}

export function useWeightStatus(animal: Ref<Animal | null>) {
  const weightDiff = computed(() => {
    if (!animal.value || animal.value.historialPeso.length < 2) return 0;
    const history = animal.value.historialPeso;
    return history[history.length - 1].peso - history[history.length - 2].peso;
  });

  const diffIcon = computed(() => {
    const history = animal.value?.historialPeso ?? [];
    return getBestStrategy(history).icon;
  });

  const diffText = computed(() => {
    const diff = weightDiff.value;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff} kg`;
  });

  const statusMessage = computed(() => {
    const history = animal.value?.historialPeso ?? [];
    return getBestStrategy(history).message;
  });

  return {
    weightDiff,
    diffIcon,
    diffText,
    statusMessage
  };
}
