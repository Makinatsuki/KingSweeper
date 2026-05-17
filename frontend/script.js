document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('game-iframe');

    // Handle iframe loading
    iframe.addEventListener('load', () => {
        console.log('KingSweeper game loaded successfully.');
    });

    // Potential for PostMessage communication with the GameMaker runner
    window.addEventListener('message', (event) => {
        // Security: In production, verify event.origin
        // if (event.origin !== "https://your-render-url.onrender.com") return;

        console.log('Message received from game:', event.data);
    });

    // Example of sending a message to the game (if needed)
    // const sendToGame = (msg) => {
    //     iframe.contentWindow.postMessage(msg, '*');
    // };
});
