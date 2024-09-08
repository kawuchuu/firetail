interface FiretailSong {
    title: string;
    artist: string;
    allArtists: string[] | string;
    albumArtist: string;
    album: string;
    duration: string;
    realdur: number;
    path: string;
    id: string;
    hasImage: number;
    trackNum?: number;
    year?: string;
    disc?: number;
    explicit?: boolean | number;
    genre?: string;
}

export default FiretailSong;