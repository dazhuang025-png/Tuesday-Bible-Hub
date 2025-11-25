export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface PrepResult {
  markdown: string;
}

export interface SummaryResult {
  markdown: string;
}

export interface PastorResult {
  markdown: string;
}

export interface FileData {
  file: File;
  previewUrl: string;
}