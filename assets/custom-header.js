import { Component } from '@theme/component';

class CustomHeaderComponent extends Component {
  connectedCallback() {
    super.connectedCallback();
    this.resizeHandler = this.handleResize.bind(this);
    window.addEventListener('resize', this.resizeHandler);

    if (this.refs.mobileMenu) {
      this.refs.mobileMenu.addEventListener('close', this.handleDialogClose.bind(this));
    }

    if (this.dataset.enableSticky === 'true') {
      this.initSticky();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.resizeHandler);

    if (this.stickyObserver) {
      this.stickyObserver.disconnect();
    }
  }

  openMenu() {
    if (!this.refs.mobileMenu) return;
    this.refs.mobileMenu.showModal();
    document.body.classList.add('overflow-hidden');
  }

  closeMenu() {
    if (!this.refs.mobileMenu) return;
    this.refs.mobileMenu.close();
    document.body.classList.remove('overflow-hidden');
  }

  handleDialogClose() {
    document.body.classList.remove('overflow-hidden');
  }

  handleResize() {
    if (window.innerWidth > 749 && this.refs.mobileMenu && this.refs.mobileMenu.open) {
      this.closeMenu();
    }
  }

  initSticky() {
    this.sentinel = document.createElement('div');
    this.sentinel.classList.add('custom-header__sentinel');
    this.parentElement.insertBefore(this.sentinel, this);

    this.stickyObserver = new IntersectionObserver(
      ([entry]) => {
        this.classList.toggle('is-sticky', !entry.isIntersecting);
      },
      { threshold: 0 }
    );

    this.stickyObserver.observe(this.sentinel);
  }
}

customElements.define('custom-header-component', CustomHeaderComponent);
