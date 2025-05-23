import { supercars } from './cards_data.js';
import * as Game from './game.js';
import * as UI from './ui.js';
import * as Audio from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
    Audio.initAudio();
    Game.initGame(supercars, UI, Audio);

    const volumeIcon = document.getElementById('volume-icon');
    volumeIcon.addEventListener('click', () => {
        Audio.toggleMute();
        UI.updateVolumeIcon(Audio.isMuted());
    });

    UI.updateVolumeIcon(Audio.isMuted());
});