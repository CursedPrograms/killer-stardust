document.addEventListener('click', function () {
    const audio = document.getElementById('backgroundMusic');
    audio.play().catch(error => {
        console.log("Audio play failed: ", error);
    });
});