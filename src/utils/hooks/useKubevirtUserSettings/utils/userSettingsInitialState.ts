import { OnboardingPopoverKey, OnboardingPopoversHidden } from '@kubevirt-utils/components/OnboardingPopover/types';

export type UserSettingsState = {
  cards: CardsUserSettings;
  columns: ColumnsUserSettings;
  favoriteBootableVolumes: string[];
  navigation: NavigationUserSettings;
  onboardingPopoversHidden: OnboardingPopoversHidden;
  quickStart: QuickStartUserSettings;
  savedSearches: {
    [key: string]: any;
  };
  ssh: SSHUserSettings;
};

type NavigationUserSettings = {
  autoHideNav?: boolean;
};

type SSHUserSettings = {
  [namespace: string]: string;
};

type ColumnsUserSettings = {
  [tableName: string]: string[];
};

type QuickStartUserSettings = {
  dontShowWelcomeModal?: boolean;
  tourStepsSeen?: number[];
};

type CardsUserSettings = {
  [cardPage: string]: { cardName: string; value: boolean };
};

export const defaultUserSettingsState: UserSettingsState = {
  cards: {},
  columns: {},
  favoriteBootableVolumes: [],
  navigation: {},
  onboardingPopoversHidden: Object.values(OnboardingPopoverKey).reduce<OnboardingPopoversHidden>(
    (acc, key) => ({ ...acc, [key]: false }),
    {} as OnboardingPopoversHidden,
  ),
  quickStart: {},
  savedSearches: {},
  ssh: {},
};
