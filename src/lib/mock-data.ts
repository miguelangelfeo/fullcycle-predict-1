// Mock data for FullCycle Solutions prototype

export type PeriodKey = "diario" | "semanal" | "mensual";

export const consumoVsDesperdicioData: Record<PeriodKey, { turno: string; consumo: number; desperdicio: number; meta: number }[]> = {
  diario: [
    { turno: "Des", consumo: 310, desperdicio: 45, meta: 31 },
    { turno: "Alm", consumo: 580, desperdicio: 68, meta: 58 },
    { turno: "Cen", consumo: 400, desperdicio: 52, meta: 40 },
  ],
  semanal: [
    { turno: "Lun", consumo: 1100, desperdicio: 155, meta: 110 },
    { turno: "Mar", consumo: 1020, desperdicio: 130, meta: 102 },
    { turno: "Mié", consumo: 1330, desperdicio: 150, meta: 133 },
    { turno: "Jue", consumo: 1270, desperdicio: 126, meta: 127 },
    { turno: "Vie", consumo: 1450, desperdicio: 160, meta: 145 },
    { turno: "Sáb", consumo: 1600, desperdicio: 190, meta: 160 },
    { turno: "Dom", consumo: 1500, desperdicio: 175, meta: 150 },
  ],
  mensual: [
    { turno: "Sem 1", consumo: 7800, desperdicio: 980, meta: 780 },
    { turno: "Sem 2", consumo: 8200, desperdicio: 920, meta: 820 },
    { turno: "Sem 3", consumo: 7600, desperdicio: 840, meta: 760 },
    { turno: "Sem 4", consumo: 8500, desperdicio: 870, meta: 850 },
  ],
};

// keep old export for backward compat
export const consumoVsDesperdicio = consumoVsDesperdicioData.semanal;

export const ahorroProyectadoData: Record<PeriodKey, { mes: string; ahorro: number; desperdicioKg: number }[]> = {
  diario: [
    { mes: "08:00", ahorro: 120, desperdicioKg: 45 },
    { mes: "12:00", ahorro: 310, desperdicioKg: 68 },
    { mes: "16:00", ahorro: 180, desperdicioKg: 52 },
    { mes: "20:00", ahorro: 240, desperdicioKg: 38 },
  ],
  semanal: [
    { mes: "Lun", ahorro: 620, desperdicioKg: 155 },
    { mes: "Mar", ahorro: 580, desperdicioKg: 130 },
    { mes: "Mié", ahorro: 710, desperdicioKg: 150 },
    { mes: "Jue", ahorro: 690, desperdicioKg: 126 },
    { mes: "Vie", ahorro: 820, desperdicioKg: 160 },
    { mes: "Sáb", ahorro: 950, desperdicioKg: 190 },
    { mes: "Dom", ahorro: 880, desperdicioKg: 175 },
  ],
  mensual: [
    { mes: "Ene", ahorro: 2800, desperdicioKg: 420 },
    { mes: "Feb", ahorro: 3200, desperdicioKg: 380 },
    { mes: "Mar", ahorro: 4100, desperdicioKg: 310 },
    { mes: "Abr", ahorro: 4800, desperdicioKg: 260 },
  ],
};

export const ahorroProyectado = ahorroProyectadoData.mensual;

export const statCardData: Record<PeriodKey, { consumo: string; desperdicio: string; desperdicioPct: string; ahorro: string; ahorroSub: string; rescatada: string }> = {
  diario: {
    consumo: "650 kg",
    desperdicio: "78 kg",
    desperdicioPct: "12.0% del total",
    ahorro: "$850",
    ahorroSub: "Hoy",
    rescatada: "180 kg",
  },
  semanal: {
    consumo: "4,630 kg",
    desperdicio: "539 kg",
    desperdicioPct: "11.6% del total",
    ahorro: "$4,800",
    ahorroSub: "Esta semana",
    rescatada: "1,240 kg",
  },
  mensual: {
    consumo: "18,500 kg",
    desperdicio: "2,100 kg",
    desperdicioPct: "11.4% del total",
    ahorro: "$19,200",
    ahorroSub: "Abril 2026",
    rescatada: "4,960 kg",
  },
};

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

export interface Proveedor {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  skus: string[];
}

export const proveedores: Proveedor[] = [
  { id: "PROV-001", nombre: "Distribuidora Carnes Colombia", email: "pagos@carnescolombia.com", telefono: "+57 1 234 5678", skus: ["INS-002"] },
  { id: "PROV-002", nombre: "Verduras del Campo S.A.S", email: "ventas@verdurascampo.com.co", telefono: "+57 1 345 6789", skus: ["INS-003", "INS-004"] },
  { id: "PROV-003", nombre: "Lácteos del Norte", email: "cuentas@lacteosnorte.com", telefono: "+57 1 456 7890", skus: ["INS-007"] },
  { id: "PROV-004", nombre: "Abastos Generales Ltda.", email: "compras@abastosgenerales.com", telefono: "+57 1 567 8901", skus: ["INS-001", "INS-005", "INS-006", "INS-008"] },
];
