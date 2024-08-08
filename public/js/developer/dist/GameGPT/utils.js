export function togglePause() {
    if (isGameRunning) {
        isPaused = !isPaused;
        document.getElementById('pauseMenu').style.display = isPaused ? 'flex' : 'none';
        if (isPaused) {
            document.exitPointerLock();
        } else {
            document.body.requestPointerLock();
            animate();
        }
    }
}
