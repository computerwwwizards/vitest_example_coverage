

# Plan para crear tool - reporte de coverage

## 1. Setup y Configuración de la Herramienta
- El tool será un CLI en Node.js ubicado en `packages/coverage-reporter`.
- El proyecto usará ESM (`"type": "module"` en `package.json`).
- Solo se permite el uso de APIs nativas de Node.js y las siguientes dependencias:
  - `tsx`: Ejecutar TypeScript directamente sin compilar.
  - `dotenv`: Leer variables de entorno desde archivos `.env`.
  - `papaparse`: Convertir objetos JavaScript a formato CSV.
- No se deben usar otras librerías externas.
- Todas las operaciones de red (API) y archivos deben hacerse con módulos nativos (`https`, `fs`, etc.), excepto CSV/env que usan las dependencias listadas.
- Inputs requeridos por CLI: `TOKEN` (API token de SonarQube) y `HOST` (URL base del servidor SonarQube).

## 2. Obtención de Información desde SonarQube
- Paso 1: Obtener todos los proyectos usando:
  ```
  GET /api/projects/search
  ```
  - Se pueden usar parámetros de búsqueda como `q=fe` para filtrar por nombre.
- Paso 2: Para cada proyecto, obtener el coverage:
  ```
  GET /api/measures/component?component=<projectKey>&metricKeys=coverage
  ```
  - Reemplazar `<projectKey>` por el key de cada proyecto.

## 3. Generar el Reporte
- Calcular la categoría a la que pertenece cada proyecto (según lógica propia).
- Crear un archivo CSV con las columnas:
  - `nombre_de_repositorio` (nombre del repo)
  - `porcentaje_coverage` (coverage %)
  - `category` (categoría asignada)

