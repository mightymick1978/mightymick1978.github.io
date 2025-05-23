let audioContext;
let masterGainNode;
let sounds = {};
let isMutedState = false;

const soundFiles = {
    flip: 'flip.mp3',
    win_sound: 'win_sound.mp3'
};

export function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGainNode = audioContext.createGain();
        masterGainNode.connect(audioContext.destination);
        loadSounds();
    } catch (e) {
        console.warn("Web Audio API is not supported in this browser. Sound effects will be disabled.");
        // Provide dummy functions if AudioContext fails
        Object.keys(soundFiles).forEach(key => {
            sounds[key] = { play: () => {}, buffer: null };
        });
        isMutedState = true; // Effectively disable audio
    }
}

async function loadSound(name, filePath) {
    if (!audioContext) return { play: () => {}, buffer: null }; // No audio context
    try {
        const response = await fetch(filePath);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return {
            buffer: audioBuffer,
            play: () => {
                if (isMutedState || !audioContext || !audioBuffer) return;
                 // Resume context if it's suspended (e.g., due to browser auto-play policies)
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(masterGainNode);
                source.start(0);
            }
        };
    } catch (error) {
        console.error(`Error loading sound: ${name}`, error);
        return { play: () => {}, buffer: null }; // Return a dummy sound object on error
    }
}

async function loadSounds() {
    if (!audioContext) return;
    for (const key in soundFiles) {
        sounds[key] = await loadSound(key, soundFiles[key]);
    }
}

export function playSound(name) {
    if (sounds[name] && sounds[name].play) {
        sounds[name].play();
    } else {
        console.warn(`Sound ${name} not found or not loaded.`);
    }
}

export function toggleMute() {
    if (!audioContext) return;
    isMutedState = !isMutedState;
    masterGainNode.gain.setValueAtTime(isMutedState ? 0 : 1, audioContext.currentTime);
    // Store mute state if needed, e.g., in localStorage
}

export function isMuted() {
    return isMutedState;
}

