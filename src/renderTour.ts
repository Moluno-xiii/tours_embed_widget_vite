import type { Tour } from "./types";

class TourRenderer {
  private shadowRoot: ShadowRoot;
  private tour: Tour;
  private currentStepIndex: number = 0;
  private container: HTMLDivElement;

  private elements: {
    overlay: HTMLDivElement;
    modal: HTMLDivElement;
    stepIndicator: HTMLDivElement;
    title: HTMLHeadingElement;
    content: HTMLDivElement;
    prevButton: HTMLButtonElement;
    nextButton: HTMLButtonElement;
    closeButton: HTMLButtonElement;
    progressBar: HTMLDivElement;
  } | null = null;

  constructor(shadowRoot: ShadowRoot, tour: Tour, container: HTMLDivElement) {
    this.shadowRoot = shadowRoot;
    this.tour = tour;
    this.container = container;
  }

  render(): void {
    this.injectStyles();
    this.createDOM();
    this.updateStep();
    this.attachEventListeners();
  }

  private injectStyles(): void {
    const style = document.createElement("style");
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translate(-50%, -40%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }
      
      @keyframes slideLeft {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideRight {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes progressFill {
        from {
          transform: scaleX(0);
        }
        to {
          transform: scaleX(1);
        }
      }
      
      .tour-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(2px);
        z-index: 999998;
        animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .tour-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        padding: 0;
        border-radius: 16px;
        box-shadow: 
          0 20px 60px rgba(0, 0, 0, 0.3),
          0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        z-index: 999999;
        max-width: 520px;
        width: 90%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
        animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
      }
      
      .tour-progress-bar {
        height: 4px;
        background: #e9ecef;
        position: relative;
        overflow: hidden;
      }
      
      .tour-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        transform-origin: left;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .tour-header {
        padding: 28px 32px 20px;
        border-bottom: 1px solid #e9ecef;
        position: relative;
      }
      
      .tour-close {
        position: absolute;
        top: 24px;
        right: 24px;
        background: none;
        border: none;
        font-size: 24px;
        color: #adb5bd;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 4px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .tour-close:hover {
        color: #495057;
        background: #f1f3f5;
        transform: rotate(90deg);
      }
      
      .tour-step-indicator {
        font-size: 13px;
        color: #868e96;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .tour-step-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 50%;
        font-size: 11px;
        font-weight: 700;
      }
      
      .tour-title {
        font-size: 26px;
        font-weight: 700;
        color: #212529;
        margin: 0;
        line-height: 1.3;
        animation: slideLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      .tour-body {
        padding: 24px 32px 28px;
      }
      
      .tour-content {
        font-size: 16px;
        line-height: 1.7;
        color: #495057;
        margin: 0;
        animation: slideRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards;
      }
      
      .tour-footer {
        padding: 20px 32px 28px;
        display: flex;
        gap: 12px;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #e9ecef;
        background: #f8f9fa;
      }
      
      .tour-button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 15px;
        font-weight: 600;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        font-family: inherit;
      }
      
      .tour-button::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }
      
      .tour-button:active::before {
        width: 300px;
        height: 300px;
      }
      
      .tour-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      }
      
      .tour-button:active {
        transform: translateY(0);
      }
      
      .tour-button-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        flex: 1;
      }
      
      .tour-button-primary:hover {
        background: linear-gradient(135deg, #5568d3 0%, #63408a 100%);
      }
      
      .tour-button-secondary {
        background: white;
        color: #495057;
        border: 2px solid #dee2e6;
      }
      
      .tour-button-secondary:hover {
        background: #f8f9fa;
        border-color: #adb5bd;
      }
      
      .tour-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
      }
      
      .tour-button:disabled:hover {
        transform: none;
        box-shadow: none;
      }
      
      /* Responsive design */
      @media (max-width: 600px) {
        .tour-modal {
          width: 95%;
          max-width: none;
        }
        
        .tour-header,
        .tour-body,
        .tour-footer {
          padding-left: 20px;
          padding-right: 20px;
        }
        
        .tour-title {
          font-size: 22px;
        }
        
        .tour-content {
          font-size: 15px;
        }
      }
    `;

    this.shadowRoot.appendChild(style);
  }

  private createDOM(): void {
    const overlay = document.createElement("div");
    overlay.className = "tour-overlay";

    const modal = document.createElement("div");
    modal.className = "tour-modal";

    const progressBar = document.createElement("div");
    progressBar.className = "tour-progress-bar";
    const progressFill = document.createElement("div");
    progressFill.className = "tour-progress-fill";
    progressBar.appendChild(progressFill);

    const header = document.createElement("div");
    header.className = "tour-header";

    const closeButton = document.createElement("button");
    closeButton.className = "tour-close";
    closeButton.innerHTML = "&times;";
    closeButton.setAttribute("aria-label", "Close tour");

    const stepIndicator = document.createElement("div");
    stepIndicator.className = "tour-step-indicator";

    const title = document.createElement("h2");
    title.className = "tour-title";

    header.appendChild(closeButton);
    header.appendChild(stepIndicator);
    header.appendChild(title);

    const body = document.createElement("div");
    body.className = "tour-body";

    const content = document.createElement("div");
    content.className = "tour-content";

    body.appendChild(content);

    const footer = document.createElement("div");
    footer.className = "tour-footer";

    const prevButton = document.createElement("button");
    prevButton.className = "tour-button tour-button-secondary";
    prevButton.textContent = "← Previous";

    const nextButton = document.createElement("button");
    nextButton.className = "tour-button tour-button-primary";
    nextButton.textContent = "Next →";

    footer.appendChild(prevButton);
    footer.appendChild(nextButton);

    modal.appendChild(progressBar);
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);

    this.shadowRoot.appendChild(overlay);
    this.shadowRoot.appendChild(modal);

    this.elements = {
      overlay,
      modal,
      stepIndicator,
      title,
      content,
      prevButton,
      nextButton,
      closeButton,
      progressBar: progressFill,
    };
  }

  private updateStep(): void {
    if (!this.elements) return;

    const step = this.tour.steps[this.currentStepIndex];
    const totalSteps = this.tour.steps.length;
    const progress = ((this.currentStepIndex + 1) / totalSteps) * 100;

    this.elements.progressBar.style.transform = `scaleX(${progress / 100})`;

    this.elements.stepIndicator.innerHTML = `
      <span class="tour-step-badge">${this.currentStepIndex + 1}</span>
      <span>Step ${this.currentStepIndex + 1} of ${totalSteps}</span>
    `;

    this.elements.title.textContent = step.title;
    this.elements.content.textContent = step.content;

    this.elements.prevButton.disabled = this.currentStepIndex === 0;

    if (this.currentStepIndex === totalSteps - 1) {
      this.elements.nextButton.textContent = "✓ Finish";
    } else {
      this.elements.nextButton.textContent = "Next →";
    }

    this.elements.title.style.animation = "none";
    this.elements.content.style.animation = "none";

    void this.elements.title.offsetHeight;

    this.elements.title.style.animation = "";
    this.elements.content.style.animation = "";
  }

  private attachEventListeners(): void {
    if (!this.elements) return;

    this.elements.prevButton.addEventListener("click", () => {
      this.previousStep();
    });

    this.elements.nextButton.addEventListener("click", () => {
      this.nextStep();
    });

    this.elements.closeButton.addEventListener("click", () => {
      this.close();
    });

    this.elements.overlay.addEventListener("click", () => {
      this.close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.close();
      } else if (e.key === "ArrowRight") {
        this.nextStep();
      } else if (e.key === "ArrowLeft") {
        this.previousStep();
      }
    });
  }

  private previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.updateStep();
    }
  }

  private nextStep(): void {
    if (this.currentStepIndex < this.tour.steps.length - 1) {
      this.currentStepIndex++;
      this.updateStep();
    } else {
      this.close();
    }
  }

  private close(): void {
    if (this.elements) {
      this.elements.overlay.style.animation =
        "fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) reverse";
      this.elements.modal.style.animation =
        "slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1) reverse";
    }

    setTimeout(() => {
      this.container.remove();
    }, 200);
  }
}

export default TourRenderer;
