class Ag1FlavorAccordion extends HTMLElement {
  connectedCallback() {
    this.panels = this.querySelectorAll('.ag1-flavor-panel');

    if (this.panels.length === 0) return;

    for (const panel of this.panels) {
      panel.addEventListener('click', () => this.#activatePanel(panel));
    }

    const hasActive = this.querySelector('.ag1-flavor-panel.active');

    if (!hasActive && this.panels.length > 0) {
      this.panels[0].classList.add('active');
    }
  }

  #activatePanel(target) {
    for (const panel of this.panels) {
      panel.classList.remove('active');
    }

    target.classList.add('active');
  }
}

customElements.define('ag1-flavor-accordion', Ag1FlavorAccordion);
