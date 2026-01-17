/**
 * ============================================
 * TEAM DATA - Team Members Information
 * ============================================
 * 
 * Datos escalables para la página "Equipo"
 * Incluye información de los miembros del equipo
 */

export interface TeamMember {
  name: string;
  role: string;
  description: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface TeamData {
  teamMembers: TeamMember[];
}

// Miembros del equipo
export const teamData: TeamData = {
  teamMembers: [
    {
      name: "Jessica Arroyo",
      role: "Full Stack Developer",
      description: "Desde siempre he sido una mente curiosa y creativa: el diseño gráfico y las manualidades han sido mi rincón especial. Hoy, mi enfoque está en el desarrollo web, donde fusiono creatividad con código. Mi superpoder es la paciencia, algo que me impulsa a mantener el entusiasmo frente a los desafíos del desarrollo y este increíble (y a veces caótico) mundo tecnológico. ¡Siempre lista para crear y enfrentar lo que venga!",
      githubUrl: "https://github.com/jess-ar",
      linkedinUrl: "https://www.linkedin.com/in/jessica-arroyo-lebron/"
    },
    {
      name: "Helena López",
      role: "Full Stack Developer",
      description: "Como desarrolladora web full-stack, mi enfoque está en crear soluciones tecnológicas que impacten de manera positiva en la vida de las personas. Me motiva dar respuesta a problemas reales y mejorar la experiencia de quienes utilizan las herramientas que construyo. Mi formación en áreas sociales y mi experiencia en la gestión de equipos me brindan una perspectiva única, permitiéndome entender las necesidades humanas desde un enfoque integral y colaborativo. Me adapto con facilidad a entornos cambiantes y disfruto el aprendizaje constante, siempre buscando innovar y aportar valor a través del trabajo en equipo.",
      githubUrl: "https://github.com/helopgom",
      linkedinUrl: "https://www.linkedin.com/in/helena-lopgom/"
    },
    {
      name: "Lynn Poh",
      role: "Full Stack Developer",
      description: "Soy una persona apasionada por la comunicación y atenta a los detalles, con experiencia en producción audiovisual y gestión de relaciones con aliados. Esta trayectoria me ha llevado a explorar el sector tecnológico con gran entusiasmo. Disfruto combinar mis habilidades comunicativas con mi pasión por resolver problemas de manera práctica, creando herramientas significativas y fáciles de usar. Estoy emocionada por recorrer este camino y aprovechar al máximo las oportunidades que ofrece.",
      githubUrl: "https://github.com/Dpoetess",
      linkedinUrl: "https://www.linkedin.com/in/lynn-poh/"
    }
  ]
};
