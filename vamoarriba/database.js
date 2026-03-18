const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'vamoarriba.db');

// Compatibility wrapper that mimics better-sqlite3 API using sql.js
class DatabaseWrapper {
  constructor(sqlDb) {
    this.sqlDb = sqlDb;
  }

  prepare(sql) {
    const self = this;
    return {
      all(...params) {
        const stmt = self.sqlDb.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      get(...params) {
        const stmt = self.sqlDb.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        let result = undefined;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result;
      },
      run(...params) {
        self.sqlDb.run(sql, params);
        const result = self.sqlDb.exec('SELECT last_insert_rowid() as id');
        const lastInsertRowid = result.length > 0 ? result[0].values[0][0] : 0;
        const changes = self.sqlDb.getRowsModified();
        self._save();
        return { lastInsertRowid, changes };
      }
    };
  }

  exec(sql) {
    this.sqlDb.run(sql);
    this._save();
  }

  pragma(str) {
    try {
      this.sqlDb.run(`PRAGMA ${str}`);
    } catch (e) {
      // Ignore pragma errors - sql.js has limited pragma support
    }
  }

  _save() {
    const data = this.sqlDb.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

// The db object used by all modules - populated after init()
let wrapper = null;

// Proxy that delegates all calls to the wrapper after initialization
const db = new Proxy({}, {
  get(target, prop) {
    if (prop === 'init') return init;
    if (prop === 'then') return undefined; // Prevent Promise detection
    if (!wrapper) throw new Error('Database not initialized. Call db.init() first.');
    const val = wrapper[prop];
    if (typeof val === 'function') return val.bind(wrapper);
    return val;
  }
});

async function init() {
  const SQL = await initSqlJs();
  let sqlDb;
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    sqlDb = new SQL.Database(buffer);
  } else {
    sqlDb = new SQL.Database();
  }
  wrapper = new DatabaseWrapper(sqlDb);

  // Enable foreign keys
  wrapper.pragma('foreign_keys = ON');

  // Create tables
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre VARCHAR(100) NOT NULL,
      apellido VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      rol VARCHAR(20) NOT NULL DEFAULT 'coachee',
      avatar VARCHAR(255) DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      especialidad VARCHAR(255) DEFAULT NULL,
      certificacion VARCHAR(255) DEFAULT NULL,
      telefono VARCHAR(20) DEFAULT NULL,
      pais VARCHAR(100) DEFAULT NULL,
      ciudad VARCHAR(100) DEFAULT NULL,
      linkedin VARCHAR(255) DEFAULT NULL,
      sitio_web VARCHAR(255) DEFAULT NULL,
      activo INTEGER DEFAULT 1,
      fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
      ultimo_acceso DATETIME DEFAULT NULL
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS metas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      coach_id INTEGER DEFAULT NULL,
      titulo VARCHAR(255) NOT NULL,
      descripcion TEXT,
      categoria VARCHAR(100),
      estado VARCHAR(20) DEFAULT 'activa',
      progreso INTEGER DEFAULT 0,
      fecha_inicio DATE DEFAULT CURRENT_DATE,
      fecha_objetivo DATE,
      fecha_completada DATE DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (coach_id) REFERENCES usuarios(id)
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS sesiones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meta_id INTEGER NOT NULL,
      coach_id INTEGER NOT NULL,
      coachee_id INTEGER NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      fecha DATETIME NOT NULL,
      duracion INTEGER DEFAULT 60,
      estado VARCHAR(20) DEFAULT 'programada',
      notas_coach TEXT DEFAULT NULL,
      notas_coachee TEXT DEFAULT NULL,
      grow_goal TEXT DEFAULT NULL,
      grow_reality TEXT DEFAULT NULL,
      grow_options TEXT DEFAULT NULL,
      grow_will TEXT DEFAULT NULL,
      calificacion INTEGER DEFAULT NULL,
      feedback TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meta_id) REFERENCES metas(id),
      FOREIGN KEY (coach_id) REFERENCES usuarios(id),
      FOREIGN KEY (coachee_id) REFERENCES usuarios(id)
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS recursos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      autor_id INTEGER NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      descripcion TEXT,
      tipo VARCHAR(50) NOT NULL,
      url VARCHAR(500) DEFAULT NULL,
      contenido TEXT DEFAULT NULL,
      categoria VARCHAR(100),
      visitas INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (autor_id) REFERENCES usuarios(id)
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS testimonios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      coachee_id INTEGER NOT NULL,
      coach_id INTEGER NOT NULL,
      contenido TEXT NOT NULL,
      calificacion INTEGER DEFAULT 5,
      aprobado INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (coachee_id) REFERENCES usuarios(id),
      FOREIGN KEY (coach_id) REFERENCES usuarios(id)
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS mensajes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emisor_id INTEGER NOT NULL,
      receptor_id INTEGER NOT NULL,
      contenido TEXT NOT NULL,
      leido INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (emisor_id) REFERENCES usuarios(id),
      FOREIGN KEY (receptor_id) REFERENCES usuarios(id)
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS publicaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      contenido TEXT NOT NULL,
      imagen VARCHAR(255) DEFAULT NULL,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS comentarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      publicacion_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      contenido TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      publicacion_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(publicacion_id, usuario_id),
      FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS conexiones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      conectado_id INTEGER NOT NULL,
      estado VARCHAR(20) DEFAULT 'pendiente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(usuario_id, conectado_id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (conectado_id) REFERENCES usuarios(id)
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS notificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      tipo VARCHAR(50) NOT NULL,
      mensaje TEXT NOT NULL,
      leida INTEGER DEFAULT 0,
      enlace VARCHAR(255) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS paquetes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre VARCHAR(100) NOT NULL,
      descripcion TEXT,
      semanas INTEGER NOT NULL,
      sesiones INTEGER NOT NULL,
      precio_total DECIMAL(10,2) NOT NULL,
      precio_por_sesion DECIMAL(10,2) NOT NULL,
      descuento INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS pagos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      coach_id INTEGER NOT NULL,
      paquete_id INTEGER DEFAULT NULL,
      mp_payment_id VARCHAR(255) DEFAULT NULL,
      mp_preference_id VARCHAR(255) DEFAULT NULL,
      concepto VARCHAR(255) NOT NULL,
      monto DECIMAL(10,2) NOT NULL,
      moneda VARCHAR(10) DEFAULT 'usd',
      estado VARCHAR(20) DEFAULT 'pendiente',
      metodo_pago VARCHAR(50) DEFAULT NULL,
      sesiones_totales INTEGER DEFAULT 1,
      sesiones_usadas INTEGER DEFAULT 0,
      fecha_pago DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (coach_id) REFERENCES usuarios(id),
      FOREIGN KEY (paquete_id) REFERENCES paquetes(id)
    )
  `);

  return db;
}

module.exports = db;
