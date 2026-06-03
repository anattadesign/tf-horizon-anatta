class Ag1ClinicalStudy extends HTMLElement {
  #isVisible = false;
  #afterBody = null;
  #afterLabels = null;

  connectedCallback() {
    this.statEl = this.querySelector('[data-stat-number]');
    if (this.statEl) {
      this.statTarget = parseInt(this.statEl.dataset.statNumber, 10) || 0;
      this.statAnimated = false;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.#isVisible = true;
          this.classList.add('is-visible');
          this.#animate();
          this.#animateStat();
          this.observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    this.observer.observe(this);

    this.#inlineSvg();
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  async #inlineSvg() {
    const container = this.querySelector('.ag1-clinical-study__svg-container');
    if (!container) return;
    const svgUrl = container.dataset.svgUrl;
    if (!svgUrl) return;

    try {
      const res = await fetch(svgUrl);
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg) return;

      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.classList.add('ag1-clinical-study__svg');

      // SVG structure — root <g> has 4 direct children:
      //   [0] green after-body   (mask=__lottie_element_39, translate ~503,305)
      //   [1] after-side labels  (translate ~271,-1)
      //   [2] gray before-body  (mask=__lottie_element_31, translate ~288,305)
      //   [3] before-side labels (translate ~56,-1)
      const rootG = svg.querySelector('g');
      const children = rootG ? [...rootG.children].filter(c => c.tagName === 'g') : [];

      const afterBody = children[0] || svg.querySelector('g[mask="url(#__lottie_element_39)"]');
      const afterLabels = children[1] || null;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!reducedMotion) {
        // ⚠️ Set initial HIDDEN state via inline style BEFORE DOM insertion.
        // This prevents the race condition where is-visible fires before SVG loads,
        // causing the clip-path to jump straight to fully-visible with no transition.
        if (afterBody) {
          afterBody.style.clipPath = 'inset(100% 0 0 0)';
          afterBody.style.transition = 'none';
        }
        if (afterLabels) {
          afterLabels.style.opacity = '0';
          afterLabels.style.transition = 'none';
        }
      }

      container.appendChild(svg);

      // Resolve DOM references after insertion
      const domRootG = container.querySelector('svg > g');
      if (domRootG) {
        const domChildren = [...domRootG.children].filter(c => c.tagName === 'g');
        this.#afterBody = domChildren[0] || null;
        this.#afterLabels = domChildren[1] || null;
      }

      if (!reducedMotion) {
        // Force reflow so browser registers the initial hidden state
        void container.offsetHeight;

        // Re-apply transitions (element is still hidden)
        if (this.#afterBody) {
          this.#afterBody.style.transition = 'clip-path 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s';
        }
        if (this.#afterLabels) {
          this.#afterLabels.style.transition = 'opacity 0.7s ease-out 1.5s';
        }
      }

      // If observer already fired (section was already in viewport), animate now
      if (this.#isVisible) {
        requestAnimationFrame(() => this.#animate());
      }
    } catch (_) {}
  }

  #animate() {
    if (this.#afterBody) this.#afterBody.style.clipPath = 'inset(0 0 0 0)';
    if (this.#afterLabels) this.#afterLabels.style.opacity = '1';
  }

  #animateStat() {
    if (!this.statEl || this.statAnimated || isNaN(this.statTarget)) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.statEl.textContent = this.statTarget;
      this.statAnimated = true;
      return;
    }

    this.statAnimated = true;
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      this.statEl.textContent = Math.round((1 - Math.pow(1 - t, 3)) * this.statTarget);
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
}

customElements.define('ag1-clinical-study', Ag1ClinicalStudy);
