// Mock data for FullCycle Solutions prototype

export const consumoVsDesperdicio = [
  { turno: "Lun Des", consumo: 320, desperdicio: 48, meta: 32 },
  { turno: "Lun Alm", consumo: 580, desperdicio: 72, meta: 58 },
  { turno: "Lun Cen", consumo: 410, desperdicio: 55, meta: 41 },
  { turno: "Mar Des", consumo: 290, desperdicio: 38, meta: 29 },
  { turno: "Mar Alm", consumo: 550, desperdicio: 60, meta: 55 },
  { turno: "Mar Cen", consumo: 380, desperdicio: 42, meta: 38 },
  { turno: "Mié Des", consumo: 310, desperdicio: 35, meta: 31 },
  { turno: "Mié Alm", consumo: 600, desperdicio: 65, meta: 60 },
  { turno: "Mié Cen", consumo: 420, desperdicio: 50, meta: 42 },
  { turno: "Jue Des", consumo: 300, desperdicio: 30, meta: 30 },
  { turno: "Jue Alm", consumo: 570, desperdicio: 52, meta: 57 },
  { turno: "Jue Cen", consumo: 400, desperdicio: 44, meta: 40 },
];

export const ahorroProyectado = [
  { mes: "Ene", ahorro: 2800, desperdicioKg: 420 },
  { mes: "Feb", ahorro: 3200, desperdicioKg: 380 },
  { mes: "Mar", ahorro: 4100, desperdicioKg: 310 },
  { mes: "Abr", ahorro: 4800, desperdicioKg: 260 },
];

export const produccionRecomendada = [
  { item: "Arroz blanco", actual: 45, recomendado: 38, unidad: "kg", confianza: 94 },
  { item: "Pollo asado", actual: 30, recomendado: 25, unidad: "kg", confianza: 91 },
  { item: "Ensalada mixta", actual: 20, recomendado: 16, unidad: "kg", confianza: 88 },
  { item: "Pan artesanal", actual: 200, recomendado: 160, unidad: "und", confianza: 96 },
  { item: "Pasta primavera", actual: 25, recomendado: 20, unidad: "kg", confianza: 90 },
  { item: "Fruta fresca", actual: 35, recomendado: 28, unidad: "kg", confianza: 87 },
  { item: "Sopa del día", actual: 40, recomendado: 32, unidad: "L", confianza: 93 },
  { item: "Postre variado", actual: 150, recomendado: 120, unidad: "und", confianza: 89 },
];

export const inventario = [
  { sku: "INS-001", nombre: "Arroz premium", stock: 120, minimo: 80, unidad: "kg", estado: "ok" as const },
  { sku: "INS-002", nombre: "Pechuga de pollo", stock: 45, minimo: 60, unidad: "kg", estado: "critico" as const },
  { sku: "INS-003", nombre: "Tomate", stock: 30, minimo: 25, unidad: "kg", estado: "ok" as const },
  { sku: "INS-004", nombre: "Lechuga", stock: 8, minimo: 15, unidad: "kg", estado: "critico" as const },
  { sku: "INS-005", nombre: "Aceite de oliva", stock: 20, minimo: 10, unidad: "L", estado: "ok" as const },
  { sku: "INS-006", nombre: "Harina de trigo", stock: 50, minimo: 40, unidad: "kg", estado: "ok" as const },
  { sku: "INS-007", nombre: "Leche entera", stock: 15, minimo: 30, unidad: "L", estado: "critico" as const },
  { sku: "INS-008", nombre: "Huevos", stock: 200, minimo: 150, unidad: "und", estado: "ok" as const },
];

export const pedidoSugerido = [
  { sku: "INS-002", nombre: "Pechuga de pollo", cantidadActual: 45, cantidadPedir: 60, unidad: "kg" },
  { sku: "INS-004", nombre: "Lechuga", cantidadActual: 8, cantidadPedir: 25, unidad: "kg" },
  { sku: "INS-007", nombre: "Leche entera", cantidadActual: 15, cantidadPedir: 40, unidad: "L" },
];

export const impactoAmbiental = {
  comidaRescatada: 1240,
  co2Evitado: 3224,
  metanoEvitado: 186,
  reduccionPorcentual: 12.5,
  metaReduccion: 10,
  equivalencias: {
    arboles: 145,
    viajesAuto: 8100,
  },
};

export const impactoSemanal = [
  { semana: "Sem 1", rescatadoKg: 280, co2: 728 },
  { semana: "Sem 2", rescatadoKg: 310, co2: 806 },
  { semana: "Sem 3", rescatadoKg: 320, co2: 832 },
  { semana: "Sem 4", rescatadoKg: 330, co2: 858 },
];

export const contadorHuesped = {
  comidaRescatadaSemana: 330,
  platosEquivalentes: 825,
  co2EvitadoSemana: 858,
};
