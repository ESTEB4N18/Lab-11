<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="Atrás"></ion-back-button>
        </ion-buttons>
        <ion-title>Detalle del Animal</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="animal-detail-content">
      <!-- ═══ ESTADO CARGANDO ═══ -->
      <div v-if="loading" class="state-container">
        <div class="skeleton-card">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-lines">
            <div class="skeleton-line w60"></div>
            <div class="skeleton-line w40"></div>
            <div class="skeleton-line w80"></div>
          </div>
        </div>
        <div class="skeleton-chart"></div>
      </div>

      <!-- ═══ ESTADO ERROR ═══ -->
      <div v-else-if="error" class="state-container state-center">
        <ion-icon :icon="cloudOfflineOutline" class="state-icon error-icon"></ion-icon>
        <h2>Error al cargar datos</h2>
        <p class="state-message">{{ error }}</p>
        <ion-button expand="block" class="retry-btn" @click="loadAnimal">
          <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
          Reintentar
        </ion-button>
      </div>

      <!-- ═══ ESTADO VACÍO ═══ -->
      <div v-else-if="!animal" class="state-container state-center">
        <ion-icon :icon="pawOutline" class="state-icon empty-icon"></ion-icon>
        <h2>Animal no encontrado</h2>
        <p class="state-message">No se encontraron datos para este animal.</p>
        <ion-button expand="block" routerLink="/home" class="back-btn">
          <ion-icon :icon="homeOutline" slot="start"></ion-icon>
          Volver al inicio
        </ion-button>
      </div>

      <!-- ═══ ESTADO CON DATOS ═══ -->
      <div v-else class="detail-wrapper">
        <!-- Tarjeta principal del animal -->
        <div class="animal-hero-card">
          <div class="hero-image-section">
            <div class="animal-avatar">
              <img
                v-if="animal.imagen"
                :src="animal.imagen"
                :alt="animal.nombre"
              />
              <div v-else class="avatar-placeholder">
                <ion-icon :icon="pawOutline"></ion-icon>
              </div>
            </div>
            <div class="hero-badge">
              <ion-icon :icon="pricetagOutline"></ion-icon>
              {{ animal.arete }}
            </div>
          </div>

          <div class="hero-info">
            <h1 class="animal-name">{{ animal.nombre }}</h1>
            <div class="info-chips">
              <span class="info-chip">
                <ion-icon :icon="colorPaletteOutline"></ion-icon>
                {{ animal.raza }}
              </span>
              <span class="info-chip">
                <ion-icon :icon="calendarOutline"></ion-icon>
                {{ animal.edad }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tarjeta de resúmen de peso -->
        <div class="weight-summary-card">
          <div class="current-weight">
            <span class="weight-label">Peso Actual</span>
            <span class="weight-value">{{ animal.pesoActual }} <small>kg</small></span>
          </div>

          <div class="weight-diff" :class="diffClass">
            <ion-icon :icon="diffIcon"></ion-icon>
            <span class="diff-value">{{ diffText }}</span>
          </div>

          <div class="weight-status">
            <ion-icon :icon="pulseOutline"></ion-icon>
            <span>{{ statusMessage }}</span>
          </div>
        </div>

        <!-- Tarjeta del gráfico de peso -->
        <div class="chart-card">
          <h2 class="section-title">
            <ion-icon :icon="trendingUpOutline"></ion-icon>
            Evolución de Peso
          </h2>
          <WeightChart :weight-data="animal.historialPeso" />
        </div>

        <!-- Botones de acción -->
        <div class="action-buttons">
          <ion-button expand="block" class="action-btn primary-action" size="large">
            <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
            Registrar Nuevo Peso
          </ion-button>
          <ion-button expand="block" class="action-btn secondary-action" fill="outline" size="large">
            <ion-icon :icon="documentTextOutline" slot="start"></ion-icon>
            Ver Historial Completo
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
} from '@ionic/vue';
import {
  cloudOfflineOutline,
  refreshOutline,
  pawOutline,
  homeOutline,
  pricetagOutline,
  colorPaletteOutline,
  calendarOutline,
  arrowUpOutline,
  arrowDownOutline,
  removeOutline,
  pulseOutline,
  trendingUpOutline,
  addCircleOutline,
  documentTextOutline,
} from 'ionicons/icons';

import WeightChart from '@/components/WeightChart.vue';
import { animalRepository, type Animal } from '@/services';
import { useWeightStatus } from '@/composables/useWeightStatus';

// ── Ruta ──
const route = useRoute();

// ── Estado ──
const animal = ref<Animal | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// ── Cargar datos ──
async function loadAnimal() {
  loading.value = true;
  error.value = null;

  try {
    const id = Number(route.params.id) || 1;
    animal.value = await animalRepository.getAnimalById(id);
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los datos del animal';
    animal.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(loadAnimal);

const { weightDiff, diffIcon, diffText, statusMessage } = useWeightStatus(animal);

const diffClass = computed(() => ({
  gain: weightDiff.value > 0,
  loss: weightDiff.value < 0,
  stable: weightDiff.value === 0,
}));
</script>

<style scoped>
.animal-detail-content {
  --background: #f4f7f0;
}

/* ── Contenedores de estado ── */
.state-container {
  padding: 24px 16px;
}

.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.state-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-icon {
  color: #d32f2f;
}

.empty-icon {
  color: #9e9e9e;
}

.state-message {
  color: #757575;
  max-width: 280px;
  margin: 0 auto 24px;
}

/* ── Cargando (Esqueleto) ── */
.skeleton-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 16px;
  animation: shimmer 1.5s ease-in-out infinite alternate;
}

.skeleton-avatar {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: linear-gradient(90deg, #e8e8e8 25%, #f0f0f0 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg, #e8e8e8 25%, #f0f0f0 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-line.w60 { width: 60%; }
.skeleton-line.w40 { width: 40%; }
.skeleton-line.w80 { width: 80%; }

.skeleton-chart {
  height: 200px;
  border-radius: 16px;
  background: linear-gradient(90deg, #e8e8e8 25%, #f0f0f0 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Envoltorio de detalles ── */
.detail-wrapper {
  padding: 16px;
  padding-bottom: 40px;
}

/* ── Tarjeta principal ── */
.animal-hero-card {
  background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
  border-radius: 20px;
  padding: 24px;
  color: #fff;
  margin-top: 24px;
  margin-bottom: 16px;
  box-shadow: 0 8px 32px rgba(46, 125, 50, 0.25);
  position: relative;
  overflow: hidden;
}

.animal-hero-card::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
}

.hero-image-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.animal-avatar {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
}

.animal-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: rgba(255, 255, 255, 0.7);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.animal-name {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 12px;
  letter-spacing: -0.5px;
}

.info-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.info-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

/* ── Resumen de peso ── */
.weight-summary-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.current-weight {
  flex: 1;
  min-width: 120px;
}

.weight-label {
  display: block;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  font-weight: 600;
}

.weight-value {
  font-size: 36px;
  font-weight: 800;
  color: #1B5E20;
  line-height: 1;
}

.weight-value small {
  font-size: 16px;
  font-weight: 600;
  color: #666;
}

.weight-diff {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
}

.weight-diff.gain {
  background: rgba(46, 125, 50, 0.1);
  color: #2E7D32;
}

.weight-diff.loss {
  background: rgba(211, 47, 47, 0.1);
  color: #d32f2f;
}

.weight-diff.stable {
  background: rgba(158, 158, 158, 0.1);
  color: #757575;
}

.weight-diff ion-icon {
  font-size: 18px;
}

.weight-status {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f9faf6;
  border-radius: 12px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.weight-status ion-icon {
  color: #2E7D32;
  font-size: 18px;
}

/* ── Tarjeta de gráfico ── */
.chart-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title ion-icon {
  color: #2E7D32;
}

/* ── Botones de acción ── */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.action-btn {
  --border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.3px;
}

.primary-action {
  --background: #2E7D32;
  --background-hover: #1B5E20;
  --box-shadow: 0 4px 16px rgba(46, 125, 50, 0.3);
}

.secondary-action {
  --border-color: #2E7D32;
  --color: #2E7D32;
}

/* ── Botones de reintentar / volver ── */
.retry-btn,
.back-btn {
  --border-radius: 14px;
  --background: #2E7D32;
  margin-top: 8px;
  width: 100%;
  max-width: 280px;
}
</style>
