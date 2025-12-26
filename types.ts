
export interface TranslationRecord {
  id: string;
  original: string;
  translated: string;
  timestamp: number;
}

export enum TranslationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
