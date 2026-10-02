# 👑 Aura Clicker

Un juego incremental (idle/clicker) desarrollado con React y Vite. El objetivo principal es acumular "Aura" mediante clics manuales y generación pasiva, gestionar una economía dividida (saldo gastable vs. experiencia total) y ascender a través de un sistema de 16 rangos de dificultad exponencial.

## 🚀 Características Principales

- **Economía Dual:** Separación matemática entre el saldo actual (para compras) y el Aura Total acumulada (para progreso de rango), evitando que el jugador retroceda de nivel al comprar mejoras.
- **Sistema de Progresión (16 Rangos):** Desde *Noob* hasta *GODLIKE*. La dificultad escala multiplicándose por 100 en cada nivel.
- **Sistema de Descubrimiento:** Glosario interactivo que guarda en memoria el máximo nivel histórico alcanzado por el jugador, revelando los nombres ocultos ("???") gradualmente.
- **Tienda de Mejoras Escalables:**
    - 👆 *Click Power:* Aumenta el Aura base por clic.
    - ⏱️ *Auto Click:* Generación de Aura pasiva por segundo.
    - 💪 *Aura Multiplier:* Multiplicador global porcentual.
    - 🎯 *Crit Chance:* Probabilidad (hasta 45%) de asestar un golpe crítico.
    - 💥 *Golpe de Chad:* Multiplicador de daño crítico sin límite de nivel.
- **Rebirth & Prestigio (Endgame):** Sistema de *soft-reset*. Al estancarse en ciertos rangos, el jugador debe hacer *Rebirth* (reinicia stats, otorga +10% de bono global y desbloquea más niveles). Al llegar al nivel máximo, el *Prestigio* reinicia todo el progreso a cambio de un multiplicador masivo del +100%.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18
- **Build Tool:** Vite
- **Estilos:** CSS3 puro (Flexbox, animaciones, diseño responsive adaptado a layouts flotantes)
- **Gestión de Estado:** React Hooks (`useState`, `useEffect`)

## ⚙️ Instalación y Uso

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/lperval2903/AuraClicker2.0](https://github.com/lperval2903/AuraClicker2.0.git)