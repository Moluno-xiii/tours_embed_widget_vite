// import fetchTour from "./api/fetchTour";
// import TourRenderer from "./renderTour";

const baseUrl = "";

interface TourStep {
  id: string;
  order: number;
  title: string;
  content: string;
  targetSelector?: string;
}

interface Tour {
  id: string;
  title: string;
  description: string;
  steps: TourStep[];
}

const mockTour: Tour = {
  id: "tour_test_123",
  title: "Welcome to Your Product Tour",
  description: "Learn how to use our amazing features in just 7 steps",
  steps: [
    {
      id: "step_1",
      order: 1,
      title: " Welcome!",
      content: "Thanks for trying our product tour widget! ",
    },
    {
      id: "step_2",
      order: 2,
      title: "Beautiful Design",
      content: "Step 2 description",
    },
    {
      id: "step_3",
      order: 3,
      title: "⚡ Lightning Fast",
      content: "It's very fast.",
    },
    {
      id: "step_4",
      order: 4,
      title: " Secure & Private",
      content: "Something something something",
    },
    {
      id: "step_5",
      order: 5,
      title: " Fully Responsive",
      content: "Yeah, it's fully responsive",
    },
    {
      id: "step_6",
      order: 6,
      title: "I'm out of dummy content",
      content: "What do i say?",
    },
  ],
};

const initialize = async (options: { id: string }) => {
  try {
    console.log("i ran to initialie tour script.");
    const tours = await fetchTour(options.id, true);

    const container = document.createElement("div");
    container.id = "widget-container";
    document.body.appendChild(container);

    const shadow = container.attachShadow({ mode: "open" });

    const renderer = new TourRenderer(shadow, tours, container);
    renderer.render();
    console.log("tour script ran successfully");
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to initialize tour, reload the page and try again.";
    console.error("failed to initialie tour script", message);
    showErrorMessage(message);
  }
};

declare global {
  interface Window {
    TourWidget: any;
  }
}

window.TourWidget = { initialize };

const scriptTag = document.currentScript as HTMLScriptElement;
const tourId = scriptTag.dataset?.id;
if (tourId) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initialize({ id: tourId });
    });
  } else {
    initialize({ id: tourId });
  }
}

const showErrorMessage = (message: string) => {
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    font-family: sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000000;
  `;
  errorDiv.textContent = `Tour Error: ${message}`;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
};

const fetchTour = async (tourId: string, useMock: boolean = false) => {
  const bacendUrl = `${baseUrl}/${tourId}`;
  try {
    if (useMock) {
      return mockTour;
    }
    const response = await fetch(bacendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "omit",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch tour or tour does not exist .");
    }
    const data: Tour = await response.json();
    return data;
  } catch (error) {
    console.error("Tour fetch error", error);
    throw error;
  }
};

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
        background: black;
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
        background: black;
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
        background: black;
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
        background: black;
        color: white;
        flex: 1;
      }
      
      .tour-button-primary:hover {
        background: black;
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
