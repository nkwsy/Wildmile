import React, { useMemo, useState, useEffect } from 'react';
import { Joyride, STATUS, ACTIONS } from 'react-joyride';
import { useTutorial, useReviewMode, useRelabeling } from './ContextCamera';
import { useUser } from 'lib/hooks';

export const CameraTrapTutorial = () => {
  const [run, setRun] = useTutorial();
  const [reviewMode] = useReviewMode();
  const [isRelabeling] = useRelabeling();
  const { user } = useUser();
  const [ready, setReady] = useState(false);

  const steps = useMemo(() => [
    ...(user ? [] : [{
      target: '#login-button',
      content: 'First, please log in or sign up to save your observations and track your progress!',
      placement: 'bottom',
      disableBeacon: true,
      skipBeacon: true,
    }]),
    {
      target: '#main-navigation-bar',
      content: 'Use these controls to navigate images. You can go to the next/previous photo with the arrows, or adjust your filters here.',
      placement: 'bottom',
      disableBeacon: true,
      skipBeacon: true,
    },
    {
      target: '#image-annotation-card',
      content: 'You can zoom in and out of the image using your mouse wheel or pinch gestures to see details more clearly.',
      placement: 'right',
      disableBeacon: true,
      skipBeacon: true,
    },
    {
      target: '#image-action-buttons',
      content: 'Use these buttons to interact with the image: view AI detections, play a video, or favorite the image.',
      placement: 'top',
      disableBeacon: true,
      skipBeacon: true,
    },
    {
      target: '#wildlife-search-container',
      content: 'Select animals from the available species here. The "Selected" tab shows what you\'ve already picked, while "All Species" lets you browse recent selections and the full catalog.',
      placement: 'left',
      disableBeacon: true,
      skipBeacon: true,
    },
    {
      target: '#species-tabs',
      content: 'Switch between "Selected Animals" and "All Species". Your 10 most recent selections will appear at the top of the All Species list for quick access.',
      placement: 'left',
      disableBeacon: true,
      skipBeacon: true,
    },
    {
      target: '#observation-tally-container',
      content: 'Toggles for Human and Vehicle presence are here. Below, you can see a summary of your selections and add any necessary comments.',
      placement: 'left',
      disableBeacon: true,
      skipBeacon: true,
    },
    {
      target: '#save-observations-button',
      content: 'Finally, click "Save Observations" or "No Animals Visible" to complete your identification. Your selections are kept between images to help with photo bursts!',
      placement: 'top',
      disableBeacon: true,
      skipBeacon: true,
    },
    {
      target: '#review-mode-toggle',
      content: 'Once you are comfortable with identification, try Review Mode! It lets you quickly confirm or correct the community consensus.',
      placement: 'bottom',
      disableBeacon: true,
      skipBeacon: true,
    },
    ...(reviewMode && !isRelabeling ? [
      {
        target: '#review-mode-controls',
        content: 'In Review Mode, we show you what others have observed. Your job is to verify if this matches what you see.',
        placement: 'left',
        disableBeacon: true,
        skipBeacon: true,
      },
      {
        target: '#confirm-button',
        content: 'If the list is correct, click "Confirm". This helps us reach consensus faster!',
        placement: 'top',
        disableBeacon: true,
        skipBeacon: true,
      },
      {
        target: '#relabel-button',
        content: 'If something is missing or incorrect, click "Re-label" to enter the standard identification mode and provide your own labels.',
        placement: 'top',
        disableBeacon: true,
        skipBeacon: true,
      },
    ] : []),
  ], [user, reviewMode, isRelabeling]);

  useEffect(() => {
    let timeoutId;
    if (run > 0) {
      const checkElements = () => {
        const allPresent = steps.every(step => {
          if (step.target === '.joyride-beacon') return true; // ignore beacon if any
          return !!document.querySelector(step.target);
        });
        if (allPresent) {
          setReady(true);
        } else {
          // Retry after a short delay
          timeoutId = setTimeout(checkElements, 100);
        }
      };
      checkElements();
    } else {
      setReady(false);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [run, steps]);

  const handleJoyrideCallback = (data) => {
    const { status, type, index, action, origin } = data;

    if (
      [STATUS.FINISHED, STATUS.SKIPPED].includes(status) ||
      [ACTIONS.CLOSE, ACTIONS.SKIP].includes(action) ||
      ['overlay', 'keyboard', 'button_close', 'button_skip'].includes(origin)
    ) {
      setRun(0);
    }
  };

  return (
    <Joyride
      key={run}
      steps={steps}
      run={run > 0 && ready}
      continuous={true}
      autoStart={true}
      showProgress
      showSkipButton
      scrollOffset={100}
      disableScrolling={false}
      callback={handleJoyrideCallback}
      onEvent={handleJoyrideCallback}
      disableOverlayClose={false}
      disableBeacon={true}
      skipBeacon={true}
      options={{
        overlayClickAction: 'close',
        dismissKeyAction: 'close',
        closeButtonAction: 'skip',
        skipBeacon: true,
      }}
      styles={{
        options: {
          primaryColor: '#40c057',
          zIndex: 10000,
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
        tooltip: {
          fontSize: '16px',
        },
        buttonPrimary: {
          backgroundColor: '#40c057',
          color: '#ffffff',
        },
        beaconInner: {
          backgroundColor: '#ff0000',
        },
        beaconOuter: {
          border: '2px solid #ff0000',
        },
        spotlight: {
          // Keep empty
        }
      }}
    />
  );
};
