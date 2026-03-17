const db = require('./database');
const bcrypt = require('bcryptjs');

const hash = (pw) => bcrypt.hashSync(pw, 10);

console.log('Seeding database...');

// Clear existing data
db.exec(`
  DELETE FROM notificaciones;
  DELETE FROM conexiones;
  DELETE FROM likes;
  DELETE FROM comentarios;
  DELETE FROM publicaciones;
  DELETE FROM testimonios;
  DELETE FROM recursos;
  DELETE FROM sesiones;
  DELETE FROM metas;
  DELETE FROM mensajes;
  DELETE FROM usuarios;
`);

// Insert Admin
const insertUser = db.prepare(`
  INSERT INTO usuarios (nombre, apellido, email, password, rol, bio, especialidad, certificacion, telefono, pais, ciudad, linkedin)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const adminId = insertUser.run('Admin', 'VamoArriba', 'admin', hash('admin1234'), 'admin',
  'Administrador de la plataforma VamoArriba', 'Administración', 'Admin', '+598 99 000 000', 'Uruguay', 'Montevideo', '').lastInsertRowid;

// Insert 10 Coaches
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
];

const coachIds = [];
for (const c of coaches) {
  const result = insertUser.run(...c);
  coachIds.push(result.lastInsertRowid);
}

// Insert 10 Coachees
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
];

const coacheeIds = [];
for (const c of coachees) {
  const result = insertUser.run(...c);
  coacheeIds.push(result.lastInsertRowid);
}

// Insert 10 Metas (Goals)
const insertMeta = db.prepare(`
  INSERT INTO metas (usuario_id, coach_id, titulo, descripcion, categoria, estado, progreso, fecha_objetivo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const metas = [
  [coacheeIds[0], coachIds[0], 'Desarrollar liderazgo transformacional',
    'Convertirme en un líder que inspire y motive a mi equipo, mejorando la comunicación y empatía.',
    'Liderazgo', 'activa', 45, '2026-06-30'],
  [coacheeIds[1], coachIds[7], 'Lanzar mi startup en 6 meses',
    'Definir modelo de negocio, validar mercado y lanzar MVP de mi aplicación tecnológica.',
    'Emprendimiento', 'activa', 30, '2026-09-01'],
  [coacheeIds[2], coachIds[2], 'Transición exitosa al sector tech',
    'Conseguir mi primer puesto como Product Manager en una empresa tecnológica.',
    'Carrera', 'activa', 60, '2026-05-15'],
  [coacheeIds[3], coachIds[6], 'Encontrar mi propósito de vida',
    'Explorar mis valores, pasiones y fortalezas para definir mi rumbo profesional y personal.',
    'Desarrollo Personal', 'activa', 25, '2026-07-31'],
  [coacheeIds[4], coachIds[1], 'Lograr equilibrio vida-trabajo',
    'Establecer límites saludables, rutinas de bienestar y tiempo de calidad con mi familia.',
    'Bienestar', 'activa', 50, '2026-04-30'],
  [coacheeIds[5], coachIds[9], 'Completar mi primer triatlón',
    'Prepararme física y mentalmente para completar un triatlón olímpico en diciembre.',
    'Deportivo', 'activa', 35, '2026-12-01'],
  [coacheeIds[6], coachIds[5], 'Libertad financiera en 2 años',
    'Crear un plan financiero sólido, eliminar deudas y construir fuentes de ingreso pasivo.',
    'Financiero', 'activa', 20, '2028-03-01'],
  [coacheeIds[7], coachIds[8], 'Gestión consciente del tiempo',
    'Implementar rutinas de productividad mindful que me permitan ser mamá y emprendedora.',
    'Productividad', 'activa', 40, '2026-06-15'],
  [coacheeIds[8], coachIds[3], 'Ascender a CTO en mi empresa',
    'Desarrollar competencias técnicas y de liderazgo necesarias para el rol de CTO.',
    'Liderazgo', 'activa', 55, '2026-12-31'],
  [coacheeIds[9], coachIds[4], 'Reinvención profesional completa',
    'Explorar nuevas oportunidades, desarrollar nuevas habilidades y encontrar mi nueva vocación.',
    'Carrera', 'activa', 15, '2026-08-31'],
];

const metaIds = [];
for (const m of metas) {
  const result = insertMeta.run(...m);
  metaIds.push(result.lastInsertRowid);
}

// Insert Sessions (GROW method)
const insertSession = db.prepare(`
  INSERT INTO sesiones (meta_id, coach_id, coachee_id, titulo, fecha, duracion, estado, grow_goal, grow_reality, grow_options, grow_will)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const sessions = [
  [metaIds[0], coachIds[0], coacheeIds[0], 'Sesión de descubrimiento - Liderazgo', '2026-03-10 10:00', 60, 'completada',
    'Identificar mi estilo de liderazgo actual y definir el líder que quiero ser.',
    'Actualmente lidero de forma directiva, mi equipo depende mucho de mis instrucciones.',
    '1. Curso de liderazgo transformacional\n2. Practicar delegación progresiva\n3. Sesiones de feedback con el equipo',
    'Esta semana tendré una conversación individual con cada miembro del equipo para conocer sus necesidades.'],
  [metaIds[1], coachIds[7], coacheeIds[1], 'Validación de idea de negocio', '2026-03-12 14:00', 60, 'completada',
    'Validar si mi idea de startup tiene mercado real y definir el MVP.',
    'Tengo la idea pero no he hablado con potenciales clientes todavía.',
    '1. Entrevistas a 20 usuarios potenciales\n2. Landing page de prueba\n3. Análisis de competencia',
    'Realizaré 5 entrevistas esta semana y crearé un formulario de interés online.'],
  [metaIds[2], coachIds[2], coacheeIds[2], 'Plan de transición profesional', '2026-03-15 09:00', 60, 'programada',
    'Crear un plan detallado para mi transición de finanzas a Product Management.',
    'Tengo 8 años en finanzas, conocimiento básico de metodologías ágiles.',
    '1. Certificación en Product Management\n2. Proyectos voluntarios en tech\n3. Networking en comunidades PM',
    'Inscribirme en curso de PM esta semana y actualizar mi LinkedIn.'],
  [metaIds[4], coachIds[1], coacheeIds[4], 'Primera sesión - Equilibrio vital', '2026-03-08 16:00', 60, 'completada',
    'Definir qué significa equilibrio para mí y establecer prioridades claras.',
    'Trabajo 12 horas diarias, no hago ejercicio y veo poco a mi familia.',
    '1. Establecer horario fijo de salida\n2. Bloquear tiempo familiar\n3. Rutina de ejercicio matutina',
    'Mañana saldré del trabajo a las 18:00 y dedicaré la noche a mi familia.'],
  [metaIds[8], coachIds[3], coacheeIds[8], 'Sesión de coaching - Ruta a CTO', '2026-03-20 11:00', 60, 'programada',
    'Mapear las competencias necesarias para CTO y mi gap actual.',
    'Soy senior developer, tengo habilidades técnicas pero me falta experiencia en gestión.',
    '1. Liderar un proyecto cross-funcional\n2. Mentoría con el CTO actual\n3. MBA ejecutivo',
    'Pediré liderar el próximo proyecto importante del equipo.'],
];

for (const s of sessions) {
  insertSession.run(...s);
}

// Insert Testimonials
const insertTestimonial = db.prepare(`
  INSERT INTO testimonios (coachee_id, coach_id, contenido, calificacion)
  VALUES (?, ?, ?, ?)
`);

const testimonials = [
  [coacheeIds[0], coachIds[0], 'María transformó mi manera de liderar. Gracias al método GROW, pude identificar exactamente dónde estaba y hacia dónde quería ir. Mi equipo ahora es más autónomo y motivado. ¡Gracias VamoArriba!', 5],
  [coacheeIds[1], coachIds[7], 'Sebastián me ayudó a convertir mi idea en un plan de acción concreto. Su experiencia con emprendedores fue invaluable. Ya estoy en fase de validación de mi MVP.', 5],
  [coacheeIds[4], coachIds[1], 'Carlos me devolvió la vida. Literalmente. Estaba quemado del trabajo y gracias a sus sesiones encontré un equilibrio que no creía posible. Mi familia y yo estamos más felices.', 5],
  [coacheeIds[5], coachIds[9], 'Andrés entiende perfectamente la mentalidad del deportista. Con su guía estoy superando mis propios límites y preparándome para mi primer triatlón con confianza.', 5],
  [coacheeIds[7], coachIds[8], 'Camila me enseñó que productividad no es hacer más, sino hacer mejor. Sus técnicas de mindfulness cambiaron mi relación con el tiempo. Ahora soy mejor mamá y mejor emprendedora.', 5],
  [coacheeIds[8], coachIds[3], 'Roberto tiene una visión increíble sobre dinámica de equipos. Me está preparando no solo técnicamente sino como líder. El camino a CTO se ve mucho más claro ahora.', 4],
  [coacheeIds[3], coachIds[6], 'Valentina me ayudó a encontrar claridad en un momento de mucha confusión. Sus preguntas poderosas del método GROW me hicieron reflexionar profundamente sobre mis valores.', 5],
  [coacheeIds[6], coachIds[5], 'Diego me abrió los ojos sobre mis finanzas. Ya no vivo al día, tengo un plan claro y estoy construyendo mi camino hacia la libertad financiera. Recomendado 100%.', 5],
];

for (const t of testimonials) {
  insertTestimonial.run(...t);
}

// Insert Resources
const insertResource = db.prepare(`
  INSERT INTO recursos (autor_id, titulo, descripcion, tipo, contenido, categoria)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const resources = [
  [coachIds[0], 'Guía completa del Método GROW', 'Aprende paso a paso cómo aplicar el método GROW de la ICF en tus sesiones de coaching.', 'articulo',
    'El método GROW es el marco de coaching más utilizado en el mundo. Desarrollado por Sir John Whitmore, consta de cuatro fases:\n\n**G - Goal (Meta):** ¿Qué quieres lograr? Define tu objetivo de manera SMART.\n\n**R - Reality (Realidad):** ¿Dónde estás ahora? Evalúa tu situación actual con honestidad.\n\n**O - Options (Opciones):** ¿Qué podrías hacer? Explora todas las alternativas posibles.\n\n**W - Will (Voluntad/Compromiso):** ¿Qué vas a hacer? Define acciones concretas con plazos.', 'Coaching'],
  [coachIds[1], '10 Claves para el Bienestar Integral', 'Descubre las claves fundamentales para lograr un equilibrio entre cuerpo, mente y espíritu.', 'articulo',
    'El bienestar integral requiere atención en múltiples dimensiones de tu vida...', 'Bienestar'],
  [coachIds[2], 'Cómo Reinventarte Profesionalmente', 'Guía práctica para hacer una transición de carrera exitosa a cualquier edad.', 'articulo',
    'Cambiar de carrera no es un salto al vacío, es un proceso estratégico que puedes planificar...', 'Carrera'],
  [coachIds[5], 'Finanzas Personales para Emprendedores', 'Los fundamentos financieros que todo emprendedor debe dominar.', 'articulo',
    'Separar las finanzas personales de las del negocio es el primer paso hacia la salud financiera...', 'Finanzas'],
  [coachIds[8], 'Mindfulness en 5 Minutos', 'Técnicas rápidas de mindfulness que puedes practicar en cualquier momento del día.', 'articulo',
    'No necesitas horas de meditación para beneficiarte del mindfulness. Estas 5 técnicas rápidas te ayudarán...', 'Mindfulness'],
];

for (const r of resources) {
  insertResource.run(...r);
}

// Insert some posts (social feed)
const insertPost = db.prepare(`
  INSERT INTO publicaciones (usuario_id, contenido, likes)
  VALUES (?, ?, ?)
`);

const posts = [
  [coachIds[0], '¡Feliz de compartir que acabo de completar mi certificación MCC con la ICF! 🎓 Después de más de 2500 horas de coaching, este logro representa años de dedicación. Gracias a todos mis coachees que confiaron en mí. #CoachingICF #VamoArriba', 24],
  [coachIds[1], 'Hoy reflexionaba sobre lo poderosa que es una pregunta bien formulada. En coaching, no damos respuestas, hacemos las preguntas correctas. ¿Cuál fue la última pregunta que cambió tu perspectiva? 💭', 18],
  [coacheeIds[0], '¡3 meses de coaching y los resultados son increíbles! Mi equipo está más motivado que nunca y aprendí que liderar no es controlar, es inspirar. Gracias @María González #LiderazgoTransformacional', 31],
  [coachIds[7], 'Tip para emprendedores: Antes de construir tu producto, habla con 100 personas que tengan el problema que quieres resolver. La validación es el primer paso hacia el éxito. 🚀 #Emprendimiento', 22],
  [coacheeIds[4], 'Hoy salí del trabajo a las 6pm por primera vez en años. Cenamos en familia y jugué con mis hijos. Pequeños cambios, grandes transformaciones. Gracias a mi coach Carlos. #Equilibrio #VamoArriba', 45],
  [coachIds[3], 'Los equipos de alto rendimiento no nacen, se construyen. La clave está en la seguridad psicológica: cuando las personas se sienten seguras para ser vulnerables, la magia sucede. ✨', 15],
  [coachIds[9], 'El deporte te enseña que los límites están en la mente. He visto a coachees superar barreras que creían imposibles simplemente cambiando su diálogo interno. 💪 #MentalidadGanadora', 20],
  [coacheeIds[7], 'Aprendí que no es sobre hacer más, sino sobre ser más consciente de lo que hago. El mindfulness cambió mi productividad y mi relación con mis hijos. Gracias @Camila Ruiz 🙏', 28],
];

for (const p of posts) {
  insertPost.run(...p);
}

// Create connections between users
const insertConnection = db.prepare(`
  INSERT INTO conexiones (usuario_id, conectado_id, estado)
  VALUES (?, ?, 'aceptada')
`);

for (let i = 0; i < coacheeIds.length; i++) {
  const coachId = coachIds[i % coachIds.length];
  insertConnection.run(coacheeIds[i], coachId);
}

console.log('Database seeded successfully!');
console.log(`- Admin: admin / admin1234`);
console.log(`- 10 Coaches created (password: coach123)`);
console.log(`- 10 Coachees created (password: user123)`);
console.log(`- 10 Goals created`);
console.log(`- 5 Sessions created`);
console.log(`- 8 Testimonials created`);
console.log(`- 5 Resources created`);
console.log(`- 8 Publications created`);
