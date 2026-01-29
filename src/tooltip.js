export default {
  mounted(el, binding) {
    setupTooltip(el, binding);
  },

  updated(el, binding) {
    cleanup(el);
    setupTooltip(el, binding);
  },

  unmounted(el) {
    cleanup(el);
  },
};

function setupTooltip(el, binding) {
  const { text = "", position = "top" } = binding.value || {};
  if (!text) return;

  const tooltip = document.createElement("div");
  tooltip.textContent = text;
  tooltip.style.cssText = `
    position: fixed;
    background: #fff;
    color: #000;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 0.8rem;
    line-height: 1.2;
    width: fit-content;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease-in-out;
    z-index: 2000;
  `;

  function show() {
    document.body.appendChild(tooltip);
    const rect = el.getBoundingClientRect();
    const margin = 8;
    let top, left;

    switch (position) {
      case "bottom":
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2;
        tooltip.style.transform = "translate(-50%, 0)";
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - margin;
        tooltip.style.transform = "translate(-100%, -50%)";
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + margin;
        tooltip.style.transform = "translate(0, -50%)";
        break;
      default:
        top = rect.top - margin;
        left = rect.left + rect.width / 2;
        tooltip.style.transform = "translate(-50%, -100%)";
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.opacity = "1";
  }

  function hide() {
    if (document.body.contains(tooltip)) {
      document.body.removeChild(tooltip);
    }
  }

  el.addEventListener("mouseenter", show);
  el.addEventListener("mouseleave", hide);
  el.addEventListener("focus", show);
  el.addEventListener("blur", hide);

  el._tooltipEl = tooltip;
  el._tooltipShow = show;
  el._tooltipHide = hide;
}

function cleanup(el) {
  if (el._tooltipEl) {
    el._tooltipEl.remove();
    delete el._tooltipEl;
  }
  if (el._tooltipShow) {
    el.removeEventListener("mouseenter", el._tooltipShow);
    el.removeEventListener("focus", el._tooltipShow);
    delete el._tooltipShow;
  }
  if (el._tooltipHide) {
    el.removeEventListener("mouseleave", el._tooltipHide);
    el.removeEventListener("blur", el._tooltipHide);
    delete el._tooltipHide;
  }
}
