# Como ejecutar el programa COBOL en tu PC

## Requisito: Instalar GnuCOBOL (gratuito y open source)

### En Windows:
1. Descarga el instalador desde: https://sourceforge.net/projects/gnucobol/
2. Ejecuta el instalador y sigue los pasos
3. Abre el **Simbolo del sistema (CMD)**

### En Ubuntu/Debian Linux:
```bash
sudo apt update
sudo apt install gnucobol
```

### En macOS:
```bash
brew install gnu-cobol
```

---

## Compilar y ejecutar el programa

### Paso 1 - Abrir terminal y entrar a la carpeta del proyecto:
```bash
cd /ruta/donde/esta/ALTA-USUARIOS.cbl
```

### Paso 2 - Compilar:
```bash
cobc -x -o ALTA-USUARIOS ALTA-USUARIOS.cbl
```
- `-x` indica que se genera un ejecutable
- `-o ALTA-USUARIOS` es el nombre del archivo de salida

### Paso 3 - Ejecutar:

**En Linux/macOS:**
```bash
./ALTA-USUARIOS
```

**En Windows:**
```cmd
ALTA-USUARIOS.exe
```

---

## Que hace el programa

El programa tiene un **menu con 4 opciones**:

```
==================================================
   SISTEMA DE ALTA DE USUARIOS
==================================================
   1. DAR DE ALTA UN USUARIO
   2. LISTAR TODOS LOS USUARIOS
   3. BUSCAR USUARIO POR ID
   4. SALIR
==================================================
```

### Opcion 1 - Alta de usuario:
- Asigna un ID automatico
- Pide: Nombre, Apellido, Email, Telefono
- Guarda los datos en el archivo `USUARIOS.DAT`

### Opcion 2 - Listar usuarios:
- Muestra todos los usuarios registrados con sus datos

### Opcion 3 - Buscar por ID:
- Busca un usuario especifico por su numero de ID

### Opcion 4 - Salir:
- Termina el programa

---

## Archivo de datos

Los usuarios se guardan en el archivo **`USUARIOS.DAT`** (se crea automaticamente
en la misma carpeta donde ejecutas el programa).

---

## Ejemplo de uso rapido

```
INGRESE OPCION: 1
ID ASIGNADO: 00001
NOMBRE      : Juan
APELLIDO    : Perez
EMAIL       : juan@email.com
TELEFONO    : 099123456

USUARIO REGISTRADO EXITOSAMENTE!
```
