"use client";

import React, { createContext, useContext, useState } from "react";

// Generic context creator
function createCtx(defaultValue) {
  const ctx = createContext(defaultValue);
  function Provider({ children }) {
    const [state, setState] = useState(defaultValue);
    return <ctx.Provider value={[state, setState]}>{children}</ctx.Provider>;
  }
  function useCtx() {
    const context = useContext(ctx);
    if (context === undefined) {
      throw new Error("useCtx must be used within a Provider");
    }
    return context;
  }
  return [Provider, useCtx];
}

// Contexts
const [CounterProvider, useCounter] = createCtx(0);
const [ImageProvider, useImage] = createCtx(null);
const [SelectionProvider, useSelection] = createCtx([]);
const [RecentSpeciesProvider, useRecentSpecies] = createCtx([]);
const [UserLabeledSpeciesProvider, useUserLabeledSpecies] = createCtx([]);
const [AnimalCountsProvider, useAnimalCounts] = createCtx({});
const [ObservationStateProvider, useObservationState] = createCtx({
  humanPresent: false,
  vehiclePresent: false,
  noAnimalsVisible: false,
  comment: "",
});
const [TutorialProvider, useTutorial] = createCtx(0);
const [ReviewModeProvider, useReviewMode] = createCtx(false);
const [RelabelingProvider, useRelabeling] = createCtx(false);
const [ImageLoadedProvider, useImageLoaded] = createCtx(false);
const [IsFetchingProvider, useIsFetching] = createCtx(false);

// Combined provider
function IdentificationProvider({ children }) {
  return (
    <CounterProvider>
      <ImageProvider>
        <SelectionProvider>
          <RecentSpeciesProvider>
            <UserLabeledSpeciesProvider>
              <AnimalCountsProvider>
                <ObservationStateProvider>
                  <ReviewModeProvider>
                    <RelabelingProvider>
                      <ImageLoadedProvider>
                        <IsFetchingProvider>
                          <TutorialProvider>{children}</TutorialProvider>
                        </IsFetchingProvider>
                      </ImageLoadedProvider>
                    </RelabelingProvider>
                  </ReviewModeProvider>
                </ObservationStateProvider>
              </AnimalCountsProvider>
            </UserLabeledSpeciesProvider>
          </RecentSpeciesProvider>
        </SelectionProvider>
      </ImageProvider>
    </CounterProvider>
  );
}

export {
  IdentificationProvider,
  useCounter,
  useImage,
  useSelection,
  useRecentSpecies,
  useUserLabeledSpecies,
  useAnimalCounts,
  useObservationState,
  useTutorial,
  useReviewMode,
  useRelabeling,
  useImageLoaded,
  useIsFetching,
};
