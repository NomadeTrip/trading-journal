# Ideas de Diseño — Trading Journal Pro

## Opción A: Dark Terminal Pro
<response>
<text>
**Design Movement:** Neo-terminal / Bloomberg Terminal inspirado
**Core Principles:**
- Fondo oscuro profundo (#0D0F14) con acentos en verde lima y cian eléctrico
- Tipografía monoespaciada para datos numéricos, sans-serif para UI
- Densidad de información alta, sin decoración superflua
- Bordes finos y líneas de separación como estructura visual

**Color Philosophy:** Negro profundo evoca seriedad financiera; verde lima (#00FF88) para ganancias, rojo coral (#FF4D6D) para pérdidas, cian (#00D4FF) para datos neutros. Inspirado en terminales Bloomberg y TradingView.

**Layout Paradigm:** Sidebar izquierdo fijo con navegación vertical, contenido principal en grid asimétrico. Datos en columnas densas tipo tabla financiera.

**Signature Elements:**
- Líneas de grid sutiles en el fondo (como papel milimetrado oscuro)
- Badges con bordes de color para TP/SL/BE
- Números con font monoespaciada y animación de conteo

**Interaction Philosophy:** Hover states con glow sutil, transiciones rápidas (150ms), feedback inmediato en cada input

**Animation:** Números cuentan hacia arriba/abajo al actualizarse. Líneas de gráfico se dibujan progresivamente.

**Typography System:** JetBrains Mono para números/datos, Inter para UI general
</text>
<probability>0.08</probability>
</response>

## Opción B: Clean Slate Pro (ELEGIDA)
<response>
<text>
**Design Movement:** Swiss International Style meets Financial Dashboard
**Core Principles:**
- Fondo blanco roto (#F8F9FB) con sidebar oscuro (#111827) — contraste dramático
- Tipografía geométrica precisa, jerarquía estricta
- Espaciado generoso, cada elemento respira
- Color como semántica pura: verde/rojo/gris solo para resultados de trades

**Color Philosophy:** El blanco limpio transmite claridad y confianza. El sidebar oscuro ancla la navegación. Los colores de acento (esmeralda, rojo, ámbar) son exclusivamente funcionales — comunican rendimiento sin decoración.

**Layout Paradigm:** Sidebar izquierdo oscuro fijo (64px colapsado / 240px expandido), área de contenido blanca con grid de cards. Asimetría intencional entre navegación oscura y contenido claro.

**Signature Elements:**
- Cards con sombra sutil y borde izquierdo de color (accent bar)
- Calendario tipo grid con celdas de color sólido
- Gráficos minimalistas con área rellena suave

**Interaction Philosophy:** Micro-animaciones en hover, modales con backdrop blur, inputs con focus ring de color primario

**Animation:** Fade-in escalonado de cards al cargar, transición suave entre secciones, números con spring animation

**Typography System:** Space Grotesk para headings (geométrico, moderno), DM Sans para body (legible, neutro)
</text>
<probability>0.09</probability>
</response>

## Opción C: Midnight Gradient
<response>
<text>
**Design Movement:** Glassmorphism Dark Finance
**Core Principles:**
- Fondo degradado profundo (azul marino a negro)
- Cards con efecto glass (backdrop-blur + transparencia)
- Acentos en violeta y dorado para premium feel
- Gráficos con gradientes de área

**Color Philosophy:** Azul profundo evoca mercados nocturnos y análisis serio. El dorado connota valor y rendimiento. El violeta añade modernidad sin ser genérico.

**Layout Paradigm:** Layout centrado con max-width, cards flotantes con glass effect, navegación superior sticky

**Signature Elements:**
- Glass cards con border rgba
- Gradientes de texto en títulos principales
- Partículas o noise texture en el fondo

**Interaction Philosophy:** Glow effects en hover, animaciones de escala suaves

**Animation:** Blur transitions entre páginas, cards con lift effect en hover

**Typography System:** Sora para display, Nunito para body
</text>
<probability>0.07</probability>
</response>

---

## DECISIÓN FINAL: Opción B — Clean Slate Pro

Filosofía: Swiss International Style meets Financial Dashboard. Sidebar oscuro + contenido blanco, tipografía Space Grotesk + DM Sans, colores semánticos puros para resultados de trading.
