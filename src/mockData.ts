import type { Tour } from "./types";

const mockTour: Tour = {
  id: "tour_test_123",
  title: "Welcome to Your Product Tour",
  description: "Learn how to use our amazing features in just 7 steps",
  steps: [
    {
      id: "step_1",
      order: 1,
      title: "👋 Welcome!",
      content:
        'Thanks for trying our product tour widget! This interactive guide will show you how the tour system works. Click "Next" to continue, or use your arrow keys to navigate.',
    },
    {
      id: "step_2",
      order: 2,
      title: "🎨 Beautiful Design",
      content:
        "Notice the smooth animations and modern design. The gradient progress bar at the top shows your position in the tour. The modal uses a glassmorphism effect with subtle shadows.",
    },
    {
      id: "step_3",
      order: 3,
      title: "⚡ Lightning Fast",
      content:
        "This widget loads in milliseconds and runs entirely in the browser. We use Shadow DOM for perfect style isolation, ensuring it never conflicts with your website's CSS.",
    },
    {
      id: "step_4",
      order: 4,
      title: "🔒 Secure & Private",
      content:
        "All tour content is sanitized to prevent XSS attacks. We use textContent instead of innerHTML, and validate all data from the API. Your users' security is our priority.",
    },
    {
      id: "step_5",
      order: 5,
      title: "📱 Fully Responsive",
      content:
        "Try resizing your browser window! The tour automatically adapts to mobile, tablet, and desktop screens. It works perfectly on devices of all sizes.",
    },
    {
      id: "step_6",
      order: 6,
      title: "⌨️ Keyboard Shortcuts",
      content:
        "Power users will love this: Use the left/right arrow keys to navigate between steps, or press Escape to close the tour. Accessibility built-in from day one.",
    },
    {
      id: "step_7",
      order: 7,
      title: "🚀 Ready to Launch",
      content:
        "You're all set! This tour demonstrates real-world usage. When you're ready, just swap the mock data for your API endpoint and deploy. Click \"Finish\" to complete the tour.",
    },
  ],
};

export default mockTour;
