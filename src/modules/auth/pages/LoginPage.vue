<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-background">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
      </div>
      <div class="login-container">
        <!-- Logo Section -->
        <div class="logo-section slide-down">
          <div class="logo-wrapper">
            <div class="logo-icon">🐄</div>
          </div>
          <h1 class="app-title">BovWeight<span class="highlight">CR</span></h1>
          <p class="app-subtitle">Gestión Inteligente de Ganado</p>
        </div>

        <!-- Form Section -->
        <div class="form-section slide-up">
          <div class="input-wrapper">
            <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
            <input 
              type="email" 
              v-model="usuario" 
              placeholder="Correo electrónico" 
              class="custom-input" 
            />
          </div>

          <div class="input-wrapper">
            <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
            <input 
              type="password" 
              v-model="password" 
              placeholder="Contraseña" 
              class="custom-input" 
              @keyup.enter="login"
            />
          </div>

          <!-- Error Message -->
          <transition name="fade">
            <div v-if="error" class="error-message">
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              <span>{{ error }}</span>
            </div>
          </transition>

          <button @click="login" class="login-btn" :disabled="loading">
            <span v-if="!loading">INICIAR SESIÓN</span>
            <span class="spinner" v-else></span>
          </button>
        </div>
        
        <div class="demo-hints fade-in-delayed">
          <p class="demo-title">Cuentas de Prueba (Toca para usar)</p>
          <div class="demo-accounts">
            <span class="badge" @click="fillDemo('admin@test.com')">Admin</span>
            <span class="badge" @click="fillDemo('ganadero@test.com')">Ganadero</span>
            <span class="badge" @click="fillDemo('vet@test.com')">Vet</span>
          </div>
          <p class="demo-pass">Contraseña: <b>1234</b></p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { personOutline, lockClosedOutline, alertCircleOutline } from 'ionicons/icons';
import { authRepository } from '@/services';

const router = useRouter();
const usuario = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const login = async () => {
  if (!usuario.value || !password.value) {
    error.value = 'Por favor, ingrese sus credenciales.';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const user = await authRepository.login(usuario.value, password.value);
    
    // Redireccionar basado en el rol
    if (user.rol === 'admin') {
      router.push('/admin');
    } else if (user.rol === 'veterinario') {
      router.push('/veterinario');
    } else {
      router.push('/home'); // Ganadero
    }
  } catch (err: any) {
    error.value = err.message || 'Correo o contraseña incorrectos';
  } finally {
    loading.value = false;
  }
};

const fillDemo = (email: string) => {
  usuario.value = email;
  password.value = '1234';
};
</script>

<style scoped>
/* Background and Layout */
.login-content {
  --background: #f4f1ea; /* Warm Beige */
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  background: linear-gradient(135deg, #f4f1ea 0%, #e2dcd0 100%);
}

.shape {
  position: absolute;
  filter: blur(80px);
  border-radius: 50%;
  opacity: 0.6;
  animation: float 10s infinite ease-in-out alternate;
}

.shape-1 {
  top: -10%;
  left: -20%;
  width: 300px;
  height: 300px;
  background: #8ba888; /* Muted Green */
}

.shape-2 {
  bottom: -10%;
  right: -20%;
  width: 250px;
  height: 250px;
  background: #c0c5b1; /* Sage Green */
  animation-delay: -5s;
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 32px 24px;
  position: relative;
  z-index: 1;
}

/* Logo Section */
.logo-section {
  text-align: center;
  margin-bottom: 48px;
  width: 100%;
}

.logo-wrapper {
  width: 96px;
  height: 96px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.logo-icon {
  font-size: 52px;
  line-height: 1;
  filter: drop-shadow(0 4px 6px rgba(85, 107, 47, 0.15));
}

.app-title {
  font-size: 32px;
  font-weight: 800;
  color: #2c3e2d; /* Dark Forest Green */
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.app-title .highlight {
  color: #556b2f; /* Olive Drab */
}

.app-subtitle {
  font-size: 15px;
  color: #5c6e58;
  margin: 0;
  font-weight: 500;
}

/* Form Section */
.form-section {
  width: 100%;
  max-width: 380px;
  background: rgba(255, 255, 255, 0.65);
  padding: 32px 24px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 25px 50px -12px rgba(44, 62, 45, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.input-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.input-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #8ba888;
  font-size: 22px;
  z-index: 2;
  transition: color 0.3s ease;
}

.custom-input {
  width: 100%;
  padding: 18px 18px 18px 52px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(139, 168, 136, 0.3);
  border-radius: 16px;
  color: #2c3e2d;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.custom-input::placeholder {
  color: #95a595;
}

.custom-input:focus {
  border-color: #556b2f;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(85, 107, 47, 0.1);
}

.input-wrapper:focus-within .input-icon {
  color: #556b2f;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #b71c1c;
  font-size: 14px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: rgba(183, 28, 28, 0.1);
  border: 1px solid rgba(183, 28, 28, 0.2);
  border-radius: 12px;
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, #556b2f 0%, #3e4f24 100%);
  color: white;
  border: none;
  border-radius: 16px;
  height: 56px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 10px 20px -10px rgba(85, 107, 47, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn:active {
  transform: translateY(2px);
  box-shadow: 0 5px 10px -5px rgba(85, 107, 47, 0.4);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

/* Demo Hints */
.demo-hints {
  margin-top: 32px;
  text-align: center;
  width: 100%;
  max-width: 380px;
}

.demo-title {
  color: #5c6e58;
  font-size: 13px;
  margin-bottom: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.demo-accounts {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.badge {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(139, 168, 136, 0.4);
  padding: 8px 16px;
  border-radius: 20px;
  color: #3e4f24;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.badge:active {
  background: rgba(85, 107, 47, 0.15);
  border-color: #556b2f;
  transform: scale(0.95);
}

.demo-pass {
  color: #5c6e58;
  font-size: 14px;
  margin: 0;
}

.demo-pass b {
  color: #2c3e2d;
  font-weight: 800;
}

/* Animations */
@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 30px) scale(1.1); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.slide-down {
  animation: slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.fade-in-delayed {
  animation: fadeIn 1s ease 0.4s both;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
