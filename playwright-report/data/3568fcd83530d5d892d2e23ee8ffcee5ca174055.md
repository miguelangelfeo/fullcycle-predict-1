# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> App Frontend >> debería cargar la página principal
- Location: tests\e2e\app.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Dashboard Analítico')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Dashboard Analítico')

```

```yaml
- heading "FullCycle Predict" [level=1]
- button "EN"
- heading "Iniciar sesión" [level=2]
- paragraph: Ingresa tus credenciales para acceder al sistema
- text: Correo electrónico
- textbox "Correo electrónico":
  - /placeholder: Correo
- paragraph: El correo es obligatorio
- text: Contraseña
- textbox "Contraseña"
- button
- paragraph: La contraseña es obligatoria
- button "Ingresar"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('App Frontend', () => {
  4  |   test('debería cargar la página principal', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     
  7  |     // 1. Verificar que estamos en la pantalla de login
  8  |     await expect(page.getByRole('heading', { name: /Iniciar sesión/i })).toBeVisible();
  9  | 
  10 |     // 2. Llenar credenciales (Usuario Gerente)
  11 |     await page.getByLabel(/Correo electrónico/i).fill('gerente@fullcycle.com');
  12 |     await page.getByLabel(/Contraseña/i).fill('Gerente123!');
  13 | 
  14 |     // 3. Hacer clic en Ingresar
  15 |     await page.getByRole('button', { name: /Ingresar/i }).click();
  16 | 
  17 |     // 4. Verificar que redirigió al dashboard correctamente
  18 |     // Buscamos un elemento del dashboard
> 19 |     await expect(page.getByText('Dashboard Analítico')).toBeVisible({ timeout: 10000 });
     |                                                         ^ Error: expect(locator).toBeVisible() failed
  20 |     // También verificamos que la URL haya cambiado si es aplicable (aunque en un SPA puede que no cambie la ruta visiblemente, pero el DOM sí)
  21 |   });
  22 | });
  23 | 
```