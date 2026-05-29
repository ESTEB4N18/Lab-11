<template>
  <div class="weight-chart-container">
    <!-- Botones de filtro de fecha -->
    <div class="chart-filters">
      <button
        v-for="filter in filters"
        :key="filter.value"
        :class="['filter-btn', { active: activeFilter === filter.value }]"
        @click="setFilter(filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Gráfico -->
    <div class="chart-wrapper">
      <Line
        v-if="filteredData.length > 0"
        :data="chartData"
        :options="chartOptions"
      />
      <div v-else class="chart-empty">
        <ion-icon :icon="analyticsOutline" class="empty-icon"></ion-icon>
        <p>No hay datos para este periodo</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { analyticsOutline } from 'ionicons/icons';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from 'chart.js';

import type { WeightRecord } from '@/services';

// ── Registrar componentes de Chart.js ──
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ── Propiedades (Props) ──
const props = defineProps<{
  weightData: WeightRecord[];
}>();

// ── Lógica de filtrado ──
type FilterValue = 'all' | '3m' | '6m' | '12m';

const filters: { label: string; value: FilterValue }[] = [
  { label: 'Todo', value: 'all' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '12M', value: '12m' },
];

const activeFilter = ref<FilterValue>('all');

function setFilter(value: FilterValue) {
  activeFilter.value = value;
}

const filteredData = computed<WeightRecord[]>(() => {
  if (activeFilter.value === 'all') return props.weightData;

  const months = parseInt(activeFilter.value);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  return props.weightData.filter((r) => new Date(r.fecha) >= cutoff);
});

// ── Datos del gráfico ──
const chartData = computed<ChartData<'line'>>(() => {
  const labels = filteredData.value.map((r) => {
    const d = new Date(r.fecha);
    return d.toLocaleDateString('es-CR', { month: 'short', year: '2-digit' });
  });

  return {
    labels,
    datasets: [
      {
        label: 'Peso (kg)',
        data: filteredData.value.map((r) => r.peso),
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.12)',
        pointBackgroundColor: '#2E7D32',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  };
});

// ── Opciones del gráfico ──
const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1200,
    easing: 'easeOutQuart',
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1B5E20',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: (ctx: any) => `${ctx.parsed.y} kg`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: '#666',
        font: { size: 11 },
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.06)',
      },
      ticks: {
        color: '#666',
        font: { size: 11 },
        callback: (value: any) => `${value} kg`,
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
}));
</script>

<style scoped>
.weight-chart-container {
  width: 100%;
}

.chart-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: 2px solid #e0e0e0;
  background: #fff;
  color: #666;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.filter-btn:hover {
  border-color: #2E7D32;
  color: #2E7D32;
}

.filter-btn.active {
  background: #2E7D32;
  border-color: #2E7D32;
  color: #fff;
}

.chart-wrapper {
  position: relative;
  height: 260px;
  width: 100%;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 8px;
  color: #ccc;
}
</style>
