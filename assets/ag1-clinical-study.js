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
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
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
      const current = Math.round(eased * this.statTarget);

      this.statEl.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }
}

customElements.define('ag1-clinical-study', Ag1ClinicalStudy);
