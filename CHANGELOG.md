# Registro de Cambios - CM FIX

## CM FIX V1.5 — Actualización Mayor de Taller y Mostrador

### Nuevas Funcionalidades
- **Motor de Diagnóstico Estructurado (`DiagnosticEngineModal`)**: Checklist técnico interactivo con 16 puntos de inspección (Pantalla, Táctil, Batería, Carga, Cámaras, Sensores, Audio, Wi-Fi, Placa Base). Permite marcar `OK`, `FALLO` o `N/A`, calcular el índice de salud del equipo y almacenar notas técnicas específicas por componente.
- **Presupuestos Manuales y Automáticos**: Selector en creación de presupuestos que permite alternar entre el cálculo automático con tarifas de catálogo o fijar importes manuales personalizados con desglose de IVA (21%) y mano de obra.
- **Check-in del Dispositivo y Recepción Técnica (`DeviceCheckinModal`)**: Módulo de entrada que registra IMEI/Serie, código PIN o patrón de desbloqueo, porcentaje de batería al ingresar, accesorios dejados en custodia (cables, cargadores, fundas, SIM) y estado cosmético previo (rayones, golpes en chasis, daño por líquidos).
- **Inspección con Fotografías**: Soporte para captura o carga de múltiples fotografías de entrada (frontal, trasera, esquinas y detalle de avería) para proteger al taller ante reclamaciones por desperfectos previos.
- **Firma Digital del Cliente (`SignaturePadModal`)**: Lienzo táctil interactivo en HTML5 Canvas con soporte táctil y de ratón para formalizar la aceptación de condiciones de entrada y resguardo de entrega con marca de fecha y hora.
- **Historial de Dispositivo por IMEI / Serie (`DeviceHistoryModal`)**: Buscador centralizado para consultar reparaciones previas, diagnósticos anteriores, piezas sustituidas y gasto acumulado de cualquier terminal en el taller.
- **Registro de Auditoría y Trazabilidad (`AdminAuditLogPage`)**: Bitácora inmutable en `/admin/auditoria` que documenta qué usuario o técnico realizó cada acción (creación de orden, cambio de estado, modificación de precios, firmas o diagnósticos).
- **Análisis de Rentabilidad y Margen (`ProfitabilityModal`)**: Cálculo de coste de repuestos frente a PVP, beneficio bruto neto y porcentaje de margen comercial con indicadores visuales por tramos de rentabilidad en el panel de reparaciones.
- **Automatización de Estados**: Triggers automáticos; al cambiar una reparación a `LISTO PARA RECOGER`, el sistema lanza automáticamente el prompt para notificar al cliente vía WhatsApp con mensaje pre-redactado y enlace de seguimiento.
- **Modo Mostrador Express (`ModoMostradorPage`)**: Nueva interfaz en `/admin/mostrador` pensada para tablets y terminales de mostrador de recepción en 4 pasos ultra-rápidos: búsqueda/alta de cliente, selección de equipo y avería, check-in con firma táctil, y emisión de resguardo o ticket en menos de 60 segundos.

## CM FIX V1 Stability Update

### Corregido
- **Idempotencia en Conversión Presupuesto → Reparación**: Se implementó una verificación interna en `dbService.createRepairFromQuote` para comprobar si ya existe una reparación vinculada a ese `quote_id` o `quote_number`. Si ya existe, se devuelve la reparación existente evitando duplicados en Supabase o en el almacenamiento local.
- **Protección contra Doble Clic en Panel Admin**: En `AdminQuotesPage.tsx`, se añadió el estado `convertingId` y se deshabilitó el botón "A Taller" durante el proceso de conversión para impedir llamadas concurrentes por clics repetidos.
- **Prevención de Stock Negativo en Inventario**: En `dbService.addInventoryItem` y `dbService.updateInventoryItem`, así como en `AdminInventoryPage.tsx`, se aplicó saneamiento con `Math.max(0, ...)` a los campos de stock y stock mínimo para impedir números negativos accidentales.

### Mejorado
- **Persistencia y Resiliencia Offline/Online**: Mecanismo híbrido de sincronización que preserva la consistencia entre Supabase y almacenamiento local sin riesgo de sobreescritura destructiva ni pérdida de datos creados sin conexión.
- **Canal de Notificaciones en Tiempo Real**: Sistema de difusión multi-ventana (`BroadcastChannel`) y listener en tiempo real con respaldo periódico de sondeo cada 25 segundos para garantizar que los presupuestos nuevos lleguen inmediatamente a todas las instancias abiertas.
- **Campana de Alertas y Sonido Nativo**: Notificación acústica generada mediante la Web Audio API nativa (frecuencias D5 y A5), sin dependencias de archivos de audio externos que puedan fallar en la red o bloquear el hilo principal.

### Seguridad
- **Políticas RLS en Supabase**: Todas las tablas principales (`profiles`, `customers`, `suppliers`, `inventory`, `pricing_catalog`, `quotes`, `quote_items`, `repairs`, `repair_status_history`, `company_settings`) cuentan con Row Level Security activado y políticas diferenciadas para acceso público y autenticado.
- **Protección de Datos Sensibles**: La página pública de seguimiento (`/seguimiento`) no expone contraseñas, patrones de desbloqueo, notas técnicas internas, costes de compra de piezas ni datos personales de terceros clientes.
- **Variables de Entorno**: No se exponen claves maestras (`service_role`) en el frontend ni en repositorios. Únicamente se utiliza la clave pública anónima de Supabase.
- **Control de Roles**: Panel de administración protegido por verificación de rol (`ADMIN`, `TECNICO`, `RECEPCION`).

### Base de datos
- **Integridad de Esquema**: Se mantuvieron intactas las 10 tablas existentes de Supabase, sus nombres, tipos y relaciones.
- **Compatibilidad Reversa**: Sin modificaciones destructivas de columnas ni eliminación de tablas.
- **Deduplicación de Clientes**: En `createCustomer`, se verifica la existencia previa por teléfono y correo electrónico antes de insertar nuevos registros, reutilizando el cliente existente para preservar su histórico.

### PWA
- **Service Worker v2.3**: Estrategia Network-First para navegación y recursos locales, con fallback a caché offline para garantizar que la app nunca quede en pantalla en blanco sin conexión.
- **Bypass de APIs**: Las llamadas a Supabase (`*.supabase.co`, `/rest/v1`, `/auth/v1`) se excluyen expresamente de la caché del Service Worker para garantizar que los datos del taller siempre estén actualizados.
- **Recarga Automatizada en Actualización**: Mecanismo `controllerchange` configurado en `index.html` para activar instantáneamente nuevas versiones sin requerir desinstalaciones manuales.

### Tests
- **TEST 1 - Solicitud de Presupuesto**: Validada creación de presupuesto en `BudgetEstimatorPage.tsx`, cálculo correcto de IVA (21%), totales y generación de código único CMF.
- **TEST 2 - Generación de PDF**: Verificado `pdfGenerator.ts` con desglose, datos de empresa, código CMF y código QR.
- **TEST 3 - Aceptación de Presupuesto**: Cambio de estado a `ACEPTADO` y vinculación a orden de servicio.
- **TEST 4 - Idempotencia Presupuesto → Reparación**: Múltiples ejecuciones sobre el mismo presupuesto devuelven una única orden de reparación sin duplicados.
- **TEST 5 - Actualización de Estados**: Transición de estados de reparación y registro en historial.
- **TEST 6 - Seguimiento Público**: Comprobada consulta por código CMF con visualización de timeline y notas públicas sin datos privados.
- **TEST 7 - Creación de Clientes**: Comprobada búsqueda previa por teléfono/email para evitar registros duplicados.
- **TEST 8 - Creación y Edición de Piezas de Inventario**: Comprobado guardado con stock no negativo.
- **TEST 9 - Control de Stock Mínimo**: Comprobada alerta de stock bajo (`stock <= min_stock`).
- **TEST 10 - Protección de Sesión Admin**: Verificado acceso condicional y protección de rutas `/admin/*`.
- **TEST 11 - Permisos por Rol**: Validación en `AdminUsersPage.tsx` y layouts.
- **TEST 12 - Modo Offline**: Verificación de navegación y fallback a caché en Service Worker.
- **TEST 13 - Recuperación Online**: Reanudación transparente de sincronización con Supabase.
- **TEST 14 - Instalación PWA**: Manifiesto web e iconos válidos en `/manifest.webmanifest`.
- **TEST 15 - Compilación TypeScript & Vite**: `npm run build` ejecutado exitosamente con 0 errores (código de salida 0).
