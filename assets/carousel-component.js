import { Component } from "@theme/component";
import { requestIdleCallback } from "@theme/utilities";

const SWIPER_VERSION = "12.1.2";
const SWIPER_BASE_URL = `https://cdn.jsdelivr.net/npm/swiper@${SWIPER_VERSION}`;

export class CarouselComponent extends Component {
  async connectedCallback() {
    super.connectedCallback();

    // Defer Swiper initialization until the browser is idle
    requestIdleCallback(async () => {
      await this.loadSwiper();
      this.initSwiper();
    });
  }

  async loadSwiper() {
    if (window.Swiper && window.SwiperModules) {
      this.SwiperClass = window.Swiper;
      this.SwiperModules = window.SwiperModules;
      return;
    }

    const styles = ["swiper", "navigation", "pagination", "a11y"];
    styles.forEach((style) => this.loadStyle(style));

    try {
      const modules = ["navigation", "pagination", "autoplay", "a11y"];
      const imports = [
        import(`${SWIPER_BASE_URL}/swiper.min.mjs`),
        ...modules.map(
          (m) => import(`${SWIPER_BASE_URL}/modules/${m}.min.mjs`),
        ),
      ];

      const [{ default: Swiper }, ...loadedModules] =
        await Promise.all(imports);

      window.Swiper = Swiper;
      window.SwiperModules = loadedModules.map((m) => m.default);

      this.SwiperClass = window.Swiper;
      this.SwiperModules = window.SwiperModules;
    } catch (err) {
      console.error("Swiper load failed", err);
    }
  }

  /**
   * @param {string} name
   */
  loadStyle(name) {
    const id = `swiper-${name}-css`;
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `${SWIPER_BASE_URL}/${name === "swiper" ? "" : "modules/"}${name}.min.css`;
    document.head.appendChild(link);
  }

  initSwiper() {
    const container = this.querySelector(".swiper");
    if (!container || !this.SwiperClass) return;

    // Destroy existing instance if it exists (relevant for Theme Editor updates)
    if (this.swiper) {
      this.swiper.destroy();
    }

    const settings = JSON.parse(this.getAttribute("data-settings") || "{}");

    const swiperOptions = {
      modules: this.SwiperModules,
      slidesPerView: settings.slidesPerViewMobile || 1.5,
      spaceBetween: settings.spaceBetweenMobile || 8,
      loop: settings.loop || false,
      autoplay: settings.autoplay
        ? {
            delay: (settings.autoplaySpeed || 5) * 1000,
            disableOnInteraction: false,
          }
        : false,
      pagination: settings.pagination
        ? {
            el: this.querySelector(".swiper-pagination"),
            clickable: true,
          }
        : false,
      navigation: settings.navigation
        ? {
            nextEl: settings.customArrows
              ? document.querySelector(settings.nextEl)
              : this.querySelector(".swiper-button-next"),
            prevEl: settings.customArrows
              ? document.querySelector(settings.prevEl)
              : this.querySelector(".swiper-button-prev"),
          }
        : false,
      breakpoints: {
        750: {
          slidesPerView: settings.slidesPerViewDesktop || 4,
          spaceBetween: settings.spaceBetweenDesktop || 16,
        },
      },
    };

    this.swiper = new this.SwiperClass(container, swiperOptions);
  }

  disconnectedCallback() {
    if (this.swiper) {
      this.swiper.destroy();
    }
    super.disconnectedCallback();
  }
}

if (!customElements.get("carousel-component")) {
  customElements.define("carousel-component", CarouselComponent);
}
