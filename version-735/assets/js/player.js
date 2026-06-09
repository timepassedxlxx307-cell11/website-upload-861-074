(function () {
  const players = Array.from(document.querySelectorAll('.movie-player'));

  players.forEach(function (video) {
    const frame = video.closest('.player-frame');
    const button = frame ? frame.querySelector('.player-cover-button') : null;
    let hlsInstance = null;
    let initialized = false;

    function initialize() {
      if (initialized) {
        return;
      }
      initialized = true;

      const source = video.getAttribute('data-video-source');
      if (!source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      initialize();
      if (button) {
        button.classList.add('is-hidden');
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
}());
