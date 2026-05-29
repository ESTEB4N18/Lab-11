<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="header-toolbar">
        <ion-title>
          <div class="brand">
            <span class="logo-icon">🐄</span>
            <span class="app-logo">BovWeight CR</span>
            <span class="badge-admin">ADMIN</span>
          </div>
        </ion-title>
        <ion-buttons slot="end">
          <div class="user-profile">
            <div class="avatar">A</div>
            <div class="user-info">
              <span class="name">Administrador</span>
              <span class="role">admin@test.com</span>
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
        <!-- Sidebar (Visible solo en desktop) -->
        <aside class="sidebar desktop-only">
          <nav class="nav-menu">
            <a href="#" class="nav-item" :class="{ active: activeTab === 'panel' }" @click.prevent="activeTab = 'panel'">
              <ion-icon :icon="pieChartOutline"></ion-icon>
              <span>Panel Principal</span>
            </a>
            <a href="#" class="nav-item" :class="{ active: activeTab === 'usuarios' }" @click.prevent="activeTab = 'usuarios'">
              <ion-icon :icon="peopleOutline"></ion-icon>
              <span>Gestión de Usuarios</span>
            </a>
            <a href="#" class="nav-item" :class="{ active: activeTab === 'roles' }" @click.prevent="activeTab = 'roles'">
              <ion-icon :icon="shieldCheckmarkOutline"></ion-icon>
              <span>Roles y Permisos</span>
            </a>
            <a href="#" class="nav-item" :class="{ active: activeTab === 'logs' }" @click.prevent="activeTab = 'logs'">
              <ion-icon :icon="listOutline"></ion-icon>
              <span>Logs del Sistema</span>
            </a>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
          <!-- NAVEGACIÓN MÓVIL (Segment) -->
          <div class="mobile-nav mobile-only">
            <ion-segment :value="activeTab" @ionChange="e => activeTab = e.detail.value as string">
              <ion-segment-button value="panel">
                <ion-label>Finca</ion-label>
              </ion-segment-button>
              <ion-segment-button value="usuarios">
                <ion-label>Personal</ion-label>
              </ion-segment-button>
              <ion-segment-button value="roles">
                <ion-label>Accesos</ion-label>
              </ion-segment-button>
            </ion-segment>
          </div>

          <!-- HEADER DE PAGINA GENERAL -->
          <div class="page-header">
            <div v-if="activeTab === 'panel'">
              <h1 class="page-title">Resumen de Ganadería</h1>
              <p class="page-subtitle">Indicadores principales de tu finca</p>
            </div>
            <div v-if="activeTab === 'usuarios'">
              <h1 class="page-title">Personal de la Finca</h1>
              <p class="page-subtitle">Administra a los trabajadores de tu ganadería</p>
            </div>
            <div v-if="activeTab === 'roles'">
              <h1 class="page-title">Control de Accesos</h1>
              <p class="page-subtitle">Permisos y estado del personal</p>
            </div>
            
            <ion-button v-if="activeTab === 'usuarios'" class="primary-btn" @click="mostrarModal = true">
              <ion-icon :icon="addOutline" slot="start"></ion-icon>
              Nuevo Usuario
            </ion-button>
          </div>

          <!-- PESTAÑA: PANEL PRINCIPAL -->
          <div v-if="activeTab === 'panel'">

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon-wrapper blue">
                <ion-icon :icon="peopleOutline"></ion-icon>
              </div>
              <div class="stat-details">
                <span class="stat-value">{{ stats.personalActivo }}</span>
                <span class="stat-label">Personal Activo</span>
              </div>
              <div class="stat-trend positive">
                <ion-icon :icon="trendingUpOutline"></ion-icon>
                <span>+1</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper green">
                <ion-icon :icon="leafOutline"></ion-icon>
              </div>
              <div class="stat-details">
                <span class="stat-value">{{ stats.bovinos }}</span>
                <span class="stat-label">Bovinos Registrados</span>
              </div>
              <div class="stat-trend positive">
                <ion-icon :icon="trendingUpOutline"></ion-icon>
                <span>+12</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper teal">
                <ion-icon :icon="medkitOutline"></ion-icon>
              </div>
              <div class="stat-details">
                <span class="stat-value">{{ stats.alertas }}</span>
                <span class="stat-label">Alertas Médicas</span>
              </div>
              <div class="stat-trend neutral">
                <ion-icon :icon="removeOutline"></ion-icon>
                <span>0</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper orange">
                <ion-icon :icon="pulseOutline"></ion-icon>
              </div>
              <div class="stat-details">
                <span class="stat-value">{{ stats.pesajes }}</span>
                <span class="stat-label">Pesajes este Mes</span>
              </div>
              <div class="stat-trend positive">
                <ion-icon :icon="trendingUpOutline"></ion-icon>
                <span>+24%</span>
              </div>
            </div>
          </div>

          <!-- Charts & Tables Grid -->
          <div class="content-grid">
            <!-- Chart Section -->
            <div class="panel-card chart-panel">
              <div class="panel-header">
                <h3>Pesajes y Nacimientos</h3>
                <ion-button fill="clear" size="small">Ver reporte</ion-button>
              </div>
              <div class="panel-body">
                <LineChart :data="chartData" :options="chartOptions" class="chart-container" />
              </div>
            </div>

            <!-- Recent Activity Table -->
            <div class="panel-card">
              <div class="panel-header">
                <h3>Logs Recientes del Sistema</h3>
              </div>
              <div class="panel-body no-padding">
                <div class="table-responsive">
                  <table class="saas-table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Acción</th>
                        <th>Resultado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td data-label="Usuario"><div class="cell-user"><div class="mini-avatar">G</div> ganadero@test.com</div></td>
                        <td data-label="Acción">Estimación de peso IA (#4512)</td>
                        <td data-label="Resultado"><span class="status-badge success">Éxito</span></td>
                        <td data-label="Fecha">Hace 5 min</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          </div> <!-- FIN PANEL PRINCIPAL -->

          <!-- PESTAÑA: GESTIÓN DE USUARIOS -->
          <div v-if="activeTab === 'usuarios'" class="panel-card">
            <div class="panel-header">
              <h3>Listado del Personal</h3>
              <ion-button fill="clear" size="small" @click="cargarUsuarios">Actualizar</ion-button>
            </div>
            <div class="panel-body no-padding">
              <div class="table-responsive">
                <table class="saas-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th class="hide-on-mobile">Correo</th>
                      <th>Rol Asignado</th>
                      <th class="hide-on-mobile">Estado</th>
                      <th class="hide-on-mobile">Registro</th>
                      <th class="hide-on-mobile">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in usuariosList" :key="user.id" @click="abrirDetalles(user)" class="clickable-row">
                      <td data-label="Nombre">
                        <div class="cell-user">
                          <div class="mini-avatar">{{ user.nombre_completo ? user.nombre_completo.charAt(0).toUpperCase() : 'U' }}</div>
                          <div class="user-main-info">
                            <span class="user-name">{{ user.nombre_completo }}</span>
                            <span class="user-role mobile-only">{{ user.rol_nombre || 'Desconocido' }}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Correo" class="hide-on-mobile">{{ user.correo }}</td>
                      <td data-label="Rol Asignado">
                        <span class="role-badge" :class="user.rol_nombre">{{ user.rol_nombre || 'Desconocido' }}</span>
                      </td>
                      <td data-label="Estado" class="hide-on-mobile">
                        <span class="status-badge" :class="user.activo ? 'success' : 'error'">{{ user.activo ? 'activo' : 'inactivo' }}</span>
                      </td>
                      <td data-label="Registro" class="hide-on-mobile">{{ user.creado_en }}</td>
                      <td data-label="Acciones" class="hide-on-mobile">
                        <ion-button fill="clear" size="small" color="danger" @click.stop="eliminarUsuario(user.id)">
                          <ion-icon :icon="trashOutline"></ion-icon>
                        </ion-button>
                      </td>
                    </tr>
                    <tr v-if="usuariosList.length === 0">
                      <td colspan="6" style="text-align: center; padding: 24px;">No hay usuarios registrados o cargando...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- PESTAÑA: ROLES Y PERMISOS -->
          <div v-if="activeTab === 'roles'" class="panel-card">
             <div class="panel-header">
              <h3>Bloqueos de Personal</h3>
              <ion-button fill="clear" size="small" @click="cargarUsuarios">Actualizar</ion-button>
            </div>
            <div class="panel-body no-padding">
              <div class="table-responsive">
                <table class="saas-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Rol en el Sistema</th>
                      <th class="hide-on-mobile">Estado de Acceso</th>
                      <th class="hide-on-mobile">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in usuariosList" :key="'rol-'+user.id" @click="abrirDetalles(user)" class="clickable-row">
                      <td data-label="Usuario">
                        <div class="cell-user">
                          <div class="mini-avatar">{{ user.nombre_completo ? user.nombre_completo.charAt(0).toUpperCase() : 'U' }}</div>
                          <div class="user-main-info">
                            <span class="user-name">{{ user.nombre_completo }}</span>
                            <small class="user-email desktop-only" style="color: #888;">{{ user.correo }}</small>
                            <span class="user-role mobile-only">{{ user.rol_nombre || 'Desconocido' }}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Rol en el Sistema"><span class="role-badge" :class="user.rol_nombre">{{ user.rol_nombre }}</span></td>
                      <td data-label="Estado de Acceso" class="hide-on-mobile">
                        <span class="status-badge" :class="user.activo ? 'success' : 'error'">
                          {{ user.activo ? 'Permitido' : 'Bloqueado' }}
                        </span>
                      </td>
                      <td data-label="Acción" class="hide-on-mobile">
                        <ion-button v-if="user.activo" fill="clear" size="small" color="warning" @click.stop="cambiarEstadoUsuario(user.id, false)">
                          Bloquear Acceso
                        </ion-button>
                        <ion-button v-else fill="clear" size="small" color="success" @click.stop="cambiarEstadoUsuario(user.id, true)">
                          Reactivar Acceso
                        </ion-button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>
      </div>

      <!-- MODAL CREAR USUARIO -->
      <ion-modal :is-open="mostrarModal" @didDismiss="mostrarModal = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Registrar Nuevo Usuario</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="mostrarModal = false">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="form-container">
            <ion-item>
              <ion-label position="stacked">Nombre Completo</ion-label>
              <ion-input v-model="nuevoUsuario.nombre_completo" placeholder="Ej. Juan Pérez"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Correo Electrónico</ion-label>
              <ion-input v-model="nuevoUsuario.correo" type="email" placeholder="ejemplo@test.com"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Contraseña Inicial</ion-label>
              <ion-input v-model="nuevoUsuario.contrasena" type="password" placeholder="Mínimo 6 caracteres"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Rol en el Sistema</ion-label>
              <ion-select v-model="nuevoUsuario.rol_id" placeholder="Selecciona un rol">
                <ion-select-option v-for="rol in rolesList" :key="rol.id" :value="rol.id">{{ rol.nombre.toUpperCase() }}</ion-select-option>
              </ion-select>
            </ion-item>
            <div class="form-actions">
              <ion-button expand="block" class="primary-btn" @click="guardarUsuario" :disabled="guardando">
                {{ guardando ? 'Guardando...' : 'Crear Acceso' }}
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>

      <!-- MODAL DETALLES DE USUARIO (BOTTOM SHEET) -->
      <ion-modal :is-open="mostrarModalDetalles" @didDismiss="mostrarModalDetalles = false" :initial-breakpoint="0.5" :breakpoints="[0, 0.5, 0.8]" class="bottom-sheet-modal">
        <ion-content class="ion-padding">
          <div v-if="usuarioSeleccionado" class="details-container">
            <div class="details-header">
              <div class="avatar-large">{{ usuarioSeleccionado.nombre_completo ? usuarioSeleccionado.nombre_completo.charAt(0).toUpperCase() : 'U' }}</div>
              <h2>{{ usuarioSeleccionado.nombre_completo }}</h2>
              <span class="role-badge" :class="usuarioSeleccionado.rol_nombre">{{ usuarioSeleccionado.rol_nombre || 'Desconocido' }}</span>
            </div>
            
            <div class="details-body">
              <div class="detail-item">
                <ion-icon :icon="mailOutline"></ion-icon>
                <div class="detail-text">
                  <small>Correo</small>
                  <p>{{ usuarioSeleccionado.correo }}</p>
                </div>
              </div>
              <div class="detail-item">
                <ion-icon :icon="shieldCheckmarkOutline"></ion-icon>
                <div class="detail-text">
                  <small>Estado</small>
                  <p>
                    <span class="status-badge" :class="usuarioSeleccionado.activo ? 'success' : 'error'">
                      {{ usuarioSeleccionado.activo ? 'Activo / Permitido' : 'Inactivo / Bloqueado' }}
                    </span>
                  </p>
                </div>
              </div>
              <div class="detail-item">
                <ion-icon :icon="calendarOutline"></ion-icon>
                <div class="detail-text">
                  <small>Fecha de Registro</small>
                  <p>{{ usuarioSeleccionado.creado_en || 'No disponible' }}</p>
                </div>
              </div>
            </div>

            <div class="details-actions">
              <ion-button v-if="usuarioSeleccionado.activo" expand="block" color="warning" @click="cambiarEstadoUsuario(usuarioSeleccionado.id, false); mostrarModalDetalles = false">
                Bloquear Acceso
              </ion-button>
              <ion-button v-else expand="block" color="success" @click="cambiarEstadoUsuario(usuarioSeleccionado.id, true); mostrarModalDetalles = false">
                Reactivar Acceso
              </ion-button>
              
              <ion-button expand="block" color="danger" fill="outline" style="margin-top: 12px;" @click="eliminarUsuario(usuarioSeleccionado.id); mostrarModalDetalles = false">
                Eliminar Permanentemente
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons,
  IonModal, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonSegment, IonSegmentButton
} from '@ionic/vue';
import { 
  logOutOutline, shieldCheckmarkOutline, peopleOutline, settingsOutline, 
  pieChartOutline, listOutline, addOutline, trendingUpOutline, trashOutline,
  leafOutline, medkitOutline, pulseOutline, removeOutline, mailOutline, calendarOutline
} from 'ionicons/icons';

import { adminService, type UsuarioInfo, type Rol } from '../services/admin.service';

// Chart.js imports
import { Line as LineChart } from 'vue-chartjs';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const router = useRouter();
const activeTab = ref('usuarios'); // Empezamos en usuarios para probar la funcionalidad
const mostrarModal = ref(false);
const guardando = ref(false);

const usuarioSeleccionado = ref<UsuarioInfo | null>(null);
const mostrarModalDetalles = ref(false);

const abrirDetalles = (user: UsuarioInfo) => {
  usuarioSeleccionado.value = user;
  mostrarModalDetalles.value = true;
};

const usuariosList = ref<UsuarioInfo[]>([]);
const rolesList = ref<Rol[]>([]);

const nuevoUsuario = ref({
  nombre_completo: '',
  correo: '',
  contrasena: '',
  rol_id: null as number | null
});

const logout = () => {
  router.push('/login');
};

const cargarUsuarios = async () => {
  try {
    console.log('🔍 DEBUG - Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🔍 DEBUG - Cargando usuarios...');
    usuariosList.value = await adminService.getUsuarios();
    console.log('✅ DEBUG - Usuarios cargados:', usuariosList.value.length, usuariosList.value);
  } catch (error: any) {
    console.error("❌ DEBUG - Error cargando usuarios:", error?.message, error);
    alert(`❌ Error cargando usuarios:\n\n${error?.message}\n\nURL Supabase: ${import.meta.env.VITE_SUPABASE_URL}`);
  }
};

const cargarRoles = async () => {
  try {
    rolesList.value = await adminService.getRoles();
  } catch (error) {
    console.error("No se pudieron cargar los roles.");
  }
};

const guardarUsuario = async () => {
  // Validaciones del formulario
  if (!nuevoUsuario.value.nombre_completo || nuevoUsuario.value.nombre_completo.trim().length === 0) {
    alert('Por favor ingresa el nombre completo.');
    return;
  }
  if (!nuevoUsuario.value.correo || !nuevoUsuario.value.correo.includes('@')) {
    alert('Por favor ingresa un correo electrónico válido.');
    return;
  }
  if (!nuevoUsuario.value.contrasena || nuevoUsuario.value.contrasena.length < 4) {
    alert('La contraseña debe tener al menos 4 caracteres.');
    return;
  }
  if (!nuevoUsuario.value.rol_id) {
    alert('Por favor selecciona un rol para el usuario.');
    return;
  }

  guardando.value = true;
  try {
    await adminService.crearUsuario({
      nombre_completo: nuevoUsuario.value.nombre_completo,
      correo: nuevoUsuario.value.correo,
      contrasena: nuevoUsuario.value.contrasena,
      rol_id: nuevoUsuario.value.rol_id
    });
    alert('✅ Usuario creado exitosamente.');
    mostrarModal.value = false;
    nuevoUsuario.value = { nombre_completo: '', correo: '', contrasena: '', rol_id: null };
    await cargarUsuarios();
  } catch (error: any) {
    const mensaje = error?.message || 'Error desconocido al crear el usuario.';
    alert(`❌ Error al crear usuario:\n\n${mensaje}`);
    console.error('Error completo:', error);
  } finally {
    guardando.value = false;
  }
};

const eliminarUsuario = async (id: number) => {
  if (confirm('¿Estás seguro de eliminar permanentemente este acceso?')) {
    await adminService.eliminarUsuario(id);
    await cargarUsuarios();
  }
};

const cambiarEstadoUsuario = async (id: number, nuevoEstado: boolean) => {
  const accion = nuevoEstado ? 'reactivar' : 'bloquear';
  if (confirm(`¿Estás seguro de ${accion} a este usuario?`)) {
    await adminService.toggleEstadoUsuario(id, nuevoEstado);
    await cargarUsuarios();
  }
};

onMounted(() => {
  cargarUsuarios();
  cargarRoles();
  cargarDatosReales();
});

const stats = ref({
  personalActivo: 0,
  bovinos: 0,
  pesajes: 0,
  alertas: 0
});

const cargarDatosReales = async () => {
  try {
    const [nuevosStats, grafica] = await Promise.all([
      adminService.getDashboardStats(),
      adminService.getChartData()
    ]);
    
    stats.value = nuevosStats;
    
    // Forzamos actualización de la gráfica reasignando el objeto completo
    chartData.value = {
      ...chartData.value,
      labels: grafica.labels,
      datasets: [
        { ...chartData.value.datasets[0], data: grafica.pesajes },
        { ...chartData.value.datasets[1], data: grafica.nacimientos }
      ]
    };
  } catch (error) {
    console.error("Error al cargar datos reales:", error);
  }
};

// Configuración de gráfica
const chartData = ref({
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Pesajes Exitosos',
      backgroundColor: 'rgba(46, 125, 50, 0.1)',
      borderColor: '#2E7D32',
      borderWidth: 2,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#2E7D32',
      pointBorderWidth: 2,
      pointRadius: 4,
      fill: true,
      data: [0, 0, 0, 0, 0, 0],
      tension: 0.4
    },
    {
      label: 'Nacimientos',
      backgroundColor: 'rgba(13, 71, 161, 0.1)',
      borderColor: '#0D47A1',
      borderWidth: 2,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#0D47A1',
      pointBorderWidth: 2,
      pointRadius: 4,
      fill: true,
      data: [0, 0, 0, 0, 0, 0],
      tension: 0.4
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        font: { family: "'Inter', sans-serif", size: 12 }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#f0f0f0', drawBorder: false }
    },
    x: {
      grid: { display: false, drawBorder: false }
    }
  }
});
</script>

<style scoped>
/* 
 * ==========================================
 * VARIABLES GLOBALES DEL TEMA (Rústico/Beige)
 * ==========================================
 * Comentario para el equipo:
 * Se utilizan variables CSS para mantener la consistencia del tema 
 * en toda la aplicación. Elegimos una paleta basada en tonos cálidos
 * (beige) y acentos en verde natural para alinearnos a la temática ganadera.
 */
.dashboard-content {
  --background: #f4f1ea; /* Fondo beige cálido principal */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* ====== HEADER ====== */
.header-toolbar {
  --background: rgba(255, 255, 255, 0.85); /* Fondo semitransparente */
  --min-height: 70px;
  /* Efecto Glassmorphism para darle un aspecto premium moderno */
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
  color: #2c3e2d; /* Verde bosque oscuro */
  letter-spacing: -0.5px;
  font-size: 20px;
}

.badge-admin {
  background: linear-gradient(135deg, #2c3e2d, #1a241a);
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 6px -1px rgba(44, 62, 45, 0.3);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 12px;
}

.avatar {
  width: 38px;
  height: 38px;
  background: #2c3e2d; /* Color consistente con el rol */
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.user-info .name {
  font-size: 14px;
  font-weight: 700;
  color: #2c3e2d;
}

.user-info .role {
  font-size: 12px;
  color: #5c6e58;
  font-weight: 500;
}

.logout-btn {
  --color: #5c6e58;
}

/* 
 * ==========================================
 * LAYOUT PRINCIPAL (Flexbox)
 * ==========================================
 * Comentario para el equipo:
 * Se usa flexbox para distribuir el menú lateral (sidebar)
 * y el contenido principal. En móviles, el sidebar desaparece
 * y el main-content ocupa todo el 100% de la pantalla.
 */
.dashboard-layout {
  display: flex;
  height: 100%; /* Corregido: asegurar que ocupe todo el alto disponible en Ionic */
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

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

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

.nav-item:hover {
  background: #f4f1ea;
  color: #2c3e2d;
}

.nav-item.active {
  background: #eaf0e6;
  color: #3e4f24;
}

.nav-item ion-icon {
  font-size: 22px;
}

/* MAIN CONTENT */
.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* Permite scroll fluido en iOS */
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

.page-subtitle {
  font-size: 15px;
  color: #5c6e58;
  margin: 0;
  font-weight: 500;
}

.primary-btn {
  --background: linear-gradient(135deg, #556b2f, #3e4f24);
  --border-radius: 14px;
  --box-shadow: 0 10px 20px -10px rgba(85, 107, 47, 0.6);
  font-weight: 700;
  letter-spacing: 0.5px;
  height: 48px;
}

/* 
 * ==========================================
 * GRID DE ESTADÍSTICAS Y TARJETAS
 * ==========================================
 * Comentario para el equipo:
 * Se utiliza CSS Grid para hacer que las tarjetas se ajusten
 * automáticamente al ancho de la pantalla (responsive).
 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.02);
  position: relative;
  transition: transform 0.2s ease;
}

.stat-card:active {
  transform: scale(0.98);
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 16px;
}

/* Colores de íconos adaptados al tema natural */
.stat-icon-wrapper.blue { background: #f0f4f8; color: #475569; }
.stat-icon-wrapper.green { background: #eaf0e6; color: #556b2f; }
.stat-icon-wrapper.teal { background: #fdfbf7; color: #6b8e23; }
.stat-icon-wrapper.orange { background: #fff7ed; color: #d97706; }

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #2c3e2d;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #5c6e58;
  font-weight: 600;
  margin-top: 4px;
}

.stat-trend {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 20px;
}

.stat-trend.positive { background: #eaf0e6; color: #3e4f24; }
.stat-trend.neutral { background: #f4f1ea; color: #5c6e58; }
.stat-trend.negative { background: #fce8e8; color: #b71c1c; }

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
  margin-bottom: 24px; /* Margen inferior para móviles */
}

.panel-header {
  padding: 24px;
  border-bottom: 1px solid #f4f1ea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #2c3e2d;
}

.panel-body {
  padding: 24px;
  flex: 1;
}

.panel-body.no-padding {
  padding: 0;
}

.chart-container {
  height: 260px;
  width: 100%;
}

/* 
 * ==========================================
 * TABLAS DE DATOS
 * ==========================================
 * Comentario para el equipo:
 * En .table-responsive aplicamos un overflow-x para que en pantallas 
 * pequeñas la tabla no rompa el diseño y permita hacer scroll horizontal.
 */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}

.saas-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 600px; /* Asegura que no se aplaste el contenido */
}

.saas-table th {
  padding: 16px 24px;
  font-size: 12px;
  text-transform: uppercase;
  color: #5c6e58;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: #fdfbf7;
  border-bottom: 1px solid #f4f1ea;
}

.saas-table td {
  padding: 16px 24px;
  font-size: 14px;
  color: #2c3e2d;
  border-bottom: 1px solid #f4f1ea;
  vertical-align: middle;
}

.saas-table tbody tr:last-child td {
  border-bottom: none;
}

.saas-table tbody tr:hover {
  background: #fdfbf7;
}

.cell-user {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #2c3e2d;
}

.user-main-info {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.user-name {
  font-size: 15px;
  font-weight: 700;
  color: #2c3e2d;
}

.user-role {
  font-size: 12px;
  font-weight: 700;
  color: #8ba888;
  text-transform: uppercase;
  margin-top: 2px;
}

.mini-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #f4f1ea;
  color: #3e4f24;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.success { background: #eaf0e6; color: #3e4f24; }
.status-badge.error { background: #fce8e8; color: #b71c1c; }

.role-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  background: #f4f1ea;
  color: #5c6e58;
}

.role-badge.admin { background: #f0f4f8; color: #334155; }
.role-badge.ganadero { background: #eaf0e6; color: #556b2f; }
.role-badge.veterinario { background: #fdfbf7; color: #6b8e23; }

.form-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-actions {
  margin-top: 24px;
}

.clickable-row {
  cursor: pointer;
  transition: background 0.2s;
}
.clickable-row:active {
  background: #f4f1ea;
}

/* Modal Bottom Sheet Styles */
.details-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px 0;
}
.details-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}
.avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: #f4f1ea;
  color: #3e4f24;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
}
.details-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #2c3e2d;
}
.details-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fdfbf7;
  border-radius: 16px;
  padding: 16px;
}
.detail-item {
  display: flex;
  align-items: center;
  gap: 16px;
}
.detail-item ion-icon {
  font-size: 24px;
  color: #5c6e58;
}
.detail-text {
  display: flex;
  flex-direction: column;
}
.detail-text small {
  font-size: 12px;
  color: #8ba888;
  font-weight: 700;
  text-transform: uppercase;
}
.detail-text p {
  margin: 4px 0 0;
  font-size: 15px;
  color: #2c3e2d;
  font-weight: 600;
}

/* 
 * ==========================================
 * RESPONSIVE MEDIA QUERIES (Optimización Móvil)
 * ==========================================
 * Comentario para el equipo:
 * Esta sección es crítica para que la aplicación se vea bien en celulares.
 * Cambiamos los paddings, ocultamos elementos innecesarios y convertimos 
 * las grillas de 2 columnas en 1 sola columna.
 */
@media (max-width: 992px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  
  .mobile-only {
    display: block !important;
  }
  
  .mobile-nav {
    margin-bottom: 24px;
    background: #FFFFFF;
    padding: 4px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  }
  
  /* Ajuste visual para IonSegment en tema beige/verde */
  ion-segment {
    --background: transparent;
  }
  ion-segment-button {
    --indicator-color: #f4f1ea;
    --color: #5c6e58;
    --color-checked: #2c3e2d;
    font-weight: 700;
  }
  
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
  
  .user-info {
    display: none; /* Ocultar el correo en móvil para salvar espacio */
  }

  /* Ajustes en tarjetas para que no se peguen a los bordes */
  .panel-card {
    border-radius: 16px;
  }

  /* 
   * Comentario para el equipo:
   * Transformamos las tablas estándar en un diseño de "tarjetas" (cards)
   * apiladas para móviles. Esto evita el scroll horizontal y hace que
   * la información sea fácil de leer en pantallas pequeñas.
   */
  .saas-table, .saas-table tbody, .saas-table tr, .saas-table td {
    display: block;
    width: 100%;
  }

  .saas-table thead {
    display: none; /* Ocultamos el encabezado original */
  }

  .saas-table tr {
    margin-bottom: 16px;
    border: 1px solid #e2dcd0;
    border-radius: 12px;
    padding: 12px;
    background: #FFFFFF;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }

  .saas-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f4f1ea;
    padding: 12px 8px;
    text-align: right;
  }
  
  .saas-table td:last-child {
    border-bottom: none;
  }

  /* 
   * Simplificamos la lista para usabilidad de adultos mayores:
   * Solo mostramos el nombre y rol, ocultando etiquetas complicadas 
   * y añadiendo un ícono de flecha (chevron) para indicar interacción.
   */
  .table-responsive {
    overflow-x: hidden;
  }
  
  .saas-table {
    min-width: 0; /* Removemos el min-width que causaba scroll */
  }

  .saas-table td:not(:first-child), .saas-table th:not(:first-child) {
    display: none !important; /* Ocultar todo menos la primera celda */
  }

  .saas-table td:first-child {
    padding: 16px;
    border-bottom: none;
  }

  .saas-table td::before {
    display: none; /* Quitamos las etiquetas */
  }

  .saas-table tr {
    padding: 0;
    position: relative;
  }

  .saas-table tr::after {
    content: '›';
    font-size: 32px;
    color: #8ba888;
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .cell-user {
    justify-content: flex-start;
    text-align: left;
  }
  
  .cell-user .mini-avatar {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .hide-on-mobile {
    display: none !important;
  }
}
</style>
