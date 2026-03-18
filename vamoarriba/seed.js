const db = require('./database');
const bcrypt = require('bcryptjs');

const hash = (pw) => bcrypt.hashSync(pw, 10);

async function seed() {
  await db.init();

  console.log('Seeding database...');

  // Clear existing data
  db.exec(`DELETE FROM notificaciones`);
  db.exec(`DELETE FROM conexiones`);
  db.exec(`DELETE FROM likes`);
  db.exec(`DELETE FROM comentarios`);
  db.exec(`DELETE FROM publicaciones`);
  db.exec(`DELETE FROM testimonios`);
  db.exec(`DELETE FROM recursos`);
  db.exec(`DELETE FROM sesiones`);
  db.exec(`DELETE FROM pagos`);
  db.exec(`DELETE FROM metas`);
  db.exec(`DELETE FROM mensajes`);
  db.exec(`DELETE FROM paquetes`);
  db.exec(`DELETE FROM usuarios`);

  // Insert Admin
  const insertUser = db.prepare(`
    INSERT INTO usuarios (nombre, apellido, email, password, rol, bio, especialidad, certificacion, telefono, pais, ciudad, linkedin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const adminId = insertUser.run('Admin', 'VamoArriba', 'admin', hash('admin1234'), 'admin',
    'Administrador de la plataforma VamoArriba', 'Administración', 'Admin', '+598 99 000 000', 'Uruguay', 'Montevideo', '').lastInsertRowid;

  // =====================
  // INSERT 12 COACHES
  // =====================
  const coaches = [
    ['María', 'González', 'maria@vamoarriba.com', hash('coach123'), 'coach',
      'Coach certificada ICF con más de 10 años de experiencia en coaching ejecutivo y desarrollo de liderazgo. Apasionada por ayudar a líderes a alcanzar su máximo potencial.',
      'Coaching Ejecutivo', 'PCC - ICF', '+598 99 111 111', 'Uruguay', 'Montevideo', 'linkedin.com/in/mariagonzalez'],
    ['Carlos', 'Rodríguez', 'carlos@vamoarriba.com', hash('coach123'), 'coach',
      'Especialista en coaching de vida y bienestar integral. Certificado por la ICF, con enfoque en el método GROW para transformación personal profunda.',
      'Coaching de Vida', 'ACC - ICF', '+54 11 2222 3333', 'Argentina', 'Buenos Aires', 'linkedin.com/in/carlosrodriguez'],
    ['Ana', 'Martínez', 'ana@vamoarriba.com', hash('coach123'), 'coach',
      'Coach de carrera profesional con experiencia en transiciones laborales y desarrollo de talento. Ex directora de RRHH en multinacionales.',
      'Coaching de Carrera', 'PCC - ICF', '+56 9 4444 5555', 'Chile', 'Santiago', 'linkedin.com/in/anamartinez'],
    ['Roberto', 'Silva', 'roberto@vamoarriba.com', hash('coach123'), 'coach',
      'Coach de equipos y organizaciones. Experto en dinámicas grupales, resolución de conflictos y construcción de equipos de alto rendimiento.',
      'Coaching de Equipos', 'MCC - ICF', '+55 11 6666 7777', 'Brasil', 'São Paulo', 'linkedin.com/in/robertosilva'],
    ['Laura', 'Fernández', 'laura@vamoarriba.com', hash('coach123'), 'coach',
      'Especialista en coaching de salud y bienestar. Ayudo a personas a crear hábitos saludables y alcanzar un equilibrio mente-cuerpo duradero.',
      'Coaching de Salud', 'ACC - ICF', '+598 99 888 999', 'Uruguay', 'Punta del Este', 'linkedin.com/in/laurafernandez'],
    ['Diego', 'López', 'diego@vamoarriba.com', hash('coach123'), 'coach',
      'Coach financiero certificado. Guío a emprendedores y profesionales hacia la libertad financiera con estrategias personalizadas y mentalidad de abundancia.',
      'Coaching Financiero', 'PCC - ICF', '+57 300 111 2222', 'Colombia', 'Bogotá', 'linkedin.com/in/diegolopez'],
    ['Valentina', 'Torres', 'valentina@vamoarriba.com', hash('coach123'), 'coach',
      'Coach de relaciones y comunicación. Experta en inteligencia emocional, comunicación no violenta y fortalecimiento de vínculos personales y profesionales.',
      'Coaching Relacional', 'ACC - ICF', '+52 55 3333 4444', 'México', 'Ciudad de México', 'linkedin.com/in/valentinatorres'],
    ['Sebastián', 'Herrera', 'sebastian@vamoarriba.com', hash('coach123'), 'coach',
      'Coach de emprendimiento e innovación. He acompañado a más de 200 emprendedores en el lanzamiento y escalamiento de sus negocios.',
      'Coaching Emprendedor', 'PCC - ICF', '+51 999 555 666', 'Perú', 'Lima', 'linkedin.com/in/sebastianherrera'],
    ['Camila', 'Ruiz', 'camila@vamoarriba.com', hash('coach123'), 'coach',
      'Coach de mindfulness y productividad. Combino técnicas de atención plena con metodologías ágiles para maximizar el rendimiento consciente.',
      'Coaching Mindfulness', 'ACC - ICF', '+598 99 777 888', 'Uruguay', 'Montevideo', 'linkedin.com/in/camilaruiz'],
    ['Andrés', 'Vargas', 'andres@vamoarriba.com', hash('coach123'), 'coach',
      'Coach deportivo y de alto rendimiento. Ex atleta olímpico, ahora dedico mi experiencia a ayudar a deportistas y ejecutivos a superar sus límites.',
      'Coaching Deportivo', 'MCC - ICF', '+506 8888 9999', 'Costa Rica', 'San José', 'linkedin.com/in/andresvargas'],
    ['Patricia', 'Guzmán', 'patricia@vamoarriba.com', hash('coach123'), 'coach',
      'Coach de creatividad e innovación. Ayudo a profesionales y artistas a desbloquear su potencial creativo y convertir ideas en proyectos reales.',
      'Coaching Creativo', 'PCC - ICF', '+54 11 5555 6666', 'Argentina', 'Córdoba', 'linkedin.com/in/patriciaguzman'],
    ['Fernando', 'Medina', 'fernando@vamoarriba.com', hash('coach123'), 'coach',
      'Coach de transición y resiliencia. Especializado en acompañar personas en momentos de cambio y crisis, transformando adversidades en oportunidades de crecimiento.',
      'Coaching de Resiliencia', 'ACC - ICF', '+56 9 7777 8888', 'Chile', 'Valparaíso', 'linkedin.com/in/fernandomedina'],
  ];

  const coachIds = [];
  for (const c of coaches) {
    const result = insertUser.run(...c);
    coachIds.push(result.lastInsertRowid);
  }

  // =====================
  // INSERT 12 COACHEES
  // =====================
  const coachees = [
    ['Pedro', 'Méndez', 'pedro@gmail.com', hash('user123'), 'coachee',
      'Gerente de proyectos buscando mejorar mi liderazgo y habilidades de comunicación con mi equipo.',
      null, null, '+598 99 100 200', 'Uruguay', 'Montevideo', ''],
    ['Lucía', 'Ramírez', 'lucia@gmail.com', hash('user123'), 'coachee',
      'Emprendedora en etapa inicial buscando orientación para lanzar mi startup tecnológica.',
      null, null, '+54 11 300 400', 'Argentina', 'Buenos Aires', ''],
    ['Martín', 'Acosta', 'martin@gmail.com', hash('user123'), 'coachee',
      'Profesional en transición de carrera, del sector financiero al mundo tech.',
      null, null, '+56 9 500 600', 'Chile', 'Santiago', ''],
    ['Sofía', 'Delgado', 'sofia@gmail.com', hash('user123'), 'coachee',
      'Estudiante universitaria buscando claridad sobre mi propósito de vida y carrera profesional.',
      null, null, '+57 300 700 800', 'Colombia', 'Medellín', ''],
    ['Joaquín', 'Paz', 'joaquin@gmail.com', hash('user123'), 'coachee',
      'Director comercial buscando equilibrio entre vida laboral y personal.',
      null, null, '+598 99 900 100', 'Uruguay', 'Montevideo', ''],
    ['Florencia', 'Castro', 'florencia@gmail.com', hash('user123'), 'coachee',
      'Atleta amateur buscando mejorar mi rendimiento y disciplina mental para competencias.',
      null, null, '+55 11 200 300', 'Brasil', 'Río de Janeiro', ''],
    ['Tomás', 'Núñez', 'tomas@gmail.com', hash('user123'), 'coachee',
      'Freelancer buscando organizar mejor mis finanzas y construir estabilidad económica.',
      null, null, '+52 55 400 500', 'México', 'Guadalajara', ''],
    ['Isabella', 'Moreno', 'isabella@gmail.com', hash('user123'), 'coachee',
      'Mamá emprendedora buscando estrategias para gestionar mejor mi tiempo y energía.',
      null, null, '+51 999 600 700', 'Perú', 'Lima', ''],
    ['Nicolás', 'Vega', 'nicolas@gmail.com', hash('user123'), 'coachee',
      'Ingeniero de software buscando desarrollar habilidades de liderazgo para ascender a CTO.',
      null, null, '+506 800 900', 'Costa Rica', 'San José', ''],
    ['Valeria', 'Soto', 'valeria@gmail.com', hash('user123'), 'coachee',
      'Profesora buscando reinventarme profesionalmente y explorar nuevas oportunidades.',
      null, null, '+598 99 110 220', 'Uruguay', 'Canelones', ''],
    ['Rodrigo', 'Espinoza', 'rodrigo@gmail.com', hash('user123'), 'coachee',
      'Médico cirujano buscando reducir el burnout y encontrar un balance sostenible entre mi práctica y mi vida personal.',
      null, null, '+54 11 444 555', 'Argentina', 'Rosario', ''],
    ['Camila', 'Herrera', 'camilah@gmail.com', hash('user123'), 'coachee',
      'Diseñadora gráfica freelance buscando escalar mi negocio y pasar de freelancer a dueña de agencia creativa.',
      null, null, '+56 9 333 444', 'Chile', 'Viña del Mar', ''],
  ];

  const coacheeIds = [];
  for (const c of coachees) {
    const result = insertUser.run(...c);
    coacheeIds.push(result.lastInsertRowid);
  }

  // =====================
  // INSERT PAQUETES (Packages)
  // =====================
  const insertPaquete = db.prepare(`
    INSERT INTO paquetes (nombre, descripcion, semanas, sesiones, precio_total, precio_por_sesion, descuento)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertPaquete.run('Plan 6 Semanas', 'Programa intensivo de 6 semanas con sesiones semanales para objetivos específicos.', 6, 6, 432, 72, 10);
  insertPaquete.run('Plan 9 Semanas', 'Programa completo de 9 semanas ideal para transformaciones profundas. Nuestro plan más popular.', 9, 9, 612, 68, 15);
  insertPaquete.run('Plan 12 Semanas', 'Programa premium de 12 semanas con seguimiento integral y certificado de completitud.', 12, 12, 768, 64, 20);

  // =====================
  // INSERT METAS (GOALS) - 44 completadas + 10 activas = 54 total
  // =====================
  const insertMeta = db.prepare(`
    INSERT INTO metas (usuario_id, coach_id, titulo, descripcion, categoria, estado, progreso, fecha_objetivo, fecha_completada)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // --- 44 METAS COMPLETADAS ---
  const metasCompletadas = [
    // Pedro (coacheeIds[0]) - 4 metas completadas
    [coacheeIds[0], coachIds[0], 'Desarrollar liderazgo transformacional',
      'Convertirme en un líder que inspire y motive a mi equipo, mejorando la comunicación y empatía.',
      'Liderazgo', 'completada', 100, '2025-06-30', '2025-06-28'],
    [coacheeIds[0], coachIds[0], 'Mejorar comunicación con el equipo',
      'Implementar sesiones de feedback semanales y comunicación abierta con mi equipo de 15 personas.',
      'Comunicación', 'completada', 100, '2025-08-31', '2025-08-25'],
    [coacheeIds[0], coachIds[3], 'Gestión efectiva de conflictos',
      'Aprender técnicas de mediación y resolución de conflictos dentro del equipo de trabajo.',
      'Liderazgo', 'completada', 100, '2025-10-15', '2025-10-12'],
    [coacheeIds[0], coachIds[0], 'Delegación estratégica',
      'Aprender a delegar tareas críticas manteniendo control sin micromanagement.',
      'Liderazgo', 'completada', 100, '2025-12-31', '2025-12-20'],

    // Lucía (coacheeIds[1]) - 4 metas completadas
    [coacheeIds[1], coachIds[7], 'Validar idea de negocio',
      'Realizar 50 entrevistas con usuarios potenciales y crear un MVP funcional.',
      'Emprendimiento', 'completada', 100, '2025-05-01', '2025-04-28'],
    [coacheeIds[1], coachIds[7], 'Lanzar MVP al mercado',
      'Desarrollar y lanzar la primera versión de mi app con las funcionalidades core.',
      'Emprendimiento', 'completada', 100, '2025-08-15', '2025-08-10'],
    [coacheeIds[1], coachIds[5], 'Conseguir primera ronda de inversión',
      'Preparar pitch deck y presentar a 20 fondos de inversión para conseguir seed funding.',
      'Financiero', 'completada', 100, '2025-11-30', '2025-11-22'],
    [coacheeIds[1], coachIds[7], 'Escalar a 1000 usuarios',
      'Implementar estrategia de growth hacking para alcanzar primeros 1000 usuarios activos.',
      'Emprendimiento', 'completada', 100, '2026-01-31', '2026-01-25'],

    // Martín (coacheeIds[2]) - 4 metas completadas
    [coacheeIds[2], coachIds[2], 'Certificación en Product Management',
      'Completar certificación profesional en PM con enfoque en metodologías ágiles.',
      'Carrera', 'completada', 100, '2025-04-30', '2025-04-20'],
    [coacheeIds[2], coachIds[2], 'Construir portafolio tech',
      'Crear 3 proyectos personales que demuestren habilidades de Product Management.',
      'Carrera', 'completada', 100, '2025-07-31', '2025-07-28'],
    [coacheeIds[2], coachIds[2], 'Conseguir primer empleo en tech',
      'Aplicar a 30 posiciones de Product Manager Jr y conseguir mi primer puesto.',
      'Carrera', 'completada', 100, '2025-09-30', '2025-09-15'],
    [coacheeIds[2], coachIds[0], 'Liderar mi primer sprint',
      'Planificar y ejecutar un sprint completo como PM liderando un equipo de desarrollo.',
      'Liderazgo', 'completada', 100, '2025-11-15', '2025-11-10'],

    // Sofía (coacheeIds[3]) - 3 metas completadas
    [coacheeIds[3], coachIds[6], 'Descubrir mis valores fundamentales',
      'A través de ejercicios de coaching, identificar mis 5 valores fundamentales de vida.',
      'Desarrollo Personal', 'completada', 100, '2025-05-31', '2025-05-25'],
    [coacheeIds[3], coachIds[6], 'Definir mi visión de vida a 5 años',
      'Crear un mapa de vida claro con metas en lo personal, profesional y espiritual.',
      'Desarrollo Personal', 'completada', 100, '2025-08-31', '2025-08-20'],
    [coacheeIds[3], coachIds[1], 'Mejorar autoestima y confianza',
      'Desarrollar una imagen positiva de mí misma y superar el síndrome del impostor.',
      'Bienestar', 'completada', 100, '2025-12-15', '2025-12-10'],

    // Joaquín (coacheeIds[4]) - 4 metas completadas
    [coacheeIds[4], coachIds[1], 'Establecer límites laborales',
      'Dejar de trabajar más de 8 horas diarias y aprender a decir que no.',
      'Bienestar', 'completada', 100, '2025-04-30', '2025-04-22'],
    [coacheeIds[4], coachIds[1], 'Rutina de ejercicio matutina',
      'Establecer una rutina de ejercicio de 45 minutos cada mañana antes del trabajo.',
      'Bienestar', 'completada', 100, '2025-06-30', '2025-06-28'],
    [coacheeIds[4], coachIds[4], 'Mejorar alimentación',
      'Adoptar un plan de alimentación saludable con menú semanal y prep de comidas.',
      'Bienestar', 'completada', 100, '2025-09-30', '2025-09-20'],
    [coacheeIds[4], coachIds[8], 'Práctica diaria de meditación',
      'Incorporar 20 minutos de meditación mindfulness cada día como hábito permanente.',
      'Bienestar', 'completada', 100, '2025-12-31', '2025-12-28'],

    // Florencia (coacheeIds[5]) - 4 metas completadas
    [coacheeIds[5], coachIds[9], 'Completar primera maratón',
      'Entrenar y completar mi primera maratón de 42km en bajo 4 horas 30 minutos.',
      'Deportivo', 'completada', 100, '2025-06-15', '2025-06-12'],
    [coacheeIds[5], coachIds[9], 'Mejorar resistencia mental',
      'Desarrollar técnicas de fortaleza mental para competencias de larga duración.',
      'Deportivo', 'completada', 100, '2025-08-31', '2025-08-28'],
    [coacheeIds[5], coachIds[4], 'Plan nutricional deportivo',
      'Implementar un plan de nutrición deportiva personalizado para alto rendimiento.',
      'Bienestar', 'completada', 100, '2025-10-31', '2025-10-25'],
    [coacheeIds[5], coachIds[9], 'Clasificar a campeonato nacional',
      'Lograr la marca mínima para clasificar al campeonato nacional de atletismo.',
      'Deportivo', 'completada', 100, '2025-12-15', '2025-12-10'],

    // Tomás (coacheeIds[6]) - 4 metas completadas
    [coacheeIds[6], coachIds[5], 'Eliminar deudas personales',
      'Crear un plan agresivo de pago de deudas y eliminar todas en 6 meses.',
      'Financiero', 'completada', 100, '2025-06-30', '2025-06-25'],
    [coacheeIds[6], coachIds[5], 'Fondo de emergencia de 6 meses',
      'Ahorrar el equivalente a 6 meses de gastos como colchón financiero.',
      'Financiero', 'completada', 100, '2025-10-31', '2025-10-28'],
    [coacheeIds[6], coachIds[7], 'Diversificar fuentes de ingreso',
      'Crear 2 fuentes adicionales de ingreso pasivo además de mi trabajo freelance.',
      'Financiero', 'completada', 100, '2026-01-31', '2026-01-20'],
    [coacheeIds[6], coachIds[5], 'Primer inversión en bolsa',
      'Aprender sobre inversiones y hacer mi primer portafolio diversificado.',
      'Financiero', 'completada', 100, '2026-02-28', '2026-02-22'],

    // Isabella (coacheeIds[7]) - 4 metas completadas
    [coacheeIds[7], coachIds[8], 'Sistema de productividad personal',
      'Implementar GTD (Getting Things Done) adaptado a mi vida como mamá emprendedora.',
      'Productividad', 'completada', 100, '2025-05-31', '2025-05-28'],
    [coacheeIds[7], coachIds[8], 'Automatizar procesos del negocio',
      'Identificar y automatizar 5 procesos repetitivos de mi emprendimiento.',
      'Productividad', 'completada', 100, '2025-08-15', '2025-08-10'],
    [coacheeIds[7], coachIds[6], 'Mejorar relación de pareja',
      'Dedicar tiempo de calidad con mi pareja y mejorar la comunicación.',
      'Relaciones', 'completada', 100, '2025-10-31', '2025-10-25'],
    [coacheeIds[7], coachIds[8], 'Delegar tareas del hogar',
      'Crear un sistema de responsabilidades compartidas en el hogar.',
      'Productividad', 'completada', 100, '2025-12-31', '2025-12-20'],

    // Nicolás (coacheeIds[8]) - 4 metas completadas
    [coacheeIds[8], coachIds[3], 'Liderar proyecto cross-funcional',
      'Asumir el liderazgo de un proyecto que involucre 3 equipos diferentes.',
      'Liderazgo', 'completada', 100, '2025-06-30', '2025-06-22'],
    [coacheeIds[8], coachIds[3], 'Mentoría con CTO actual',
      'Establecer una relación de mentoría semanal con el CTO de mi empresa.',
      'Liderazgo', 'completada', 100, '2025-09-30', '2025-09-25'],
    [coacheeIds[8], coachIds[0], 'Presentar en conferencia tech',
      'Preparar y dar una charla en una conferencia de tecnología sobre arquitectura.',
      'Carrera', 'completada', 100, '2025-11-30', '2025-11-15'],
    [coacheeIds[8], coachIds[3], 'Diseñar arquitectura de microservicios',
      'Liderar el diseño e implementación de migración a microservicios.',
      'Carrera', 'completada', 100, '2026-01-31', '2026-01-28'],

    // Valeria (coacheeIds[9]) - 3 metas completadas
    [coacheeIds[9], coachIds[4], 'Explorar nuevas carreras',
      'Investigar 5 carreras alternativas y hacer job shadowing en cada una.',
      'Carrera', 'completada', 100, '2025-07-31', '2025-07-25'],
    [coacheeIds[9], coachIds[2], 'Curso de diseño UX/UI',
      'Completar un bootcamp de diseño UX/UI como posible nueva carrera.',
      'Carrera', 'completada', 100, '2025-11-30', '2025-11-20'],
    [coacheeIds[9], coachIds[10], 'Crear portafolio creativo',
      'Diseñar un portafolio profesional con 5 proyectos de UX/UI completos.',
      'Carrera', 'completada', 100, '2026-02-15', '2026-02-10'],

    // Rodrigo (coacheeIds[10]) - 3 metas completadas
    [coacheeIds[10], coachIds[1], 'Reducir horas de guardia',
      'Negociar con el hospital una reducción de guardias nocturnas del 40%.',
      'Bienestar', 'completada', 100, '2025-06-30', '2025-06-20'],
    [coacheeIds[10], coachIds[4], 'Programa de wellness médico',
      'Implementar rutinas de autocuidado específicas para profesionales de salud.',
      'Bienestar', 'completada', 100, '2025-09-30', '2025-09-22'],
    [coacheeIds[10], coachIds[8], 'Técnicas de manejo del estrés',
      'Aprender y practicar 5 técnicas de manejo de estrés para profesionales de alta presión.',
      'Bienestar', 'completada', 100, '2025-12-31', '2025-12-18'],

    // Camila H (coacheeIds[11]) - 3 metas completadas
    [coacheeIds[11], coachIds[10], 'Definir identidad de marca',
      'Crear la identidad visual y estrategia de marca para mi futura agencia creativa.',
      'Emprendimiento', 'completada', 100, '2025-07-31', '2025-07-20'],
    [coacheeIds[11], coachIds[7], 'Conseguir primeros 5 clientes recurrentes',
      'Implementar estrategia de ventas para conseguir 5 clientes con contratos mensuales.',
      'Emprendimiento', 'completada', 100, '2025-11-30', '2025-11-25'],
    [coacheeIds[11], coachIds[5], 'Estructura financiera del negocio',
      'Separar finanzas personales y del negocio, crear presupuesto operativo.',
      'Financiero', 'completada', 100, '2026-01-31', '2026-01-15'],
  ];

  const metaCompletadaIds = [];
  for (const m of metasCompletadas) {
    const result = insertMeta.run(...m);
    metaCompletadaIds.push(result.lastInsertRowid);
  }

  // --- 10 METAS ACTIVAS (en proceso / pendientes) ---
  const metasActivas = [
    [coacheeIds[0], coachIds[0], 'Obtener certificación PMP',
      'Prepararme y aprobar el examen de Project Management Professional para validar mi experiencia.',
      'Carrera', 'activa', 45, '2026-06-30', null],
    [coacheeIds[1], coachIds[7], 'Internacionalizar la startup',
      'Expandir operaciones a 3 países de Latinoamérica en los próximos 6 meses.',
      'Emprendimiento', 'activa', 30, '2026-09-01', null],
    [coacheeIds[2], coachIds[2], 'Ascender a Senior PM',
      'Demostrar competencias para ser promovido a Senior Product Manager en mi empresa.',
      'Carrera', 'activa', 60, '2026-05-15', null],
    [coacheeIds[3], coachIds[6], 'Iniciar emprendimiento social',
      'Lanzar una ONG enfocada en educación tecnológica para jóvenes de bajos recursos.',
      'Desarrollo Personal', 'activa', 25, '2026-07-31', null],
    [coacheeIds[4], coachIds[1], 'Correr mi primer medio maratón',
      'Prepararme física y mentalmente para completar un medio maratón en menos de 2 horas.',
      'Bienestar', 'activa', 50, '2026-05-30', null],
    [coacheeIds[5], coachIds[9], 'Completar primer triatlón Ironman',
      'Entrenar para completar un Ironman 70.3 en menos de 6 horas.',
      'Deportivo', 'activa', 35, '2026-12-01', null],
    [coacheeIds[6], coachIds[5], 'Comprar mi primer departamento',
      'Ahorrar para el enganche y calificar para un crédito hipotecario.',
      'Financiero', 'activa', 40, '2026-12-31', null],
    [coacheeIds[8], coachIds[3], 'Ascender a CTO',
      'Ser promovido a CTO de mi empresa actual demostrando liderazgo técnico y de negocios.',
      'Liderazgo', 'activa', 55, '2026-12-31', null],
    [coacheeIds[10], coachIds[11], 'Escribir libro sobre salud mental médica',
      'Escribir y publicar un libro sobre salud mental y burnout en profesionales de la salud.',
      'Desarrollo Personal', 'activa', 20, '2026-10-31', null],
    [coacheeIds[11], coachIds[10], 'Contratar primer equipo de 3 personas',
      'Reclutar, contratar y onboardear a mi primer equipo para la agencia creativa.',
      'Emprendimiento', 'activa', 15, '2026-08-31', null],
  ];

  const metaActivaIds = [];
  for (const m of metasActivas) {
    const result = insertMeta.run(...m);
    metaActivaIds.push(result.lastInsertRowid);
  }

  // =====================
  // INSERT SESSIONS
  // =====================
  const insertSession = db.prepare(`
    INSERT INTO sesiones (meta_id, coach_id, coachee_id, titulo, fecha, duracion, estado, grow_goal, grow_reality, grow_options, grow_will)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sessions = [
    // Sesiones completadas para metas completadas
    [metaCompletadaIds[0], coachIds[0], coacheeIds[0], 'Sesión 1 - Descubrimiento de liderazgo', '2025-04-10 10:00', 60, 'completada',
      'Identificar mi estilo de liderazgo actual.', 'Lidero de forma directiva, equipo dependiente.', 'Curso de liderazgo, delegación, feedback', 'Conversación individual con cada miembro del equipo.'],
    [metaCompletadaIds[0], coachIds[0], coacheeIds[0], 'Sesión 2 - Plan de delegación', '2025-04-24 10:00', 60, 'completada',
      'Crear plan de delegación efectiva.', 'Delego poco, todo pasa por mí.', 'Matriz de delegación, empoderar líderes.', 'Delegar 3 tareas importantes esta semana.'],
    [metaCompletadaIds[4], coachIds[7], coacheeIds[1], 'Sesión 1 - Validación idea startup', '2025-03-12 14:00', 60, 'completada',
      'Validar idea de negocio en el mercado.', 'Idea sin validar, sin clientes.', 'Entrevistas, landing page, análisis competencia.', 'Realizar 10 entrevistas esta semana.'],
    [metaCompletadaIds[8], coachIds[2], coacheeIds[2], 'Sesión 1 - Plan transición a tech', '2025-03-05 09:00', 60, 'completada',
      'Crear roadmap de transición profesional.', '8 años en finanzas, quiero ser PM.', 'Bootcamp, certificación, networking, proyectos.', 'Inscribirme en curso de PM esta semana.'],
    [metaCompletadaIds[15], coachIds[1], coacheeIds[4], 'Sesión 1 - Límites laborales', '2025-03-08 16:00', 60, 'completada',
      'Establecer límites claros en el trabajo.', 'Trabajo 12 horas, sin ejercicio, poco familia.', 'Horario fijo, bloquear tiempo, rutina mañana.', 'Salir del trabajo a las 18:00 mañana.'],
    [metaCompletadaIds[19], coachIds[9], coacheeIds[5], 'Sesión 1 - Preparación maratón', '2025-03-15 08:00', 60, 'completada',
      'Plan de entrenamiento para primera maratón.', 'Corro 10km sin problema, nunca 42km.', 'Plan progresivo, coach corredor, nutrición.', 'Correr 15km este fin de semana.'],
    [metaCompletadaIds[23], coachIds[5], coacheeIds[6], 'Sesión 1 - Diagnóstico financiero', '2025-04-01 11:00', 60, 'completada',
      'Evaluar situación financiera actual.', 'Deudas de tarjeta, sin ahorros, gastos altos.', 'Presupuesto, método bola de nieve, ahorro.', 'Listar todas las deudas y gastos este fin de semana.'],
    [metaCompletadaIds[27], coachIds[8], coacheeIds[7], 'Sesión 1 - Sistema de productividad', '2025-04-05 15:00', 60, 'completada',
      'Encontrar sistema de productividad adecuado.', 'Caos total, sin sistema, todo urgente.', 'GTD, Pomodoro, time blocking, Eisenhower.', 'Implementar GTD básico esta semana.'],
    [metaCompletadaIds[31], coachIds[3], coacheeIds[8], 'Sesión 1 - Liderazgo técnico', '2025-04-20 11:00', 60, 'completada',
      'Desarrollar habilidades de liderazgo técnico.', 'Senior dev, fuerte técnico, débil en gestión.', 'Proyecto cross, mentoría CTO, cursos liderazgo.', 'Pedir liderar el próximo proyecto.'],

    // Sesiones para metas activas
    [metaActivaIds[0], coachIds[0], coacheeIds[0], 'Sesión 1 - Plan de certificación PMP', '2026-03-10 10:00', 60, 'completada',
      'Crear plan de estudio para PMP.', 'Experiencia como PM pero sin certificación.', 'Curso online, grupo de estudio, simulacros.', 'Inscribirme al curso de preparación PMP.'],
    [metaActivaIds[1], coachIds[7], coacheeIds[1], 'Sesión 1 - Estrategia de internacionalización', '2026-03-12 14:00', 60, 'completada',
      'Definir mercados y estrategia de expansión.', 'Operamos solo en Argentina, producto validado.', 'Chile, Colombia, México como mercados target.', 'Investigar regulaciones de Chile esta semana.'],
    [metaActivaIds[2], coachIds[2], coacheeIds[2], 'Sesión 1 - Roadmap a Senior PM', '2026-03-15 09:00', 60, 'programada',
      'Mapear competencias para Senior PM.', 'PM Jr con 1.5 años de experiencia.', 'Liderar producto end-to-end, métricas, stakeholders.', 'Pedir feedback a mi manager esta semana.'],
    [metaActivaIds[7], coachIds[3], coacheeIds[8], 'Sesión 1 - Camino a CTO', '2026-03-20 11:00', 60, 'programada',
      'Evaluar gap para posición de CTO.', 'Tech lead, lideré migración microservicios.', 'MBA, más gestión, presentaciones a board.', 'Agendar reunión con CEO para expresar interés.'],
  ];

  for (const s of sessions) {
    insertSession.run(...s);
  }

  // =====================
  // INSERT TESTIMONIALS
  // =====================
  const insertTestimonial = db.prepare(`
    INSERT INTO testimonios (coachee_id, coach_id, contenido, calificacion)
    VALUES (?, ?, ?, ?)
  `);

  const testimonials = [
    [coacheeIds[0], coachIds[0], 'María transformó mi manera de liderar. Gracias al método GROW, pude identificar exactamente dónde estaba y hacia dónde quería ir. Mi equipo ahora es más autónomo y motivado. ¡Gracias VamoArriba!', 5],
    [coacheeIds[1], coachIds[7], 'Sebastián me ayudó a convertir mi idea en un plan de acción concreto. Su experiencia con emprendedores fue invaluable. Ya estamos operando en 3 países.', 5],
    [coacheeIds[4], coachIds[1], 'Carlos me devolvió la vida. Literalmente. Estaba quemado del trabajo y gracias a sus sesiones encontré un equilibrio que no creía posible.', 5],
    [coacheeIds[5], coachIds[9], 'Andrés entiende perfectamente la mentalidad del deportista. Completé mi primera maratón y clasifiqué al nacional gracias a su guía.', 5],
    [coacheeIds[7], coachIds[8], 'Camila me enseñó que productividad no es hacer más, sino hacer mejor. Sus técnicas de mindfulness cambiaron mi vida como mamá emprendedora.', 5],
    [coacheeIds[8], coachIds[3], 'Roberto tiene una visión increíble sobre equipos. Gracias a él lideré la migración a microservicios y ahora voy camino a ser CTO.', 5],
    [coacheeIds[3], coachIds[6], 'Valentina me ayudó a encontrar claridad en un momento de mucha confusión. Encontré mis valores y ahora estoy lanzando una ONG.', 5],
    [coacheeIds[6], coachIds[5], 'Diego me abrió los ojos sobre mis finanzas. Eliminé todas mis deudas, tengo fondo de emergencia y ya invertí en bolsa. Increíble transformación.', 5],
    [coacheeIds[2], coachIds[2], 'Ana me guió en la transición más importante de mi vida profesional. De finanzas a tech en menos de 1 año. Ahora soy PM y amo mi trabajo.', 5],
    [coacheeIds[9], coachIds[4], 'Laura me ayudó a explorar opciones que nunca hubiera considerado. Ahora soy diseñadora UX/UI y estoy más feliz que nunca.', 4],
    [coacheeIds[10], coachIds[1], 'Carlos entendió perfectamente el burnout médico. Me ayudó a reducir guardias y crear rutinas de autocuidado. Soy mejor médico y mejor persona.', 5],
    [coacheeIds[11], coachIds[10], 'Patricia desbloqueó mi creatividad empresarial. Pasé de freelancer solitaria a dueña de agencia con 5 clientes recurrentes. Soñar en grande vale la pena.', 5],
    [coacheeIds[0], coachIds[3], 'Roberto me enseñó a manejar conflictos de equipo de manera constructiva. Las dinámicas que usamos fueron transformadoras.', 4],
    [coacheeIds[1], coachIds[5], 'Diego nos ayudó a estructurar las finanzas de la startup. Conseguimos nuestra primera ronda de inversión gracias a su mentoría financiera.', 5],
    [coacheeIds[7], coachIds[6], 'Valentina mejoró mi relación de pareja. La comunicación no violenta cambió nuestra dinámica familiar para siempre.', 5],
  ];

  for (const t of testimonials) {
    insertTestimonial.run(...t);
  }

  // =====================
  // INSERT RESOURCES
  // =====================
  const insertResource = db.prepare(`
    INSERT INTO recursos (autor_id, titulo, descripcion, tipo, contenido, categoria)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const resources = [
    [coachIds[0], 'Guía completa del Método GROW', 'Aprende paso a paso cómo aplicar el método GROW de la ICF en tus sesiones de coaching.', 'articulo',
      'El método GROW es el marco de coaching más utilizado en el mundo...', 'Coaching'],
    [coachIds[1], '10 Claves para el Bienestar Integral', 'Descubre las claves para lograr un equilibrio entre cuerpo, mente y espíritu.', 'articulo',
      'El bienestar integral requiere atención en múltiples dimensiones de tu vida...', 'Bienestar'],
    [coachIds[2], 'Cómo Reinventarte Profesionalmente', 'Guía práctica para hacer una transición de carrera exitosa a cualquier edad.', 'articulo',
      'Cambiar de carrera no es un salto al vacío, es un proceso estratégico...', 'Carrera'],
    [coachIds[5], 'Finanzas Personales para Emprendedores', 'Los fundamentos financieros que todo emprendedor debe dominar.', 'articulo',
      'Separar las finanzas personales de las del negocio es el primer paso...', 'Finanzas'],
    [coachIds[8], 'Mindfulness en 5 Minutos', 'Técnicas rápidas de mindfulness para cualquier momento del día.', 'articulo',
      'No necesitas horas de meditación para beneficiarte del mindfulness...', 'Mindfulness'],
    [coachIds[10], 'Desbloquea tu Creatividad', 'Ejercicios prácticos para estimular la creatividad y la innovación.', 'articulo',
      'La creatividad no es un don, es una habilidad que se entrena...', 'Creatividad'],
    [coachIds[11], 'Resiliencia en Tiempos de Cambio', 'Cómo fortalecer tu capacidad de adaptación ante la adversidad.', 'articulo',
      'La resiliencia es la capacidad de recuperarte más fuerte después de una crisis...', 'Desarrollo Personal'],
  ];

  for (const r of resources) {
    insertResource.run(...r);
  }

  // =====================
  // INSERT POSTS
  // =====================
  const insertPost = db.prepare(`
    INSERT INTO publicaciones (usuario_id, contenido, likes)
    VALUES (?, ?, ?)
  `);

  const posts = [
    [coachIds[0], 'Feliz de compartir que acabo de completar mi certificación MCC con la ICF! Después de más de 2500 horas de coaching. #CoachingICF #VamoArriba', 24],
    [coachIds[1], 'Hoy reflexionaba sobre lo poderosa que es una pregunta bien formulada. En coaching, no damos respuestas, hacemos las preguntas correctas.', 18],
    [coacheeIds[0], '4 metas completadas en coaching y los resultados son increíbles! Mi equipo está más motivado que nunca. Gracias @María González', 31],
    [coachIds[7], 'Tip para emprendedores: Antes de construir tu producto, habla con 100 personas. La validación es el primer paso hacia el éxito.', 22],
    [coacheeIds[4], 'Hoy salí del trabajo a las 6pm por primera vez en años. Completé todas mis metas de bienestar. Pequeños cambios, grandes transformaciones.', 45],
    [coachIds[3], 'Los equipos de alto rendimiento no nacen, se construyen. La clave está en la seguridad psicológica.', 15],
    [coachIds[9], 'El deporte te enseña que los límites están en la mente. He visto a coachees completar maratones que creían imposibles.', 20],
    [coacheeIds[7], 'Aprendí que no es sobre hacer más, sino sobre ser más consciente de lo que hago. 4 metas completadas gracias a @Camila Ruiz', 28],
    [coacheeIds[2], 'De financiero a Product Manager en 1 año. La transición más difícil y gratificante de mi vida. Gracias @Ana Martínez por guiarme.', 38],
    [coacheeIds[6], 'Deudas eliminadas, fondo de emergencia listo, primeras inversiones hechas. La libertad financiera es posible. Gracias @Diego López', 33],
    [coachIds[10], 'La creatividad no es inspiración divina. Es un músculo que se entrena todos los días con ejercicios intencionales. #CoachingCreativo', 16],
    [coacheeIds[11], 'De freelancer solitaria a dueña de agencia con 5 clientes recurrentes. Todo empezó con una sesión gratuita en VamoArriba.', 42],
  ];

  for (const p of posts) {
    insertPost.run(...p);
  }

  // =====================
  // INSERT CONNECTIONS
  // =====================
  const insertConnection = db.prepare(`
    INSERT INTO conexiones (usuario_id, conectado_id, estado)
    VALUES (?, ?, 'aceptada')
  `);

  for (let i = 0; i < coacheeIds.length; i++) {
    const coachId = coachIds[i % coachIds.length];
    insertConnection.run(coacheeIds[i], coachId);
  }

  // =====================
  // INSERT DEMO PAYMENTS
  // =====================
  const insertPago = db.prepare(`
    INSERT INTO pagos (usuario_id, coach_id, paquete_id, mp_payment_id, concepto, monto, estado, sesiones_totales, sesiones_usadas, metodo_pago, fecha_pago)
    VALUES (?, ?, ?, ?, ?, ?, 'completado', ?, ?, 'demo', ?)
  `);

  // Add some demo payments for coachees who have completed multiple goals
  insertPago.run(coacheeIds[0], coachIds[0], null, 'demo_1001', 'Sesiones con María González', 432, 6, 6, '2025-04-01');
  insertPago.run(coacheeIds[1], coachIds[7], null, 'demo_1002', 'Plan 9 Semanas con Sebastián Herrera', 612, 9, 9, '2025-03-01');
  insertPago.run(coacheeIds[4], coachIds[1], null, 'demo_1003', 'Plan 12 Semanas con Carlos Rodríguez', 768, 12, 12, '2025-03-01');
  insertPago.run(coacheeIds[5], coachIds[9], null, 'demo_1004', 'Plan 12 Semanas con Andrés Vargas', 768, 12, 12, '2025-03-01');
  insertPago.run(coacheeIds[6], coachIds[5], null, 'demo_1005', 'Plan 9 Semanas con Diego López', 612, 9, 9, '2025-04-01');
  insertPago.run(coacheeIds[8], coachIds[3], null, 'demo_1006', 'Plan 12 Semanas con Roberto Silva', 768, 12, 12, '2025-04-01');

  console.log('\nDatabase seeded successfully!');
  console.log(`- Admin: admin / admin1234`);
  console.log(`- ${coaches.length} Coaches created (password: coach123)`);
  console.log(`- ${coachees.length} Coachees created (password: user123)`);
  console.log(`- ${metasCompletadas.length} Completed goals created`);
  console.log(`- ${metasActivas.length} Active goals created`);
  console.log(`- ${sessions.length} Sessions created`);
  console.log(`- ${testimonials.length} Testimonials created`);
  console.log(`- ${resources.length} Resources created`);
  console.log(`- ${posts.length} Publications created`);
  console.log(`- 3 Pricing packages created`);
  console.log(`- 6 Demo payments created\n`);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
