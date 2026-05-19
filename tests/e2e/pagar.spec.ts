import { test, expect } from '@playwright/test';

test('flujo pagar proveedor — agregar tarjeta y guardar', async ({ page }) => {
  test.setTimeout(90000);
  // Inyectar sesión simulada en localStorage para evitar login interactivo
  await page.addInitScript(() => {
    localStorage.setItem('fc_user', JSON.stringify({ email: 'gerente@fullcycle.com', name: 'Miguel Ángel Feo', role: 'gerente' }));
  });
  // Ir directamente a Compras
  await page.goto('/compras');
  await expect(page.getByText(/Pagos a Proveedores/i)).toBeVisible({ timeout: 10000 });

  // Click en el primer 'Pagar proveedor' disponible
  // Hacer click usando DOM directamente para evitar problemas por re-renders
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find((el) => /Pagar proveedor/i.test(el.textContent || '')) as HTMLButtonElement | undefined;
    if (b) b.click();
  });

  // En el modal, como no hay tarjetas, hacer click en 'Agregar tarjeta'
  // Click en 'Agregar tarjeta' vía DOM directo
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find((el) => /Agregar tarjeta|Agregar otra tarjeta/i.test(el.textContent || '')) as HTMLButtonElement | undefined;
    if (b) b.click();
  });

  // Rellenar formulario de tarjeta (datos simulados)
  await page.getByPlaceholder('1234 5678 9012 3456').fill('4242 4242 4242 4242');
  await page.getByPlaceholder('NOMBRE APELLIDO').fill('PRUEBA USUARIO');
  await page.getByPlaceholder('MM/AA').fill('12/30');
  await page.getByPlaceholder(/•••|••••/).fill('123');

  // Comprobar si el botón guardar está deshabilitado
  const guardar = page.getByRole('button', { name: /Guardar tarjeta|Guardar tarjeta/i }).first();
  // Imprimir estado en la salida del test
  const disabled = await guardar.isDisabled();
  console.log('Guardar tarjeta disabled:', disabled);
  expect(disabled).toBeFalsy();

  // Intentar guardar
  await guardar.click();

  // Esperar que el modal cierre y tarjeta esté guardada en localStorage
  await page.waitForTimeout(1200);
  const raw = await page.evaluate(() => localStorage.getItem('fc_tarjetas'));
  console.log('fc_tarjetas in localStorage:', raw);
  expect(raw).not.toBeNull();
});
