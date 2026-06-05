import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  onCreateProject: () => void;
}

export function EmptyState({ onCreateProject }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-2xl font-semibold text-muted-foreground">
          {t('common.noProjects')}
        </p>
        <p className="text-muted-foreground">
          {t('common.noProjectsDesc')}
        </p>
        <button
          onClick={onCreateProject}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('common.createFirst')}
        </button>
      </div>
    </div>
  );
}
