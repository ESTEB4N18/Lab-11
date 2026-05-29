<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="header-toolbar">
        <ion-title>
          <div class="brand">
            <span class="logo-icon">🐄</span>
            <span class="app-logo">BovWeight CR</span>
            <span class="badge-ganadero">GANADERO</span>
          </div>
        </ion-title>
        <ion-buttons slot="end">
          <div class="user-profile">
            <div class="avatar ganadero">G</div>
            <div class="user-info">
              <span class="name">Pedro Ganadero</span>
              <span class="role">Finca "El Rosario"</span>
            </div>
          </div>
          <ion-button @click="logout" class="logout-btn">
            <ion-icon :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="dashboard-content">
      <div class="dashboard-layout">
        <!-- Sidebar -->
        <aside class="sidebar desktop-only">
          <nav class="nav-menu">
            <a href="#" class="nav-item active">
              <ion-icon :icon="gridOutline"></ion-icon>
              <span>Mi Finca</span>
            </a>
            <a href="#" class="nav-item">
              <ion-icon :icon="pawOutline"></ion-icon>
              <span>Mis Animales</span>
            </a>
            <a href="#" class="nav-item ai-highlight">
              <ion-icon :icon="cameraOutline"></ion-icon>
              <span>Estimar Peso IA</span>
            </a>
            <a href="#" class="nav-item">
              <ion-icon :icon="barChartOutline"></ion-icon>
              <span>Reportes</span>
            </a>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Resumen de Finca</h1>
              <p class="page-subtitle">Monitorea la salud y el peso de tu rebaño</p>
            </div>
            <ion-button class="ai-primary-btn">
              <ion-icon :icon="cameraOutline" slot="start"></ion-icon>
              NUEVO PESAJE IA
            </ion-button>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon-wrapper green">
                <ion-icon :icon="pawOutline"></ion-icon>
              </div>
              <div class="stat-details">
                <span class="stat-value">{{ animals.length || 0 }}</span>
                <span class="stat-label">Total Animales</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper orange">
                <ion-icon :icon="scaleOutline"></ion-icon>
              </div>
              <div class="stat-details">
                <span class="stat-value">420 <small>kg</small></span>
                <span class="stat-label">Peso Promedio</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper blue">
                <ion-icon :icon="cameraOutline"></ion-icon>
              </div>
              <div class="stat-details">
                <span class="stat-value">12</span>
                <span class="stat-label">Pesajes Hoy</span>
              </div>
            </div>
          </div>

          <div class="content-grid">
            <!-- Animals List -->
            <div class="panel-card animals-panel">
              <div class="panel-header">
                <h3>Mi Rebaño</h3>
                <ion-button fill="clear" size="small">Ver todos</ion-button>
              </div>
              
              <div class="panel-body no-padding">
                <div v-if="loading" class="loading-state">
                  <ion-spinner name="crescent"></ion-spinner>
                  <p>Cargando rebaño...</p>
                </div>
                
                <div v-else-if="error" class="error-state">
                  <ion-icon :icon="cloudOfflineOutline"></ion-icon>
                  <p>{{ error }}</p>
                  <ion-button @click="load" size="small" color="success">Reintentar</ion-button>
                </div>

                <div v-else class="animal-list">
                  <router-link
                    v-for="a in animals"
                    :key="a.id"
                    :to="`/animal/${a.id}`"
                    class="animal-row"
                  >
                    <div class="animal-avatar">
                      <ion-icon :icon="pawOutline"></ion-icon>
                    </div>
                    <div class="animal-info">
                      <h4 class="animal-name">{{ a.nombre }}</h4>
                      <span class="animal-tag">Arete: #{{ a.arete || 'N/A' }} | {{ a.raza }}</span>
                    </div>
                    <div class="animal-weight">
                      <span class="weight-val">{{ a.pesoActual }} kg</span>
                      <ion-icon :icon="chevronForwardOutline" class="go-icon"></ion-icon>
                    </div>
                  </router-link>
                </div>
              </div>
            </div>

            <!-- AI Promotion / Chart -->
            <div class="panel-card chart-panel">
              <div class="panel-header">
                <h3>Evolución de Peso (Promedio)</h3>
              </div>
              <div class="panel-body">
                <LineChart :data="chartData" :options="chartOptions" class="chart-container" />
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- Mobile Floating Action Button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mobile-only">
        <ion-fab-button class="ai-fab">
          <ion-icon :icon="cameraOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, 
  IonIcon, IonButtons, IonSpinner, IonFab, IonFabButton
} from '@ionic/vue';
import { 
  cloudOfflineOutline, pawOutline, chevronForwardOutline, logOutOutline,
  gridOutline, cameraOutline, barChartOutline, scaleOutline
} from 'ionicons/icons';

import { animalRepository, type Animal } from '@/services';

// Chart.js imports
import { Line as LineChart } from 'vue-chartjs';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const animals = ref<Animal[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const router = useRouter();

const logout = () => {
  router.push('/login');
};

async function load() {
  loading.value = true;
  error.value = null;
  try {
    animals.value = await animalRepository.getAllAnimals();
  } catch (err: any) {
    error.value = err.message || 'Error al cargar animales';
  } finally {
    loading.value = false;
  }
}

onMounted(load);

// Chart Data Dummy
const chartData = ref({
  labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
  datasets: [
    {
      label: 'Peso Promedio (kg)',
      backgroundColor: 'rgba(46, 125, 50, 0.1)',
      borderColor: '#2E7D32',
      borderWidth: 2,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#2E7D32',
      pointRadius: 4,
      fill: true,
      data: [380, 395, 410, 420],
      tension: 0.4
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: false, grid: { color: '#f0f0f0' } },
    x: { grid: { display: false } }
  }
});
</script>

<style scoped>
/* ====== VARIABLES GLOBALES ====== */
.dashboard-content {
  --background: #f4f1ea; /* Warm Beige */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* ====== HEADER ====== */
.header-toolbar {
  --background: rgba(255, 255, 255, 0.85);
  --min-height: 70px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 0 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon { font-size: 26px; filter: drop-shadow(0 2px 4px rgba(85, 107, 47, 0.2)); }
.app-logo { font-weight: 800; color: #2c3e2d; letter-spacing: -0.5px; font-size: 20px; }
.badge-ganadero { background: linear-gradient(135deg, #556b2f, #3e4f24); color: white; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 8px; letter-spacing: 0.5px; box-shadow: 0 4px 6px -1px rgba(85, 107, 47, 0.3); }

.user-profile { display: flex; align-items: center; gap: 12px; margin-right: 12px; }
.avatar.ganadero { background: #556b2f; color: white; border-radius: 12px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.user-info { display: flex; flex-direction: column; text-align: left; }
.user-info .name { font-size: 14px; font-weight: 700; color: #2c3e2d; }
.user-info .role { font-size: 12px; color: #5c6e58; font-weight: 500; }
.logout-btn { --color: #5c6e58; }

/* ====== LAYOUT ====== */
.dashboard-layout { display: flex; min-height: 100%; }
.sidebar { width: 260px; background: #FFFFFF; border-right: 1px solid #e2dcd0; padding: 24px 16px; }
.nav-menu { display: flex; flex-direction: column; gap: 8px; }
.nav-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 14px; text-decoration: none; color: #5c6e58; font-weight: 600; transition: all 0.2s ease; }
.nav-item:hover { background: #f4f1ea; color: #2c3e2d; }
.nav-item.active { background: #eaf0e6; color: #3e4f24; }
.nav-item.ai-highlight { background: #fdfbf7; color: #556b2f; margin-top: 16px; border: 1px dashed #c0c5b1; }
.nav-item ion-icon { font-size: 22px; }

/* MAIN CONTENT */
.main-content { flex: 1; padding: 32px; overflow-y: auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
.page-title { font-size: 32px; font-weight: 800; color: #2c3e2d; margin: 0 0 6px; letter-spacing: -1px; }
.page-subtitle { font-size: 15px; color: #5c6e58; margin: 0; font-weight: 500; }

.ai-primary-btn {
  --background: linear-gradient(135deg, #556b2f, #3e4f24);
  --border-radius: 14px;
  --box-shadow: 0 10px 20px -10px rgba(85, 107, 47, 0.6);
  font-weight: 700;
  letter-spacing: 0.5px;
  height: 48px;
}

/* ====== STATS GRID ====== */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }
.stat-card { background: #FFFFFF; border-radius: 20px; padding: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.02); display: flex; align-items: center; gap: 16px; transition: transform 0.2s; }
.stat-card:active { transform: scale(0.98); }
.stat-icon-wrapper { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
.stat-icon-wrapper.green { background: #eaf0e6; color: #556b2f; }
.stat-icon-wrapper.orange { background: #fff7ed; color: #d97706; }
.stat-icon-wrapper.blue { background: #f0f4f8; color: #475569; }

.stat-details { display: flex; flex-direction: column; }
.stat-value { font-size: 26px; font-weight: 800; color: #2c3e2d; line-height: 1.2; }
.stat-value small { font-size: 14px; color: #5c6e58; font-weight: 600; }
.stat-label { font-size: 13px; color: #5c6e58; font-weight: 600; margin-top: 4px; }

/* ====== PANELS GRID ====== */
.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.panel-card { background: #FFFFFF; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.02); display: flex; flex-direction: column; overflow: hidden; }
.panel-header { padding: 24px; border-bottom: 1px solid #f4f1ea; display: flex; justify-content: space-between; align-items: center; }
.panel-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #2c3e2d; }
.panel-body { padding: 24px; flex: 1; }
.panel-body.no-padding { padding: 0; }
.chart-container { height: 260px; width: 100%; }

/* ====== ANIMAL LIST ====== */
.animal-list { display: flex; flex-direction: column; }
.animal-row { display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid #f4f1ea; text-decoration: none; color: inherit; transition: background 0.2s; }
.animal-row:hover { background: #fdfbf7; }
.animal-row:last-child { border-bottom: none; }
.animal-avatar { width: 44px; height: 44px; border-radius: 14px; background: #f4f1ea; color: #5c6e58; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; margin-right: 16px; }
.animal-info { flex: 1; }
.animal-name { margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #2c3e2d; }
.animal-tag { font-size: 13px; color: #5c6e58; font-weight: 500; }
.animal-weight { display: flex; align-items: center; gap: 12px; }
.weight-val { font-weight: 800; color: #3e4f24; font-size: 16px; background: #eaf0e6; padding: 4px 10px; border-radius: 8px; }
.go-icon { color: #c0c5b1; font-size: 20px; }

/* LOADING & ERROR */
.loading-state, .error-state { padding: 40px; text-align: center; color: #5c6e58; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.error-state ion-icon { font-size: 48px; color: #b71c1c; }

/* ====== RESPONSIVE ====== */
.mobile-only { display: none; }
.ai-fab { --background: linear-gradient(135deg, #556b2f, #3e4f24); --box-shadow: 0 10px 20px -10px rgba(85, 107, 47, 0.6); }

@media (max-width: 992px) {
  .content-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .desktop-only { display: none; }
  .mobile-only { display: block; }
  .main-content { padding: 16px; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
  .ai-primary-btn { display: none; } /* Show FAB instead */
  .user-info { display: none; }
  .page-title { font-size: 26px; }
  .stats-grid { gap: 16px; margin-bottom: 24px; }
  .content-grid { gap: 16px; }
}
</style>
