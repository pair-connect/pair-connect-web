/**
 * ============================================
 * ABOUT DATA - FAQs and Contact Information
 * ============================================
 * 
 * Datos escalables para la página "Sobre Pair Connect"
 * Incluye FAQs, información de contacto y cómo funciona la plataforma
 */

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'funcionalidad' | 'tecnico' | 'comunidad';
}

export interface ContactMethod {
  id: string;
  type: 'email' | 'discord' | 'github' | 'linkedin' | 'twitter';
  label: string;
  value: string;
  icon?: string;
  description?: string;
}

export interface HowItWorksStep {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

// FAQs sobre Pair Connect
export const faqs: FAQ[] = [
  {
    id: '1',
    category: 'general',
    question: '¿Qué es Pair Connect?',
    answer: 'Pair Connect es una plataforma diseñada para conectar desarrolladores/as y facilitar sesiones de pair programming o programación en grupo. Permite crear proyectos, organizar sesiones colaborativas y encontrar compañeros/as de programación que compartan tus intereses tecnológicos.'
  },
  {
    id: '2',
    category: 'funcionalidad',
    question: '¿Cómo funciona Pair Connect?',
    answer: 'Pair Connect funciona en tres pasos simples: 1) Crea o únete a un proyecto que te interese, 2) Organiza o participa en sesiones de pair programming o programación en grupo programadas, 3) Conecta con otros/as desarrolladores/as y aprende colaborativamente. La plataforma te ayuda a encontrar compañeros/as con tu mismo stack tecnológico y nivel de experiencia.'
  },
  {
    id: '3',
    category: 'funcionalidad',
    question: '¿Necesito crear una cuenta para usar Pair Connect?',
    answer: 'Sí, necesitas crear una cuenta gratuita para participar en proyectos y sesiones. El registro es rápido y te permite personalizar tu perfil con tu stack tecnológico, nivel de experiencia y lenguajes de programación favoritos.'
  },
  {
    id: '4',
    category: 'funcionalidad',
    question: '¿Puedo crear mis propios proyectos?',
    answer: '¡Por supuesto! Puedes crear proyectos propios, definir el stack tecnológico, nivel requerido y organizar sesiones de pair programming o programación en grupo. También puedes unirte a proyectos existentes que te interesen.'
  },
  {
    id: '5',
    category: 'funcionalidad',
    question: '¿Cómo me uno a una sesión de pair programming o programación en grupo?',
    answer: 'Simplemente navega por los proyectos disponibles, encuentra una sesión que te interese y haz clic en "Unirse". El/la organizador/a de la sesión recibirá tu solicitud y podrás participar si hay espacio disponible.'
  },
  {
    id: '7',
    category: 'general',
    question: '¿Pair Connect es gratuito?',
    answer: 'Sí, Pair Connect es completamente gratuito. Nuestro objetivo es facilitar el aprendizaje colaborativo y la conexión entre developers sin barreras económicas.'
  },
  {
    id: '8',
    category: 'comunidad',
    question: '¿Cómo puedo contribuir al proyecto?',
    answer: 'Pair Connect es un proyecto open source. Puedes contribuir reportando bugs, sugiriendo mejoras, o contribuyendo código en nuestro repositorio de GitHub. También puedes ayudar compartiendo la plataforma con otros developers.'
  },
  {
    id: '9',
    category: 'funcionalidad',
    question: '¿Puedo usar Pair Connect para proyectos profesionales?',
    answer: 'Pair Connect está diseñado principalmente para aprendizaje y práctica colaborativa. Puedes usarlo para proyectos personales, de aprendizaje, o para practicar antes de proyectos profesionales. La plataforma fomenta un ambiente educativo y colaborativo.'
  },
  {
    id: '10',
    category: 'comunidad',
    question: '¿Hay algún código de conducta?',
    answer: 'Sí, Pair Connect promueve un ambiente respetuoso, inclusivo y colaborativo. Esperamos que todos los usuarios traten a los demás con respeto, sean pacientes con diferentes niveles de experiencia y contribuyan positivamente a la comunidad.'
  }
];

// Métodos de contacto
export const contactMethods: ContactMethod[] = [
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    value: 'pairconnect@mail.com',
    description: 'Escríbenos para dudas, sugerencias o soporte'
  },
  {
    id: 'discord',
    type: 'discord',
    label: 'Discord',
    value: 'https://discord.gg/pairconnect',
    description: 'Únete a nuestra comunidad en Discord'
  },
  {
    id: 'github',
    type: 'github',
    label: 'GitHub',
    value: 'https://github.com/pair-connect',
    description: 'Contribuye o reporta issues en GitHub'
  },
  {
    id: 'linkedin',
    type: 'linkedin',
    label: 'LinkedIn',
    value: 'https://linkedin.com/company/pairconnect',
    description: 'Síguenos en LinkedIn para actualizaciones'
  }
];

// Pasos de cómo funciona Pair Connect
export const howItWorksSteps: HowItWorksStep[] = [
  {
    id: '1',
    title: 'Crea tu perfil',
    description: 'Regístrate y completa tu perfil con tu stack tecnológico, nivel de experiencia y lenguajes de programación favoritos. Esto ayuda a otros developers a encontrarte y a que encuentres proyectos que se ajusten a tus intereses.'
  },
  {
    id: '2',
    title: 'Explora proyectos',
    description: 'Navega por proyectos creados por otros developers o crea el tuyo propio. Filtra por tecnologías, nivel de experiencia o tipo de proyecto. Cada proyecto tiene su descripción, stack tecnológico y sesiones programadas.'
  },
  {
    id: '3',
    title: 'Únete a sesiones',
    description: 'Participa en sesiones de pair programming o programación en grupo programadas. Puedes unirte a sesiones existentes o crear las tuyas propias. Las sesiones tienen un límite de participantes para mantener un ambiente colaborativo efectivo.'
  },
  {
    id: '4',
    title: 'Conecta y aprende',
    description: 'Trabaja colaborativamente con otros/as desarrolladores/as, comparte conocimiento y aprende nuevas técnicas. Pair Connect facilita la conexión entre desarrolladores/as con intereses similares para crear una comunidad de aprendizaje.'
  }
];

// Información sobre Pair Programming
export const pairProgrammingInfo = {
  title: '¿Qué es el Pair Programming?',
  description: 'El pair programming es una técnica de desarrollo de software donde dos o más desarrolladores/as trabajan juntos/as en una misma estación de trabajo. En pareja, uno/a actúa como "driver" (escribe el código) mientras el/la otro/a actúa como "navigator" (revisa el código y sugiere mejoras). También puede realizarse en grupo, donde varios/as participantes colaboran en el mismo código.',
  benefits: [
    'Mejora la calidad del código mediante revisión continua',
    'Facilita el intercambio de conocimiento entre desarrolladores/as',
    'Reduce errores y bugs mediante la revisión en tiempo real',
    'Acelera el aprendizaje de nuevas tecnologías y técnicas',
    'Fomenta la colaboración y el trabajo en equipo',
    'Ayuda a mantener el enfoque y la productividad'
  ]
};
