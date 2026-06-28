// Lazy-load all slide components.
// This avoids circular dependencies between slideRegistry and slide components.
import type { ComponentType } from 'react';
import type { SlideContentProps } from '@/slides/types';
import { TitleSlide } from '@/slides/TitleSlide';
import { ProblemSlide } from '@/slides/ProblemSlide';
import { QuickStartSlide } from '@/slides/QuickStartSlide';
import { ChaosSlide } from '@/slides/ChaosSlide';
import { LivenessSlide } from '@/slides/LivenessSlide';
import { ConflictsSlide } from '@/slides/ConflictsSlide';
import { SolutionSlide } from '@/slides/SolutionSlide';
import { DashboardSlide } from '@/slides/DashboardSlide';
import { TagsSlide } from '@/slides/TagsSlide';
import { PreviewSlide } from '@/slides/PreviewSlide';
import { ImportExportSlide } from '@/slides/ImportExportSlide';
import { PwaSlide } from '@/slides/PwaSlide';
import { I18nSlide } from '@/slides/I18nSlide';
import { TechStackSlide } from '@/slides/TechStackSlide';
import { OpenSourceSlide } from '@/slides/OpenSourceSlide';
import { ThankYouSlide } from '@/slides/ThankYouSlide';

export const COMPONENT_MAP: Record<string, ComponentType<SlideContentProps>> = {
  title: TitleSlide,
  problem: ProblemSlide,
  'quick-start': QuickStartSlide,
  chaos: ChaosSlide,
  liveness: LivenessSlide,
  conflicts: ConflictsSlide,
  solution: SolutionSlide,
  dashboard: DashboardSlide,
  tags: TagsSlide,
  preview: PreviewSlide,
  'import-export': ImportExportSlide,
  pwa: PwaSlide,
  i18n: I18nSlide,
  'tech-stack': TechStackSlide,
  'open-source': OpenSourceSlide,
  'thank-you': ThankYouSlide,
};
