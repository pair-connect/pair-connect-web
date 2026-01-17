import TeamCard from '@/components/team/TeamCard';
import { teamData } from '@/data/teamData';
import jessAvatar from '@/assets/images/avatars/team/jess.png';
import helenaAvatar from '@/assets/images/avatars/team/helena.png';
import lynnAvatar from '@/assets/images/avatars/team/lynn.png';

const TeamList = () => {
    const { teamMembers } = teamData;
    
    // Mapear nombres a avatares importados (única fuente de verdad para las imágenes)
    const avatarMap: Record<string, string> = {
        'Jessica Arroyo': jessAvatar,
        'Helena López': helenaAvatar,
        'Lynn Poh': lynnAvatar,
    };
    
    // Usar solo las imágenes importadas, ignorar las rutas del JSON
    const membersWithAvatars = teamMembers.map(member => ({
        ...member,
        avatar: avatarMap[member.name] || ''
    } as typeof member & { avatar: string }));
    
    return (
        <section id="team-section">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 justify-items-center max-w-6xl mx-auto">
                {membersWithAvatars.map((member, index) => (
                    <div 
                        key={index} 
                        className={index === 2 ? "lg:col-span-2 lg:flex lg:justify-center lg:w-full" : ""}
                    >
                        <TeamCard member={member} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TeamList;
