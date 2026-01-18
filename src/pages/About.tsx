import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, MessageCircle, Github, Linkedin, Code2, Users, Calendar, Zap } from 'lucide-react';
import { faqs, contactMethods, howItWorksSteps, pairProgrammingInfo } from '@/data/aboutData';
import { FAQ } from '@/data/aboutData';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

export const About: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'funcionalidad' | 'comunidad'>('all');

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      general: 'General',
      funcionalidad: 'Funcionalidad',
      comunidad: 'Comunidad'
    };
    return labels[category] || category;
  };

  const getContactIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      email: <Mail className="w-5 h-5" />,
      discord: <MessageCircle className="w-5 h-5" />,
      github: <Github className="w-5 h-5" />,
      linkedin: <Linkedin className="w-5 h-5" />,
      twitter: <MessageCircle className="w-5 h-5" />
    };
    return icons[type] || <Mail className="w-5 h-5" />;
  };

  const getStepIcon = (id: string) => {
    const icons: Record<string, React.ReactNode> = {
      '1': <Users className="w-6 h-6" />,
      '2': <Code2 className="w-6 h-6" />,
      '3': <Calendar className="w-6 h-6" />,
      '4': <Zap className="w-6 h-6" />
    };
    return icons[id] || <Code2 className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen">
      <SectionWrapper verticalPadding="py-12" maxWidth="max-w-6xl">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold gradient-text font-poppins mt-4 mb-6">
            Sobre Pair Connect
          </h1>
          <p className="text-xl text-[var(--color-light)] max-w-3xl mx-auto leading-relaxed">
            Una plataforma diseñada para conectar desarrolladores/as y facilitar el aprendizaje colaborativo a través del pair programming o programación en grupo.
          </p>
        </section>

        {/* How It Works Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 font-poppins text-[var(--color-light)]">
            ¿Cómo funciona Pair Connect?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, index) => (
              <div
                key={step.id}
                className="bg-[var(--color-dark-card)] rounded-lg p-6 border border-[var(--color-dark-border)] hover:border-[#4ad3e5] transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#4ad3e5]/20 flex items-center justify-center text-[#4ad3e5]">
                    {getStepIcon(step.id)}
                  </div>
                  <span className="text-2xl font-bold text-[#4ad3e5]">{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 font-poppins text-[var(--color-light)]">{step.title}</h3>
                <p className="text-[var(--color-light)]/80 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pair Programming Info */}
        <section className="mb-20 bg-[var(--color-dark-card)] rounded-lg p-8 border border-[var(--color-dark-border)]">
          <h2 className="text-3xl font-bold mb-6 font-poppins text-[var(--color-light)]">{pairProgrammingInfo.title}</h2>
          <p className="text-[var(--color-light)]/80 text-lg mb-6 leading-relaxed">
            {pairProgrammingInfo.description}
          </p>
          <div>
            <h3 className="text-xl font-bold mb-4 font-poppins text-[var(--color-light)]">Beneficios del Pair Programming:</h3>
            <ul className="grid md:grid-cols-2 gap-3">
              {pairProgrammingInfo.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-[#4ad3e5] mt-1">✓</span>
                  <span className="text-[var(--color-light)]/80">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-8 font-poppins text-[var(--color-light)]">
            Preguntas Frecuentes
          </h2>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {(['all', 'general', 'funcionalidad', 'comunidad'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#4ad3e5] text-[var(--color-dark-bg)]'
                    : 'bg-[var(--color-dark-card)] text-[var(--color-light)] border border-[var(--color-dark-border)] hover:border-[#4ad3e5]'
                }`}
              >
                {category === 'all' ? 'Todas' : getCategoryLabel(category)}
              </button>
            ))}
          </div>

          {/* FAQs List */}
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-[var(--color-dark-card)] rounded-lg border border-[var(--color-dark-border)] overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[var(--color-dark-card)]/80 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs px-2 py-1 rounded bg-[#4ad3e5]/20 text-[#4ad3e5]">
                        {getCategoryLabel(faq.category)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-poppins text-[var(--color-light)]">{faq.question}</h3>
                  </div>
                  <div className="ml-4 text-[#4ad3e5]">
                    {openFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>
                {openFaq === faq.id && (
                  <div className="px-6 pb-4">
                    <p className="text-[var(--color-light)]/80 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 font-poppins text-[var(--color-light)]">
            ¿Tienes dudas? Contáctanos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {contactMethods.map((contact) => (
              <a
                key={contact.id}
                href={contact.type === 'email' ? `mailto:${contact.value}` : contact.value}
                target={contact.type !== 'email' ? '_blank' : undefined}
                rel={contact.type !== 'email' ? 'noopener noreferrer' : undefined}
                className="bg-[var(--color-dark-card)] rounded-lg p-6 border border-[var(--color-dark-border)] hover:border-[#4ad3e5] transition-all hover:transform hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-3 text-[#4ad3e5]">
                  {getContactIcon(contact.type)}
                  <h3 className="text-lg font-bold font-poppins text-[var(--color-light)]">{contact.label}</h3>
                </div>
                <p className="text-[var(--color-light)]/80 text-sm mb-2 break-words">{contact.value}</p>
                {contact.description && (
                  <p className="text-[var(--color-light)]/70 text-xs break-words">{contact.description}</p>
                )}
              </a>
            ))}
          </div>
        </section>
      </SectionWrapper>
    </div>
  );
};
