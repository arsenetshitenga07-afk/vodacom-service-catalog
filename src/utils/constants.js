/** Nombre maximum de documents par service (exigence du cahier des charges). */
export const MAX_DOCUMENTS = 4;

/** Taille maximale d'un document, en mégaoctets. */
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** Extensions acceptées pour les documents joints. */
export const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.md',
  '.csv',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.webp',
  '.drawio',
  '.vsdx',
];

export const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.join(',');

/** Suggestions proposées lors de la saisie de la stack technique. */
export const COMMON_TECHNOLOGIES = [
  'React',
  'Vue',
  'Angular',
  'Next.js',
  'Node.js',
  'NestJS',
  'Express',
  'Spring Boot',
  'Java',
  'Python',
  'Django',
  'FastAPI',
  'Laravel',
  'PHP',
  '.NET',
  'Go',
  'Flutter',
  'React Native',
  'PostgreSQL',
  'MySQL',
  'Oracle',
  'MongoDB',
  'Redis',
  'Kafka',
  'Docker',
  'Kubernetes',
  'Nginx',
  'AWS',
  'Azure',
  'TailwindCSS',
];

/** Durée d'inactivité (minutes) avant le verrouillage automatique, par défaut (modifiable dans les paramètres). */
export const LOCK_AFTER_MINUTES = 5;

/** Délais proposés dans les paramètres (0 = jamais). */
export const LOCK_DELAY_OPTIONS = [1, 5, 10, 15, 30, 0];

/** Nombre d'essais de mot de passe autorisés sur l'écran de verrouillage avant déconnexion. */
export const MAX_UNLOCK_ATTEMPTS = 5;

/** Code de vérification envoyé par e-mail à la connexion. */
export const OTP_LENGTH = 4;
export const OTP_TTL_MINUTES = 5;
export const OTP_RESEND_SECONDS = 30;

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  applications: '/applications',
  technologies: '/technologies',
  developers: '/developers',
  settings: '/settings',
};
