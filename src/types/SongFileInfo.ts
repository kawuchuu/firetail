export interface SongFileInfo {
    path: string;
    size: number;
    modified: number;
    container?: string;
    codec?: string;
    codecProfile?: string;
    lossless?: boolean;
    bitrate?: number;
    sampleRate?: number;
    bitsPerSample?: number;
    channels?: number;
    duration?: number;
    tool?: string;
    tagTypes: string[];
    composer: string[];
    bpm?: number;
    label: string[];
    comment: string[];
}
