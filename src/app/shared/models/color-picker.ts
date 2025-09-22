export interface ColorOption {
  name: string;
  value: string;
  class: string;
  code: string;
  description?: string;
}

export interface ColorChangeEvent {
  value: string | null;
  hex: string | null;
  name?: string;
}