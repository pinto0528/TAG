# Plan: Integrar tab Documentación con API

## Contexto

La tab "Documentación" dentro del detalle de viaje (Trips.jsx) ya está parcialmente conectada a la API. El form crea/edita documentos y sube archivos via FormData. Pero tiene 5 problemas que resolver.

## Archivos a modificar

- `client/src/pages/Trips.jsx` — DocumentationForm (líneas 318-455) y tab rendering (líneas 1471-1544)

## Cambios

### 1. Input de archivos no se resetea → duplicados

**Línea 417**: después de `setFiles(...)`, falta limpiar el input.

```jsx
onChange={e => {
  setFiles([...files, ...Array.from(e.target.files)]);
  e.target.value = '';  // ← AGREGAR
}}
```

### 2. Validación de tamaño en cliente (10MB)

**Línea 417**: antes de agregar archivos, filtrar los que superen 10MB y mostrar alerta.

```jsx
onChange={e => {
  const newFiles = Array.from(e.target.files);
  const MAX_SIZE = 10 * 1024 * 1024;
  const tooLarge = newFiles.filter(f => f.size > MAX_SIZE);
  if (tooLarge.length > 0) {
    alert(`${tooLarge.length} archivo(s) superan 10MB y no se agregaron: ${tooLarge.map(f => f.name).join(', ')}`);
  }
  const valid = newFiles.filter(f => f.size <= MAX_SIZE);
  if (valid.length > 0) setFiles([...files, ...valid]);
  e.target.value = '';
}}
```

### 3. Reemplazar `confirm()` nativo por ConfirmModal

**Línea 367-369**: `handleDeleteFile` usa `confirm('Eliminar este archivo?')`.

`DocumentationForm` no tiene acceso a `setConfirmCfg` del padre. Solución: agregar `confirmCfg` state local al form.

```jsx
// Agregar state
const [confirmDeleteId, setConfirmDeleteId] = useState(null);

// Reemplazar handleDeleteFile
const handleDeleteFile = async (archivoId) => {
  setConfirmDeleteId(archivoId);
};

const confirmDeleteFile = async () => {
  const archivoId = confirmDeleteId;
  setConfirmDeleteId(null);
  setUploading(true);
  try {
    const res = await fetch(`${API_BASE_URL}/documentos/${existingDoc.id}/archivos/${archivoId}`, { method: 'DELETE' });
    if (res.ok) {
      const data = await res.json();
      setExistingFiles(data.archivos || []);
    }
  } finally { setUploading(false); }
};

// En el JSX, agregar ConfirmModal al final del form:
{confirmDeleteId && (
  <ConfirmModal
    message="¿Eliminar este archivo?"
    onConfirm={confirmDeleteFile}
    onClose={() => setConfirmDeleteId(null)}
  />
)}
```

### 4. Agregar campo `descripcion` al form

**Línea 322-328**: agregar `descripcion` al state inicial.

```jsx
const [docData, setDocData] = useState({
  viaje_id: trip.id,
  tipo: existingDoc?.tipo || 'REMITO',
  numero: existingDoc?.numero || '',
  fecha: existingDoc?.fecha ? formatDateForInput(existingDoc.fecha) : new Date().toISOString().split('T')[0],
  descripcion: existingDoc?.descripcion || '',  // ← AGREGAR
  notas: existingDoc?.notas || '',
});
```

**Línea 403-406**: agregar input de descripción antes de Notas.

```jsx
<div>
  <label style={labelStyle}>Descripción</label>
  <input className="input-field" value={docData.descripcion} onChange={e => setDocData({ ...docData, descripcion: e.target.value })} placeholder="Descripción del documento" />
</div>
```

### 5. Agregar botón "Agregar archivo" suelto (standalone upload)

Cuando ya existe un documento, permite subir archivos sin reabrir el form completo. Agregar un botón debajo de la galería de archivos en la tab (línea ~1535):

```jsx
{/* Después de la galería de archivos, botón para subir archivo suelto */}
{trip.documento && (
  <div style={{ marginTop: '0.75rem' }}>
    <input
      ref={standaloneFileInputRef}
      type="file"
      multiple
      accept=".jpg,.jpeg,.png,.pdf"
      style={{ display: 'none' }}
      onChange={handleStandaloneUpload}
    />
    <button
      className="outline"
      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
      onClick={() => standaloneFileInputRef.current?.click()}
    >
      + Agregar archivo
    </button>
  </div>
)}
```

La función `handleStandaloneUpload` llama a `POST /api/documentos/{id}/archivos`:

```jsx
const handleStandaloneUpload = async (e) => {
  const newFiles = Array.from(e.target.files);
  const MAX_SIZE = 10 * 1024 * 1024;
  const valid = newFiles.filter(f => f.size <= MAX_SIZE);
  if (valid.length === 0) return;

  for (const file of valid) {
    const formData = new FormData();
    formData.append('archivo', file);
    await fetch(`${API_BASE_URL}/documentos/${trip.documento.id}/archivos`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    });
  }
  e.target.value = '';
  onRefresh();  // recarga el viaje con documentos actualizados
};
```

Se necesita un `useRef` para el input standalone y pasar `onRefresh` al `TripDetail`.

## Orden de implementación

1. Campo `descripcion` en state + input
2. Reset del file input
3. Validación de tamaño 10MB
4. ConfirmModal para borrado de archivos
5. Botón "Agregar archivo" standalone + `handleStandaloneUpload`

## Verificación

- Abrir detalle de viaje → tab Documentación
- Crear documento con descripción → verificar que aparece en la tabla
- Subir 2 archivos → verificar thumbnails/links
- Subir archivo >10MB → verificar que muestra alerta y no lo agrega
- Cerrar form, volver a abrir file picker → verificar que no duplica archivos
- Borrar archivo → verificar que aparece ConfirmModal, no confirm() nativo
- Con documento ya creado, clickear "+ Agregar archivo" → verificar que sube sin abrir form
