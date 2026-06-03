class Ag1ClinicalStudy extends HTMLElement {
  connectedCallback() {
    this.observer = new IntersectionObserver(
      (entries) => this.#handleIntersection(entries),
      { threshold: 0.15 }
    );
    this.observer.observe(this);

    this.statEl = this.querySelector('[data-stat-number]');
    if (this.statEl) {
      this.statTarget = parseInt(this.statEl.dataset.statNumber, 10);
      this.statAnimated = false;
    }

    this.#inlineSvg();
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  async #inlineSvg() {
    const container = this.querySelector('.ag1-clinical-study__svg-container');
    if (!container) return;

    const svgUrl = container.dataset.svgUrl;
    if (!svgUrl) return;

    try {
      const response = await fetch(svgUrl);
      const text = await response.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(text, 'image/svg+xml');
      const svg = svgDoc.querySelector('svg');
      if (!svg) return;

      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.cssText = '';
      svg.classList.add('ag1-clinical-study__svg');

      // Tag the green (after) body for animation
      for (const g of svg.querySelectorAll('g[mask]')) {
        if (g.getAttribute('mask') === 'url(#__lottie_element_39)') {
          g.classList.add('ag1-svg-after-body');
        }
      }

      // Tag right-side text groups for fade-in
      for (const g of svg.querySelectorAll('g[transform]')) {
        const t = g.getAttribute('transform') || '';
        if (t.includes('521.5,34.75')) g.classList.add('ag1-svg-label-after');
        if (t.includes('728.5,346.75') || t.includes('729,316.75') || t.includes('729,242.75')) {
          g.classList.add('ag1-svg-label-after');
        }
      }

      container.appendChild(svg);
    } catch (_) {}
  }

  #handleIntersection(entries) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.classList.add('is-visible');
        this.#animateStat();
        this.observer.disconnect();
      }
    }
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

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.statEl.textContent = Math.round(eased * this.statTarget);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }
}

customElements.define('ag1-clinical-study', Ag1ClinicalStudy);
