# Sistema de diseño — DaniPak

---

## Colores de marca (derivados del logo)

| Rol   | Token                           | OKLCH                  | HEX aprox. | Uso                                                 |
| ------| ------------------------------- | ---------------------- | ---------- | --------------------------------------------------- |
| Azul  | `--brand-blue` / `--primary`    | `oklch(0.56 0.14 244)` | `#2b7fd0`  | Acción, movimiento/envío, links, estado *emitido*   |
| Rojo  | `--brand-red` / `--destructive` | `oklch(0.55 0.21 27)`  | `#d5342a`  | Anular, eliminar, saldos vencidos, alertas          |
| Negro | `--sidebar`                     | `oklch(0.2 0.006 260)` | `#1c1e24`  | Estructura, sidebar, texto principal                |

---

## Paleta base (modo claro)

| Token                    | OKLCH                     | HEX aprox. | Uso                            |
| ------------------------ | ------------------------- | ---------- | ------------------------------ |
| `--background`           | `oklch(0.985 0.001 240)`  | `#fbfbfc`  | Fondo general                  |
| `--foreground`           | `oklch(0.205 0.005 260)`  | `#2c2e33`  | Texto principal                |
| `--card`                 | `oklch(1 0 0)`            | `#ffffff`  | Tarjetas, tablas               |
| `--card-foreground`      | `oklch(0.205 0.005 260)`  | `#2c2e33`  | Texto en tarjetas              |
| `--popover`              | `oklch(1 0 0)`            | `#ffffff`  | Menús, dropdowns               |
| `--primary`              | `oklch(0.56 0.14 244)`    | `#2b7fd0`  | Botón principal, foco          |
| `--primary-foreground`   | `oklch(0.99 0 0)`         | `#fdfdfd`  | Texto sobre azul               |
| `--secondary`            | `oklch(0.96 0.003 240)`   | `#f2f3f5`  | Botón secundario, fondos suaves|
| `--secondary-foreground` | `oklch(0.28 0.005 260)`   | `#3f4147`  | Texto sobre secundario         |
| `--muted`                | `oklch(0.96 0.003 240)`   | `#f2f3f5`  | Fondos apagados                |
| `--muted-foreground`     | `oklch(0.53 0.01 260)`    | `#767980`  | Texto secundario, labels       |
| `--accent`               | `oklch(0.94 0.02 244)`    | `#e6eefa`  | Hover azulado, resaltados      |
| `--accent-foreground`    | `oklch(0.35 0.08 244)`    | `#2d5486`  | Texto sobre accent             |
| `--destructive`          | `oklch(0.55 0.21 27)`     | `#d5342a`  | Anular / eliminar              |
| `--border`               | `oklch(0.9 0.004 250)`    | `#e0e1e4`  | Bordes, divisores              |
| `--input`                | `oklch(0.9 0.004 250)`    | `#e0e1e4`  | Bordes de inputs               |
| `--ring`                 | `oklch(0.56 0.14 244)`    | `#2b7fd0`  | Anillo de foco                 |

---

## Sidebar (negro de marca)

| Token                          | OKLCH                    | HEX aprox. |
| ------------------------------ | ------------------------ | ---------- |
| `--sidebar`                    | `oklch(0.2 0.006 260)`   | `#1c1e24`  |
| `--sidebar-foreground`         | `oklch(0.85 0.005 260)`  | `#d2d3d7`  |
| `--sidebar-primary`            | `oklch(0.56 0.14 244)`   | `#2b7fd0`  |
| `--sidebar-primary-foreground` | `oklch(0.99 0 0)`        | `#fdfdfd`  |
| `--sidebar-accent`             | `oklch(0.27 0.008 260)`  | `#3a3d44`  |
| `--sidebar-accent-foreground`  | `oklch(0.98 0 0)`        | `#fafafa`  |
| `--sidebar-border`             | `oklch(0.3 0.008 260)`   | `#42454c`  |

---

## Gráficos

| Token       | OKLCH                   | HEX aprox. | Nota           |
| ----------- | ----------------------- | ---------- | -------------- |
| `--chart-1` | `oklch(0.56 0.14 244)`  | `#2b7fd0`  | Azul de marca  |
| `--chart-2` | `oklch(0.55 0.21 27)`   | `#d5342a`  | Rojo de marca  |
| `--chart-3` | `oklch(0.68 0.11 244)`  | `#6ba3dd`  | Azul claro     |
| `--chart-4` | `oklch(0.75 0.14 85)`   | `#c9a227`  | Ámbar          |
| `--chart-5` | `oklch(0.55 0.1 160)`   | `#2e9e78`  | Verde          |

---

## Tipografía

| Uso                   | Fuente                | Clase Tailwind | Variable CSS     | Pesos          |
| --------------------- | --------------------- | -------------- | ---------------- | -------------- |
| Cuerpo, tablas, datos | **Inter**             | `font-sans`    | `--font-inter`   | regular (400)  |
| Títulos y encabezados | **Plus Jakarta Sans** | `font-display` | `--font-jakarta` | 600, 700, 800  |

```css
--font-sans:    var(--font-inter), ui-sans-serif, system-ui, sans-serif;
--font-display: var(--font-jakarta), var(--font-inter), sans-serif;
```

- **Line-height cuerpo:** `leading-relaxed` (1.6)
- **Números en tablas:** Inter con `tabular-nums` para alinear montos.

Import en Next.js (`app/layout.tsx`):

```ts
import { Inter, Plus_Jakarta_Sans } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
})
```

---

## Otros tokens

| Token         | Valor                        | Nota                        |
| ------------- | ---------------------------- | --------------------------- |
| `--radius`    | `0.5rem` (8px)               | Base de redondeo            |
| `--radius-sm` | `calc(radius * 0.6)` ≈ 4.8px |                             |
| `--radius-md` | `calc(radius * 0.8)` ≈ 6.4px |                             |
| `--radius-lg` | `0.5rem`                     |                             |
| `color-scheme`| `light` (forzado)            | App siempre en modo claro   |

---

## Bloque CSS completo

```css
:root {
  color-scheme: light;
  --background: oklch(0.985 0.001 240);
  --foreground: oklch(0.205 0.005 260);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.205 0.005 260);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.205 0.005 260);
  --primary: oklch(0.56 0.14 244);
  --primary-foreground: oklch(0.99 0 0);
  --secondary: oklch(0.96 0.003 240);
  --secondary-foreground: oklch(0.28 0.005 260);
  --muted: oklch(0.96 0.003 240);
  --muted-foreground: oklch(0.53 0.01 260);
  --accent: oklch(0.94 0.02 244);
  --accent-foreground: oklch(0.35 0.08 244);
  --destructive: oklch(0.55 0.21 27);
  --border: oklch(0.9 0.004 250);
  --input: oklch(0.9 0.004 250);
  --ring: oklch(0.56 0.14 244);
  --brand-red: oklch(0.55 0.21 27);
  --brand-blue: oklch(0.56 0.14 244);
  --chart-1: oklch(0.56 0.14 244);
  --chart-2: oklch(0.55 0.21 27);
  --chart-3: oklch(0.68 0.11 244);
  --chart-4: oklch(0.75 0.14 85);
  --chart-5: oklch(0.55 0.1 160);
  --radius: 0.5rem;
  --sidebar: oklch(0.2 0.006 260);
  --sidebar-foreground: oklch(0.85 0.005 260);
  --sidebar-primary: oklch(0.56 0.14 244);
  --sidebar-primary-foreground: oklch(0.99 0 0);
  --sidebar-accent: oklch(0.27 0.008 260);
  --sidebar-accent-foreground: oklch(0.98 0 0);
  --sidebar-border: oklch(0.3 0.008 260);
  --sidebar-ring: oklch(0.56 0.14 244);
}
```
