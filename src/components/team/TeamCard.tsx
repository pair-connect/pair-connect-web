/* eslint-disable react/prop-types */
import { useState } from 'react';

interface TeamMember {
    name: string;
    role: string;
    avatar?: string;
    description?: string;
    githubUrl?: string;
    linkedinUrl?: string;
}

interface TeamCardProps {
    member: TeamMember;
}

const TeamCard = ({ member }: TeamCardProps) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [isImageModalOpen, setImageModalOpen] = useState(false);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    const openImageModal = () => setImageModalOpen(true);
    const closeImageModal = () => setImageModalOpen(false);

    return (
        <>
            <div className="relative w-full max-w-[600px] p-5 rounded-lg border border-[var(--color-dark-border)] text-[var(--color-light)] transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-cyan/20 hover:border-cyan/50 hover:scale-[1.02]" style={{ backgroundColor: 'var(--color-dark-card)', isolation: 'isolate' }}>
                {/* Iconos de redes sociales en la esquina superior derecha */}
                <div className="flex justify-end w-full gap-2 mb-4 relative" style={{ zIndex: 0 }}>
                    {member.githubUrl && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(member.githubUrl, '_blank');
                            }}
                            className="w-8 h-8 rounded-full bg-[var(--color-dark-border)] hover:opacity-80 hover:scale-110 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-gray-500/50 cursor-pointer relative"
                            style={{ zIndex: 0 }}
                            aria-label="GitHub"
                        >
                            <svg className="w-5 h-5 text-[var(--color-light)]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                        </button>
                    )}
                    {member.linkedinUrl && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(member.linkedinUrl, '_blank');
                            }}
                            className="w-8 h-8 rounded bg-blue-600 hover:bg-blue-700 hover:scale-110 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-blue-500/50 cursor-pointer relative"
                            style={{ zIndex: 0 }}
                            aria-label="LinkedIn"
                        >
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                        </button>
                    )}
                </div>

                {/* Contenido principal: avatar a la izquierda, nombre y rol a la derecha */}
                <div className="flex flex-row items-start gap-4">
                    <div className="shrink-0">
                        <img
                            src={member.avatar || "/photo_default_user.svg"}
                            alt={`Foto de perfil de ${member.name}`}
                            className="w-20 h-20 rounded-full object-cover border-2 border-[var(--color-dark-border)] cursor-pointer hover:border-cyan/50 transition-all duration-300"
                            onClick={openImageModal}
                        />
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-[var(--color-light)] mb-1 leading-tight text-left">{member.name}</h3>
                        <p className="text-sm text-[var(--color-gray-dark)] mb-3 font-normal text-left">{member.role}</p>
                        
                        {/* Descripción truncada */}
                        <div
                            className="text-sm text-[var(--color-light-secondary)] line-clamp-3 cursor-pointer hover:opacity-80 transition-colors duration-200 leading-relaxed text-left"
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal();
                            }}
                        >
                            <p className="font-sans text-left">{member.description || "Aquí va un pequeño sobre mí"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
                    onClick={closeModal}
                >
                    <div
                        className="max-w-lg w-full p-6 rounded-lg text-[var(--color-light)] shadow-xl border border-[var(--color-dark-border)]"
                        style={{ backgroundColor: 'var(--color-dark-card)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-[var(--color-gray-dark)] hover:text-[var(--color-light)] transition-colors"
                            aria-label="Cerrar"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="mb-4 text-xl font-bold text-center">{member.name}</h3>
                        <p className="text-sm sm:text-base text-[var(--color-light-secondary)] leading-relaxed">
                            {member.description || "Aquí va un pequeño sobre mí"}
                        </p>
                    </div>
                </div>
            )}

            {isImageModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                    onClick={closeImageModal}
                >
                    <img
                        src={member.avatar || "/photo_default_user.svg"}
                        alt={`Foto de perfil de ${member.name}`}
                        className="max-w-[80%] max-h-[80%] sm:max-w-[60%] sm:max-h-[60%] md:max-w-[50%] md:max-h-[50%] lg:max-w-[30%] lg:max-h-[40%] rounded-lg"
                    />
                </div>
            )}
        </>
    );
};

export default TeamCard;
