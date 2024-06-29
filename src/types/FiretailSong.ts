interface FiretailSong {
    title: string;
    artist: string;
    allArtists: string[];
    albumArtist: string;
    album: string;
    duration: string;
    realdur: number;
    path: string;
    id: string;
    hasImage: boolean;
    trackNum?: number;
    year?: string;
    disc?: number;
    explicit?: boolean;
    genre?: string;
}

export default FiretailSong;