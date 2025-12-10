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

export type { TourStep, Tour };
