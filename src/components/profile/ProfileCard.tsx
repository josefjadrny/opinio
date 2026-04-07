import type { Profile } from '../../types/profile';
import { useI18n } from '../../i18n/I18nContext';
import { RoleBadge } from '../common/RoleBadge';
import { CountryFlag } from '../common/CountryFlag';
import { VoteButtons } from '../voting/VoteButtons';
import { NewBadge } from './NewBadge';

interface ProfileCardProps {
  profile: Profile;
  variant?: 'default' | 'compact' | 'tooltip';
  isNew?: boolean;
  rank?: number;
}

export function ProfileCard({ profile, variant = 'default', isNew, rank }: ProfileCardProps) {
  const { t } = useI18n();
  if (variant === 'tooltip') {
    return (
      <div className="flex items-center gap-2 py-1">
        <img
          src={profile.imageUrl}
          alt={profile.name}
          className="w-6 h-6 rounded-full object-cover shrink-0"
        />
        <span className="text-xs font-medium text-white truncate flex-1">{profile.name}</span>
        <VoteButtons
          profileId={profile.id}
          likes={profile.likes}
          dislikes={profile.dislikes}
          myVote={profile.myVote}
          compact
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-surface-light/50 rounded-lg hover:bg-surface-light transition-colors">
        {rank != null && (
          <span className="text-xs font-bold text-text-secondary w-5 text-right shrink-0">
            {rank}
          </span>
        )}
        <img
          src={profile.imageUrl}
          alt={profile.name}
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-white truncate">{profile.name}</span>
            {isNew && <NewBadge />}
          </div>
          <div className="flex items-center gap-1.5">
            <RoleBadge role={profile.role} />
            <CountryFlag code={profile.countryCode} />
          </div>
        </div>
        <VoteButtons
          profileId={profile.id}
          likes={profile.likes}
          dislikes={profile.dislikes}
          myVote={profile.myVote}
          compact
        />
      </div>
    );
  }

  // default variant
  return (
    <div className="flex items-start gap-3 p-3 bg-surface-light/50 rounded-xl hover:bg-surface-light transition-colors">
      {rank != null && (
        <span className="text-sm font-bold text-text-secondary w-6 text-right shrink-0 pt-1">
          {rank}
        </span>
      )}
      <img
        src={profile.imageUrl}
        alt={profile.name}
        className="w-12 h-12 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-white truncate">{profile.name}</span>
          {isNew && <NewBadge />}
        </div>
        <div className="flex items-center gap-2 mb-1">
          <RoleBadge role={profile.role} />
          <CountryFlag code={profile.countryCode} />
        </div>
        <p className="text-xs text-text-secondary line-clamp-2 mb-1">{profile.description}</p>
        {profile.addedBy && (
          <p className="text-[10px] text-text-secondary/60 mb-1">{t.byAuthor.replace('{author}', profile.addedBy)}</p>
        )}
        <VoteButtons
          profileId={profile.id}
          likes={profile.likes}
          dislikes={profile.dislikes}
          myVote={profile.myVote}
        />
      </div>
    </div>
  );
}
