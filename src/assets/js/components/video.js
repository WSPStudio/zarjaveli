/* 
	================================================
	  
	Вставка видео
	
	================================================
*/

export function video() {
  document.addEventListener("DOMContentLoaded", () => {
    class LazyVideo {
      constructor(videoUrl, options = {}) {
        const defaults = {
          isFile: false,
          autoplay: false,
          controls: true,
          loop: true,
        };

        const settings = Object.assign(defaults, options);

        this.isFile = settings.isFile;
        this.container = settings.container;
        this.autoplay = settings.autoplay;
        this.controls = settings.controls;
        this.loop = settings.loop;
        this.videoUrl = this.normalizeUrl(videoUrl);

        if (!this.container) {
          console.error("Ошибка: не найден блок .video");
          return;
        }

        this.thumbnail = this.container.querySelector(".video__thumbnail");
        this.playButton = this.container.querySelector(".video__play");

        this.check();
        this.init();
      }

      check() {
        if (!this.videoUrl) {
          console.error("Ошибка: не указан адрес видео");
          return;
        }
      }

      init() {
        if (this.autoplay) {
          this.loadVideo();
          return;
        }

        if (this.playButton) {
          this.playButton.addEventListener("click", () => this.loadVideo());
        }
      }

      loadVideo() {
        if (this.thumbnail) this.thumbnail.remove();
        if (this.playButton) this.playButton.remove();

        if (this.isFile) {
          const video = document.createElement("video");

          video.src = this.videoUrl;

          if (this.controls) {
            video.controls = true;
          }

          if (this.loop) {
            video.loop = true;
          }

          if (this.autoplay) {
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
          }

          this.container.appendChild(video);

          if (this.autoplay) {
            video.play().catch(() => {});
          }
        } else {
          let url = this.videoUrl;

          if (this.autoplay) {
            url += `${url.includes("?") ? "&" : "?"}autoplay=1`;
          }

          const iframe = document.createElement("iframe");
          iframe.src = url;
          iframe.allow = "autoplay; encrypted-media";
          iframe.allowFullscreen = true;

          this.container.appendChild(iframe);
        }
      }

      normalizeUrl(url) {
        const vkShortRegex = /^https:\/\/vkvideo\.ru\/video(\d+)_(\d+)$/;
        const vkMatch = url.match(vkShortRegex);

        if (vkMatch) {
          const oid = vkMatch[1];
          const id = vkMatch[2];
          return `https://vkvideo.ru/video_ext.php?oid=${oid}&id=${id}&hd=2`;
        }

        const rutubeRegex = /^https:\/\/rutube\.ru\/video\/([a-z0-9]+)\/?$/i;
        const rutubeMatch = url.match(rutubeRegex);

        if (rutubeMatch) {
          const id = rutubeMatch[1];
          return `https://rutube.ru/play/embed/${id}`;
        }

        return url;
      }
    }

    const videos = document.querySelectorAll(".video");

    if (!videos.length) return;

    videos.forEach((video) => {
      const videoUrl = video.dataset.url;

      if (!videoUrl) return;

      const isFile = (() => {
        try {
          const url = new URL(videoUrl, window.location.origin);
          return url.origin === window.location.origin;
        } catch {
          return true;
        }
      })();

      const autoplay = video.hasAttribute("autoplay");

      let controls = true;
      let loop = true;

      if (video.hasAttribute("controls")) {
        const value = video.getAttribute("controls");
        if (value === "false") {
          controls = false;
        }
      }

      if (video.hasAttribute("loop")) {
        const value = video.getAttribute("loop");
        if (value === "false") {
          loop = false;
        }
      }

      new LazyVideo(videoUrl, {
        container: video,
        isFile: isFile,
        autoplay: autoplay,
        controls: controls,
        loop: loop,
      });
    });
  });
}
