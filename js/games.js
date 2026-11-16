/*
  Tumbleforge Games: the list of games shown on the site.

  Every entry here is a game that is live on Google Play. To add a new game,
  copy the Letterbrook block, paste it below, and change the details.
  The page builds itself from this list, so nothing else needs editing.

  Where the values come from (all on the game's Play Store page):
    packageId    the id in the store link:  .../details?id=com.letterbrook.game
    icon         right-click the app icon > "Copy image address", then delete
                 everything from the last "=" onward
    screenshots  same as the icon, one per screenshot
    icons        any of: nodes, shuffle, peaks, star, offline, save, theme, calm
*/
window.TUMBLEFORGE = {
  developerUrl: 'https://play.google.com/store/apps/developer?id=Tumbleforgegames',

  games: [
    {
      id: 'letterbrook',
      name: 'Letterbrook',
      genre: 'Word puzzle',
      packageId: 'com.letterbrook.game',
      tagline: 'Relaxing word connect puzzle: swipe letters to fill the crossword. Play offline.',
      description:
        'Swipe across the letters on the wheel to spell words and fill a crossword, one scenic level at a time. No timers and no pressure: just a handful of letters and a quiet trail of puzzles.',
      facts: ['Free to play', 'Contains ads', 'Rated 3+', 'No account needed'],
      icon: 'https://play-lh.googleusercontent.com/_T5wvb2CVoHyK0SyngUhgHWKQw8DTCuinGiiV-w_Zu1mKXPjFrcGIRZG7-gM18fZrtjzzLmc9_dNr8riw_nf',
      screenshots: [
        {
          src: 'https://play-lh.googleusercontent.com/wiEe6OjIY6BDJ4As0PqoEntRURi_gBsBzgoijzw3dvLPrufOfcgMCEoWk86iCC4Qz6RCJza5tKSMxM6yF0pe',
          alt: 'Swipe letters, find words: a crossword filling in above a wheel of letters.'
        },
        {
          src: 'https://play-lh.googleusercontent.com/ovQKBpFKYQC50mnLIR0N54l2WPl2NpKnTuMrBLHOiiP4Y-6m_jO3D9PMh-ZcNP7Ym_1O8nBpcGXKlilcx0gJ',
          alt: 'Earn stars and coins: a level complete screen with three stars.'
        },
        {
          src: 'https://play-lh.googleusercontent.com/cjBkErrnAfPeypgyNUcQ2skPMX9KHYjPkNYXI4dsmq3itQfZpOHCMrmpKJt3jhpCBYjloUZuCeTqVlAiOc6T',
          alt: '50 hand-made levels: the level map with the Meadow Dawn, Coastal Cliffs and Desert Canyon chapters.'
        },
        {
          src: 'https://play-lh.googleusercontent.com/VGxFBZv2sbv55HoyNr2pXMTmMHydKRXmvrYehwH2QMvkupXWU33Tsfm6oHXPI8FauLb-C_be7IeD_tcdfqjyaw',
          alt: 'Light or dark, your way: a puzzle shown in the dark theme.'
        },
        {
          src: 'https://play-lh.googleusercontent.com/Bdix_0yXRzot0KsHZIX5i-cIINFHSz8whdLgPkBzb7p0ab4OVROnGpDMvd0rhWpGye7OUUmRiiOsDMl6q9iltmY',
          alt: 'Learn in a minute: the How to Play practice puzzle.'
        },
        {
          src: 'https://play-lh.googleusercontent.com/smUPWGbqb3YAZAR_JLLmqFcc-xkfyvtRKMNQ_3uxCVO89OMteez2peJCAcVRBftrpRNLpfzeg_M5rNDy7pxTaO0',
          alt: 'Relax and play offline: the Letterbrook home screen.'
        }
      ],
      features: [
        {
          icons: ['nodes', 'shuffle'],
          title: 'Swipe to spell',
          text: 'Connect letters on the wheel into words. Every word that fits flies into the crossword.'
        },
        {
          icons: ['peaks'],
          title: 'Fifty hand-made levels',
          text: 'Five scenic chapters, from Meadow Dawn to Summit Trail, then new puzzles that keep coming.'
        },
        {
          icons: ['offline', 'save'],
          title: 'Plays offline',
          text: 'Puzzles need no internet connection and no account. Progress saves on your phone.'
        },
        {
          icons: ['theme'],
          title: 'Light or dark',
          text: 'Pick a theme or match your phone, with a reduced motion setting for calmer animations.'
        }
      ]
    }
  ]
};
