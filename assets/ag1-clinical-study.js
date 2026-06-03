class Ag1ClinicalStudy extends HTMLElement {
  #isVisible = false;
  #clipRect = null;
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

      // SVG root g has 4 direct children:
      //   [0] green after-body  (mask=__lottie_element_39)
      //   [1] after-side labels
      //   [2] gray before-body  (mask=__lottie_element_31)
      //   [3] before-side labels
      const rootG = svg.querySelector('g');
      const children = rootG ? [...rootG.children].filter(c => c.tagName === 'g') : [];
      const afterBody = children[0];
      const afterLabels = children[1];

      // Use a native SVG <clipPath> animated via rAF instead of CSS clip-path.
      // CSS clip-path transitions on SVG <g> elements can snap back to initial
      // state in some browsers once the transition completes.
      // setAttribute on an SVG rect is permanent — it never reverts.
      const svgNs = 'http://www.w3.org/2000/svg';
      const clipPath = document.createElementNS(svgNs, 'clipPath');
      const clipId = '__ag1_reveal__';
      clipPath.setAttribute('id', clipId);
      // objectBoundingBox: x/y/width/height are fractions (0–1) of the element's bounding box
      clipPath.setAttribute('clipPathUnits', 'objectBoundingBox');

      const clipRect = document.createElementNS(svgNs, 'rect');
      clipRect.setAttribute('x', '0');
      clipRect.setAttribute('width', '1');
      // Start: rect sits at y=1 with height=0 → empty rect → body fully hidden
      clipRect.setAttribute('y', '1');
      clipRect.setAttribute('height', '0');

      clipPath.appendChild(clipRect);
      svg.querySelector('defs').appendChild(clipPath);

      // Point the green body's clip to our new clipPath
      if (afterBody) {
        afterBody.setAttribute('clip-path', `url(#${clipId})`);
      }

      // Keep a reference BEFORE appendChild (same object after move)
      this.#clipRect = clipRect;

      // Hide after-labels initially — opacity transition is fine on SVG elements
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (afterLabels && !reducedMotion) {
        afterLabels.style.opacity = '0';
        afterLabels.style.transition = 'none';
      }

      container.appendChild(svg);

      // Resolve the labels reference from live DOM
      const domRootG = container.querySelector('svg > g');
      if (domRootG) {
        const dc = [...domRootG.children].filter(c => c.tagName === 'g');
        this.#afterLabels = dc[1] || null;
      }

      if (this.#afterLabels && !reducedMotion) {
        void container.offsetHeight;
        this.#afterLabels.style.transition = 'opacity 0.7s ease-out 1.5s';
      }

      // Observer may have fired before SVG loaded — animate now if so
      if (this.#isVisible) {
        requestAnimationFrame(() => this.#animate());
      }
    } catch (_) {}
  }

  #animate() {
    if (this.#afterLabels) this.#afterLabels.style.opacity = '1';
    this.#revealBody();
  }

  #revealBody() {
    if (!this.#clipRect) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Immediately show full body
      this.#clipRect.setAttribute('y', '0');
      this.#clipRect.setAttribute('height', '1');
      return;
    }

    const duration = 1500; // ms
    const delay = 300;     // ms before reveal starts
    const startTime = performance.now() + delay;

    const tick = (now) => {
      if (now < startTime) {
        requestAnimationFrame(tick);
        return;
      }
      const t = Math.min((now - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);

      // Reveal from bottom to top:
      //   y goes 1 → 0  (top edge of clip rect rises from bottom to top)
      //   height goes 0 → 1 (rect grows to cover full bounding box)
      this.#clipRect.setAttribute('y', String(1 - eased));
      this.#clipRect.setAttribute('height', String(eased));

      // Continue until complete — at t=1: y=0, height=1 (fully visible, stays there)
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
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
