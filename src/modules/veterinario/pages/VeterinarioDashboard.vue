<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="header-toolbar">
        <ion-title>
          <div class="brand">
            <span class="logo-icon">🐄</span>
            <span class="app-logo">BovWeight CR</span>
            <span class="badge-vet">VETERINARIO</span>
          </div>
        </ion-title>
        <ion-buttons slot="end">
          <div class="user-profile">
            <div class="avatar vet">V</div>
            <div class="user-info">
              <span class="name">Ana Veterinaria</span>
              <span class="role">Lic. 15482</span>
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
              <ion-icon :icon="medkitOutline"></ion-icon>
              <span>Panel Clínico</span>
            </a>
            <a href="#" class="nav-item">
              <ion-icon :icon="pawOutline"></ion-icon>
              <span>Animales Asignados</span>
            </a>
            <a href="#" class="nav-item">
              <ion-icon :icon="calendarOutline"></ion-icon>
              <span>Agenda de Visitas</span>
            </a>
            <a href="#" class="nav-item">
              <ion-icon :icon="documentTextOutline"></ion-icon>
              <span>Reportes Médicos</span>
            </a>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Panel Clínico</h1>
              <p class="page-subtitle">Seguimiento de salud y peso de ganado autorizado</p>
            </div>
            <ion-button class="primary-btn">
              <ion-icon :icon="addOutline" slot="start"></ion-icon>
              Nuevo Registro
            </ion-button>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon-wrapper teal">
                <ion-icon :icon="pawOutline"></ion-icon>
              </div>
              <div class="stat-details">
                <span class="stat-value">34</span>
                <span class="stat-label">Animales en Revisión</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper blue">
                <ion-icon :icon="businessOutline"></ion-icon>
              </div>
              <div class="stat-details">
                <span class="stat-value">3</span>
                <span class="stat-label">Fincas Asignadas</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper orange">
                <ion-icon :icon="alertCircleOutline"></ion-icon>
              </div>
              <div class="stat-details">
                <span class="stat-value">5</span>
                <span class="stat-label">Alertas de Bajo Peso</span>
              </div>
            </div>
          </div>

          <!-- Content Grid -->
          <div class="content-grid">
            <!-- Animals List -->
            <div class="panel-card animals-panel">
              <div class="panel-header">
                <h3>Animales en Seguimiento Prioritario</h3>
              </div>
              
              <div class="panel-body no-padding">
                <div class="animal-list">
                  <div class="animal-row">
                    <div class="animal-avatar warning">
                      <ion-icon :icon="alertOutline"></ion-icon>
                    </div>
                    <div class="animal-info">
                      <h4 class="animal-name">Toro #402 (Brahman)</h4>
                      <span class="animal-tag">Finca "El Rosario" | Último peso: 380 kg</span>
                    </div>
                    <ion-button fill="outline" size="small" color="primary">Ver Caso</ion-button>
                  </div>

                  <div class="animal-row">
                    <div class="animal-avatar normal">
                      <ion-icon :icon="checkmarkOutline"></ion-icon>
                    </div>
                    <div class="animal-info">
                      <h4 class="animal-name">Vaca #105 (Angus)</h4>
                      <span class="animal-tag">Finca "La pradera" | Último peso: 450 kg</span>
                    </div>
                    <ion-button fill="outline" size="small" color="primary">Ver Caso</ion-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Health Chart -->
            <div class="panel-card chart-panel">
              <div class="panel-header">
                <h3>Promedio Índice Corporal (Fincas)</h3>
              </div>
              <div class="panel-body">
                <LineChart :data="chartData" :options="chartOptions" class="chart-container" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, 
  IonIcon, IonButtons
} from '@ionic/vue';
import { 
  logOutOutline, medkitOutline, pawOutline, calendarOutline, 
  documentTextOutline, addOutline, businessOutline, alertCircleOutline,
  alertOutline, checkmarkOutline
} from 'ionicons/icons';

// Chart.js imports
import { Line as LineChart } from 'vue-chartjs';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const router = useRouter();

const logout = () => {
  router.push('/login');
};

// Chart Data Dummy
const chartData = ref({
  labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
  datasets: [
    {
      label: 'Salud Promedio',
      backgroundColor: 'rgba(0, 137, 123, 0.1)',
      borderColor: '#00897B',
      borderWidth: 2,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#00897B',
      pointRadius: 4,
      fill: true,
      data: [85, 88, 86, 92],
      tension: 0.4
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: false, grid: { color: '#f0f0f0' }, min: 50, max: 100 },
    x: { grid: { display: false } }
  }
});
</script>

<style scoped>
/* 
 * ==========================================
 * VARIABLES GLOBALES DEL TEMA (Rústico/Beige)
 * ==========================================
 * Comentario para el equipo:
 * Mantenemos la consistencia visual usando la paleta Beige y Verde, 
 * con tipografía moderna para la lectura clara de datos médicos.
 */
.dashboard-content {
  --background: #f4f1ea; /* Beige cálido */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* ====== HEADER ====== */
.header-toolbar {
  --background: rgba(255, 255, 255, 0.85); /* Efecto Glassmorphism */
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

.logo-icon { 
  font-size: 26px; 
  filter: drop-shadow(0 2px 4px rgba(85, 107, 47, 0.2)); 
}

.app-logo { 
  font-weight: 800; 
  color: #2c3e2d; /* Verde oscuro */
  letter-spacing: -0.5px; 
  font-size: 20px; 
}

.badge-vet { 
  background: linear-gradient(135deg, #c0c5b1, #8ba888); 
  color: #2c3e2d; 
  font-size: 10px; 
  font-weight: 800; 
  padding: 4px 10px; 
  border-radius: 8px; 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); 
}

.user-profile { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  margin-right: 12px; 
}

.avatar.vet { 
  background: #8ba888; 
  color: white; 
  border-radius: 12px; 
  width: 38px; 
  height: 38px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-weight: 700; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
}

.user-info { 
  display: flex; 
  flex-direction: column; 
  text-align: left; 
}

.user-info .name { font-size: 14px; font-weight: 700; color: #2c3e2d; }
.user-info .role { font-size: 12px; color: #5c6e58; font-weight: 500; }
.logout-btn { --color: #5c6e58; }

/* 
 * ==========================================
 * LAYOUT PRINCIPAL (Flexbox)
 * ==========================================
 */
.dashboard-layout { 
  display: flex; 
  height: 100%; /* Forzamos altura total para evitar problemas de scroll en móviles */
}

/* SIDEBAR */
.sidebar { 
  width: 260px; 
  background: #FFFFFF; 
  border-right: 1px solid #e2dcd0; 
  padding: 24px 16px; 
  display: flex; 
  flex-direction: column;
}

.nav-menu { display: flex; flex-direction: column; gap: 8px; }

.nav-item { 
  display: flex; 
  align-items: center; 
  gap: 14px; 
  padding: 14px 16px; 
  border-radius: 14px; 
  text-decoration: none; 
  color: #5c6e58; 
  font-weight: 600; 
  transition: all 0.2s ease; 
}

.nav-item:hover { background: #f4f1ea; color: #2c3e2d; }
.nav-item.active { background: #fdfbf7; color: #8ba888; }
.nav-item ion-icon { font-size: 22px; }

/* MAIN CONTENT */
.main-content { 
  flex: 1; 
  padding: 32px; 
  overflow-y: auto; 
  -webkit-overflow-scrolling: touch; 
}

.page-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-end; 
  margin-bottom: 32px; 
}

.page-title { 
  font-size: 32px; 
  font-weight: 800; 
  color: #2c3e2d; 
  margin: 0 0 6px; 
  letter-spacing: -1px; 
}

.page-subtitle { font-size: 15px; color: #5c6e58; margin: 0; font-weight: 500; }

.primary-btn {
  --background: linear-gradient(135deg, #8ba888, #556b2f);
  --border-radius: 14px;
  --box-shadow: 0 10px 20px -10px rgba(139, 168, 136, 0.6);
  font-weight: 700;
  letter-spacing: 0.5px;
  height: 48px;
}

/* ====== STATS GRID ====== */
.stats-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 20px; 
  margin-bottom: 32px; 
}

.stat-card { 
  background: #FFFFFF; 
  border-radius: 20px; 
  padding: 24px; 
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03); 
  border: 1px solid rgba(0,0,0,0.02); 
  display: flex; 
  align-items: center; 
  gap: 16px; 
  transition: transform 0.2s; 
}

.stat-card:active { transform: scale(0.98); }

.stat-icon-wrapper { 
  width: 56px; 
  height: 56px; 
  border-radius: 16px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 26px; 
  flex-shrink: 0; 
}

/* Colores rústicos adaptados */
.stat-icon-wrapper.teal { background: #fdfbf7; color: #8ba888; }
.stat-icon-wrapper.orange { background: #fff7ed; color: #d97706; }
.stat-icon-wrapper.blue { background: #f0f4f8; color: #475569; }

.stat-details { display: flex; flex-direction: column; }
.stat-value { font-size: 26px; font-weight: 800; color: #2c3e2d; }
.stat-label { font-size: 13px; color: #5c6e58; font-weight: 600; margin-top: 4px; }

/* ====== PANELS GRID ====== */
.content-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 24px; 
}

.panel-card { 
  background: #FFFFFF; 
  border-radius: 24px; 
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03); 
  border: 1px solid rgba(0,0,0,0.02); 
  display: flex; 
  flex-direction: column; 
  overflow: hidden; 
  margin-bottom: 24px; 
}

.panel-header { 
  padding: 24px; 
  border-bottom: 1px solid #f4f1ea; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.panel-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #2c3e2d; }
.panel-body { padding: 24px; flex: 1; }
.panel-body.no-padding { padding: 0; }
.chart-container { height: 260px; width: 100%; }

/* ====== ANIMAL LIST ====== */
.animal-list { display: flex; flex-direction: column; }
.animal-row { 
  display: flex; 
  align-items: center; 
  padding: 16px 24px; 
  border-bottom: 1px solid #f4f1ea; 
  text-decoration: none; 
  color: inherit; 
  transition: background 0.2s; 
}

.animal-row:hover { background: #fdfbf7; }
.animal-row:last-child { border-bottom: none; }

.animal-avatar { 
  width: 44px; 
  height: 44px; 
  border-radius: 14px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 22px; 
  flex-shrink: 0; 
  margin-right: 16px; 
}

.animal-avatar.warning { background: #fff7ed; color: #d97706; }
.animal-avatar.normal { background: #eaf0e6; color: #556b2f; }
.animal-info { flex: 1; }
.animal-name { margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #2c3e2d; }
.animal-tag { font-size: 13px; color: #5c6e58; font-weight: 500; }

/* 
 * ==========================================
 * RESPONSIVE MEDIA QUERIES (Optimización Móvil)
 * ==========================================
 * Comentario para el equipo:
 * Rediseño responsivo para asegurar que en celular los elementos caigan en cascada
 * correctamente y no se sobrepongan.
 */
@media (max-width: 992px) {
  .content-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .desktop-only { display: none; }
  
  .main-content { 
    padding: 16px; 
  }
  
  .page-header { 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 16px; 
    margin-bottom: 24px; 
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .stats-grid {
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .user-info { display: none; }
  
  .panel-card {
    border-radius: 16px;
  }
}
</style>
