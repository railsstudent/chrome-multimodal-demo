export interface AudioClip {
  id: string;
  name: string;
  url: string;
  blob: Blob;
  createdAt: Date;
}

export type SelectedAudio = Pick<AudioClip, 'id' | 'name' | 'blob'>;
