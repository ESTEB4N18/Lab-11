import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

// Usaremos lazy loading para mejorar la escalabilidad y tiempos de carga
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../modules/auth/pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../modules/admin/pages/AdminDashboard.vue'),
    meta: { requiresAuth: true, allowedRoles: ['admin'] }
  },
  {
    path: '/veterinario',
    name: 'VeterinarioDashboard',
    component: () => import('../modules/veterinario/pages/VeterinarioDashboard.vue'),
    meta: { requiresAuth: true, allowedRoles: ['veterinario'] }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../modules/ganado/pages/HomePage.vue'),
    meta: { requiresAuth: true, allowedRoles: ['ganadero', 'admin'] }
  },
  {
    path: '/animal/:id',
    name: 'AnimalDetail',
    component: () => import('../modules/ganado/pages/AnimalDetailPage.vue'),
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
