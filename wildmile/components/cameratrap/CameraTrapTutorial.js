import React from 'react';
import { Joyride, STATUS, ACTIONS } from 'react-joyride';
import { useTutorial } from './ContextCamera';

const steps = [
  {
    target: '#main-navigation-bar',
    content: '1. Use these controls to navigate images. You can go to the next/previous photo with the arrows, jump to the earliest image, or click "Get Images" to refresh. You can also adjust your filters here.',
    placement: 'bottom',
    disableBeacon: true,
    skipBeacon: true,
  },
  {
    target: '#image-annotation-card',
    content: '2. You can zoom in and out of the image using your mouse wheel or pinch gestures to see details more clearly.',
    placement: 'right',
    disableBeacon: true,
    skipBeacon: true,
  },
  {
    target: '#image-action-buttons',
    content: '3. Use these buttons to interact with the image: copy a share link, view AI detections, play a video, request ID help, report issues, or favorite the image.',
    placement: 'top',
    disableBeacon: true,
    skipBeacon: true,
  },
  {
    target: '#save-observations-button',
    content: '4. If no animals are visible, click "No Animals Visible". Also, check the Human or Vehicle boxes if they are present in the photo.',
    placement: 'left',
    disableBeacon: true,
    skipBeacon: true,
  },
  {
    target: '#wildlife-search-container',
    content: '5. If animals are present, select them from the available species in this sidebar. Tip: Select one now for step 7 to make sense',
    placement: 'left',
    disableBeacon: true,
    skipBeacon: true,
  },
  {
    target: '#species-tabs',
    content: '6. Use the clock icon for "Recently Used" species and the user icon for "My Animals". You can also search for a specific animal. If you need help, post to our WhatsApp channel!',
    placement: 'left',
    disableBeacon: true,
    skipBeacon: true,
  },
  {
    target: '#observation-tally-container',
    content: '7. Once you select animals, they will appear here. Use the plus and minus buttons to set the count for each type visible in the photo.',
    placement: 'left',
    disableBeacon: true,
    skipBeacon: true,
  },
  {
    target: '#save-observations-button',
    content: '8. Finally, click "Save Observations" (log in or sign up first!). Your selections are kept between images to help with photo bursts, so remember to remove any animals that aren\'t in the next photo!',
    placement: 'top',
    disableBeacon: true,
    skipBeacon: true,
  },
];

export const CameraTrapTutorial = () => {
  const [run, setRun] = useTutorial();

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
      run={run > 0}
      continuous
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
          primaryColor: '#40c057', // Green
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
