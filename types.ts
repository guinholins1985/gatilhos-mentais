export interface FormState {
  product: string;
  audience: string;
  benefit: string;
  cta: string;
  image?: {
    base64: string;
    mimeType: string;
  };
}

export interface MentalTrigger {
  key: string;
  name: string;
  description: string;
}

export interface GeneratedCopy {
  triggerKey: string;
  triggerName: string;
  copy: string;
}
