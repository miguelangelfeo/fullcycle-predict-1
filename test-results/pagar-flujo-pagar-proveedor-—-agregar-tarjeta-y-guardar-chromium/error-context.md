# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pagar.spec.ts >> flujo pagar proveedor — agregar tarjeta y guardar
- Location: tests\e2e\pagar.spec.ts:3:1

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.fill: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByPlaceholder('NOMBRE APELLIDO')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e4]:
        - img [ref=e6]
        - generic [ref=e13]:
          - paragraph [ref=e14]: FullCycle
          - paragraph [ref=e15]: Solutions
        - button "EN" [ref=e16]
      - navigation [ref=e17]:
        - link "Dashboard" [ref=e19] [cursor=pointer]:
          - /url: /dashboard
          - generic [ref=e21]:
            - img [ref=e22]
            - text: Dashboard
        - link "Producción" [ref=e25] [cursor=pointer]:
          - /url: /produccion
          - generic [ref=e26]:
            - img [ref=e27]
            - text: Producción
        - link "Compras" [ref=e30] [cursor=pointer]:
          - /url: /compras
          - generic [ref=e31]:
            - img [ref=e32]
            - text: Compras
        - link "Sostenibilidad" [ref=e37] [cursor=pointer]:
          - /url: /sostenibilidad
          - generic [ref=e38]:
            - img [ref=e39]
            - text: Sostenibilidad
      - generic [ref=e42]:
        - generic [ref=e43]:
          - paragraph [ref=e44]: Miguel Ángel Feo
          - paragraph [ref=e45]: gerente
        - button "Cerrar sesión" [ref=e46]:
          - img [ref=e47]
          - text: Cerrar sesión
    - main [ref=e50]:
      - generic [ref=e51]:
        - generic [ref=e52]:
          - generic [ref=e53]:
            - heading "Dashboard Analítico" [level=1] [ref=e54]
            - generic [ref=e55]:
              - paragraph [ref=e56]: Consumo, desperdicio y ahorro en tiempo real
              - generic [ref=e57]:
                - img [ref=e58]
                - text: Datos de ejemplo
          - generic [ref=e62]:
            - button "Diario" [ref=e63]
            - button "Semanal" [ref=e64]
            - button "Mensual" [ref=e65]
        - generic [ref=e66]:
          - generic [ref=e68]:
            - generic [ref=e69]:
              - paragraph [ref=e71]: Consumo total
              - paragraph [ref=e72]: 4,630 kg
              - paragraph [ref=e73]: ↑ 3.2% vs sem anterior
            - img [ref=e75]
          - generic [ref=e78]:
            - generic [ref=e79]:
              - paragraph [ref=e81]: Desperdicio
              - paragraph [ref=e82]: 539 kg
              - paragraph [ref=e83]: 11.6% del total
              - paragraph [ref=e84]: ↓ 8.5% reducción
            - img [ref=e86]
          - generic [ref=e90]:
            - generic [ref=e91]:
              - paragraph [ref=e93]: Ahorro proyectado
              - paragraph [ref=e94]: $4,800
              - paragraph [ref=e95]: Esta semana
              - paragraph [ref=e96]: ↑ 17% vs mes anterior
            - img [ref=e98]
          - generic [ref=e101]:
            - generic [ref=e102]:
              - paragraph [ref=e104]: Comida rescatada
              - paragraph [ref=e105]: 1,240 kg
              - paragraph [ref=e106]: Acumulado del mes
            - img [ref=e108]
        - generic [ref=e111]:
          - generic [ref=e112]:
            - heading "Consumo vs Desperdicio por Turno (kg)" [level=3] [ref=e113]
            - generic [ref=e115]:
              - list [ref=e117]:
                - listitem [ref=e118]:
                  - img "Consumo legend icon" [ref=e119]
                  - text: Consumo
                - listitem [ref=e121]:
                  - img "Desperdicio legend icon" [ref=e122]
                  - text: Desperdicio
                - listitem [ref=e124]:
                  - img "Meta legend icon" [ref=e125]
                  - text: Meta
              - application [ref=e127]:
                - generic [ref=e212]:
                  - generic [ref=e213]:
                    - generic [ref=e215]: Lun
                    - generic [ref=e217]: Mar
                    - generic [ref=e219]: Mié
                    - generic [ref=e221]: Jue
                    - generic [ref=e223]: Vie
                    - generic [ref=e225]: Sáb
                    - generic [ref=e227]: Dom
                  - generic [ref=e228]: Periodo
                  - generic [ref=e229]:
                    - generic [ref=e231]: "0"
                    - generic [ref=e233]: "400"
                    - generic [ref=e235]: "800"
                    - generic [ref=e237]: "1200"
                    - generic [ref=e239]: "1600"
                  - generic [ref=e240]: Cantidad (kg)
                  - generic [ref=e241]:
                    - generic [ref=e242]: "1100"
                    - generic [ref=e243]: "1020"
                    - generic [ref=e244]: "1330"
                    - generic [ref=e245]: "1270"
                    - generic [ref=e246]: "1450"
                    - generic [ref=e247]: "1600"
                    - generic [ref=e248]: "1500"
                  - generic [ref=e249]:
                    - generic [ref=e250]: "155"
                    - generic [ref=e251]: "130"
                    - generic [ref=e252]: "150"
                    - generic [ref=e253]: "126"
                    - generic [ref=e254]: "160"
                    - generic [ref=e255]: "190"
                    - generic [ref=e256]: "175"
                  - generic [ref=e257]:
                    - generic [ref=e258]: "110"
                    - generic [ref=e259]: "102"
                    - generic [ref=e260]: "133"
                    - generic [ref=e261]: "127"
                    - generic [ref=e262]: "145"
                    - generic [ref=e263]: "160"
                    - generic [ref=e264]: "150"
          - generic [ref=e265]:
            - heading "Proyección de Ahorro Mensual" [level=3] [ref=e266]
            - generic [ref=e268]:
              - list [ref=e270]:
                - listitem [ref=e271]:
                  - img "Ahorro ($) legend icon" [ref=e272]
                  - text: Ahorro ($)
                - listitem [ref=e274]:
                  - img "Desperdicio (kg) legend icon" [ref=e275]
                  - text: Desperdicio (kg)
              - application [ref=e277]:
                - generic [ref=e316]:
                  - generic [ref=e317]:
                    - generic [ref=e319]: Lun
                    - generic [ref=e321]: Mar
                    - generic [ref=e323]: Mié
                    - generic [ref=e325]: Jue
                    - generic [ref=e327]: Vie
                    - generic [ref=e329]: Sáb
                    - generic [ref=e331]: Dom
                  - generic [ref=e332]: Tiempo
                  - generic [ref=e333]:
                    - generic [ref=e335]: "0"
                    - generic [ref=e337]: "250"
                    - generic [ref=e339]: "500"
                    - generic [ref=e341]: "750"
                    - generic [ref=e343]: "1000"
                  - generic [ref=e344]: Ahorro ($)
                  - generic [ref=e345]:
                    - generic [ref=e347]: "0"
                    - generic [ref=e349]: "50"
                    - generic [ref=e351]: "100"
                    - generic [ref=e353]: "150"
                    - generic [ref=e355]: "200"
                  - generic [ref=e356]: Desperdicio (kg)
                  - generic [ref=e357]:
                    - generic [ref=e358]: $620
                    - generic [ref=e359]: $580
                    - generic [ref=e360]: $710
                    - generic [ref=e361]: $690
                    - generic [ref=e362]: $820
                    - generic [ref=e363]: $950
                    - generic [ref=e364]: $880
                  - generic [ref=e365]:
                    - generic [ref=e366]: 155 kg
                    - generic [ref=e367]: 130 kg
                    - generic [ref=e368]: 150 kg
                    - generic [ref=e369]: 126 kg
                    - generic [ref=e370]: 160 kg
                    - generic [ref=e371]: 190 kg
                    - generic [ref=e372]: 175 kg
  - generic [ref=e373]: "50"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('flujo pagar proveedor — agregar tarjeta y guardar', async ({ page }) => {
  4  |   test.setTimeout(90000);
  5  |   // Inyectar sesión simulada en localStorage para evitar login interactivo
  6  |   await page.addInitScript(() => {
  7  |     localStorage.setItem('fc_user', JSON.stringify({ email: 'gerente@fullcycle.com', name: 'Miguel Ángel Feo', role: 'gerente' }));
  8  |   });
  9  |   // Ir directamente a Compras
  10 |   await page.goto('/compras');
  11 |   await expect(page.getByText(/Pagos a Proveedores/i)).toBeVisible({ timeout: 10000 });
  12 | 
  13 |   // Click en el primer 'Pagar proveedor' disponible
  14 |   // Hacer click usando DOM directamente para evitar problemas por re-renders
  15 |   await page.evaluate(() => {
  16 |     const btns = Array.from(document.querySelectorAll('button'));
  17 |     const b = btns.find((el) => /Pagar proveedor/i.test(el.textContent || '')) as HTMLButtonElement | undefined;
  18 |     if (b) b.click();
  19 |   });
  20 | 
  21 |   // En el modal, como no hay tarjetas, hacer click en 'Agregar tarjeta'
  22 |   // Click en 'Agregar tarjeta' vía DOM directo
  23 |   await page.evaluate(() => {
  24 |     const btns = Array.from(document.querySelectorAll('button'));
  25 |     const b = btns.find((el) => /Agregar tarjeta|Agregar otra tarjeta/i.test(el.textContent || '')) as HTMLButtonElement | undefined;
  26 |     if (b) b.click();
  27 |   });
  28 | 
  29 |   // Rellenar formulario de tarjeta (datos simulados)
  30 |   await page.getByPlaceholder('1234 5678 9012 3456').fill('4242 4242 4242 4242');
> 31 |   await page.getByPlaceholder('NOMBRE APELLIDO').fill('PRUEBA USUARIO');
     |                                                  ^ Error: locator.fill: Test timeout of 90000ms exceeded.
  32 |   await page.getByPlaceholder('MM/AA').fill('12/30');
  33 |   await page.getByPlaceholder(/•••|••••/).fill('123');
  34 | 
  35 |   // Comprobar si el botón guardar está deshabilitado
  36 |   const guardar = page.getByRole('button', { name: /Guardar tarjeta|Guardar tarjeta/i }).first();
  37 |   // Imprimir estado en la salida del test
  38 |   const disabled = await guardar.isDisabled();
  39 |   console.log('Guardar tarjeta disabled:', disabled);
  40 |   expect(disabled).toBeFalsy();
  41 | 
  42 |   // Intentar guardar
  43 |   await guardar.click();
  44 | 
  45 |   // Esperar que el modal cierre y tarjeta esté guardada en localStorage
  46 |   await page.waitForTimeout(1200);
  47 |   const raw = await page.evaluate(() => localStorage.getItem('fc_tarjetas'));
  48 |   console.log('fc_tarjetas in localStorage:', raw);
  49 |   expect(raw).not.toBeNull();
  50 | });
  51 | 
```