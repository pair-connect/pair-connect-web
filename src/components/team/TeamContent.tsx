/* eslint-disable react/prop-types */
interface TeamContentProps {
    onClick: () => void;
}

const TeamContent = ({ onClick }: TeamContentProps) => {
    return (
        <section className="relative flex flex-col items-center justify-center" onClick={onClick}>
            <h1 className="mt-16 mb-2 text-5xl md:text-6xl font-bold text-center cursor-pointer text-transparent bg-clip-text gradient-text font-poppins">
                Equipo
            </h1>

            <article className="w-full max-w-6xl p-6 sm:p-8 lg:p-10 text-base sm:text-lg lg:text-xl cursor-pointer">
                <p className="mb-4 text-left text-[var(--color-light)] leading-relaxed">
                    Pair Connect nació de una necesidad compartida: encontrar compañeros/as de programación que compartan nuestros intereses y nivel de experiencia. Sabemos que programar en pareja o en grupo acelera el aprendizaje y mejora la calidad del código.
                </p>

                <p className="mb-4 text-left text-[var(--color-light)] leading-relaxed">
                    Creamos esta plataforma para facilitar conexiones significativas entre desarrolladores/as, permitiéndoles colaborar en proyectos reales y crecer juntos profesionalmente.
                </p>

                <p className="mb-0 text-left text-[var(--color-light)] leading-relaxed">
                    Creemos en el poder de la comunidad y en que el mejor código se escribe cuando las mentes brillantes trabajan juntas.
                </p>
            </article>
        </section>

    );
};

export default TeamContent;
