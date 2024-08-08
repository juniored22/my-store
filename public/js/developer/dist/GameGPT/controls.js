export const keys = {};

export function setupControls(togglePause) {
    document.addEventListener('keydown', (event) => { 
        keys[event.key] = true; 
        if (event.key.toLowerCase() === 'p') {
            togglePause();
        }
    });
    document.addEventListener('keyup', (event) => { keys[event.key] = false; if (event.key === ' ') player.canJump = true; });
}
