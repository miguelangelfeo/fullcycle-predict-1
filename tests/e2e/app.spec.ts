import { test, expect } from '@playwright/test';

test.describe('App Frontend', () => {
  test('debería cargar la página principal', async ({ page }) => {
    await page.goto('/');
    
    // 1. Verificar que estamos en la pantalla de login
    await expect(page.getByRole('heading', { name: /Iniciar sesión/i })).toBeVisible();

    // 2. Llenar credenciales (Usuario Gerente)
    await page.getByLabel(/Correo electrónico/i).fill('gerente@fullcycle.com');
    await page.getByLabel(/Contraseña/i).fill('Gerente123!');

    // 3. Hacer clic en Ingresar
    await page.getByRole('button', { name: /Ingresar/i }).click();

    // 4. Verificar que redirigió al dashboard correctamente
    // Buscamos un elemento del dashboard
    await expect(page.getByText('Dashboard Analítico')).toBeVisible({ timeout: 10000 });
    // También verificamos que la URL haya cambiado si es aplicable (aunque en un SPA puede que no cambie la ruta visiblemente, pero el DOM sí)
  });
});
