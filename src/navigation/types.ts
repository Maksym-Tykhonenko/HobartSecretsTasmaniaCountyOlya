export type RootStackParamList = {
  Loader: undefined;
  Onboarding: undefined;
  MainTabs: undefined;

  StoryOpened: { id: string };
  Crossword: { id?: string };
};

export type MainTabParamList = {
  Stories: undefined;
  StoriesList: undefined;
  Crossword: undefined; 
  Tickets: undefined;
  Settings: undefined;
};
