<template>
    <div class="root">
        <main>
            <div class="top-title">
                <h1>Home</h1>
            </div>
            <div class="content">
                <section class="home-list most-played">
                    <h2>Jump right back in</h2>
                    <div class="horiz-list">
                        <div class="home-list-item" v-for="item in mostPlayed" :key="item.id">
                            <img :src="getAlbumImage(item)">
                            <div class="song-info">
                                <p class="song-title">{{item.title}}</p>
                                <p class="song-artist">{{item.artist}}</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="home-list most-played">
                    <h2>Most played songs</h2>
                    <div class="horiz-list">
                        <div class="home-list-item" v-for="item in mostPlayed" :key="item.id">
                            <img :src="getAlbumImage(item)">
                            <div class="song-info">
                                <p class="song-title">{{item.title}}</p>
                                <p class="song-artist">{{item.artist}}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    </div>
</template>

<script>
export default {
    data() {
        return {
            mostPlayed: [
                {"title":"Humans","artist":"Night Tapes","album":"Humans","duration":"4:11","path":"/Users/temmiefox/Music/Night Tapes/Humans/01 Night Tapes - Humans.mp3","id":"SoWiyKAFwP","hasImage":1,"trackNum":1,"year":"2022.0","disc":null},
                {"title":"Humans (live)","artist":"Night Tapes","album":"Humans (Volt live)","duration":"4:23","path":"/Users/temmiefox/Music/Night Tapes - Humans (live).mp3","id":"P9MPTiECYp","hasImage":1,"trackNum":1,"year":"2022.0","disc":null},
                {"title":"Forever","artist":"Night Tapes","album":"Dream Forever In Glorious Stereo","duration":"4:10","path":"/Users/temmiefox/Music/Night Tapes/Dream Forever In Glorious Stereo/02 Night Tapes - Forever.mp3","id":"cGylHuapou","hasImage":1,"trackNum":2,"year":"2019.0","disc":null},
                {"title":"Fever Dream Kids","artist":"Night Tapes","album":"Download Spirit","duration":"4:12","path":"/Users/temmiefox/Music/Night Tapes/Download Spirit/01 Night Tapes - Fever Dream Kids.mp3","id":"tazuU7SGkX","hasImage":1,"trackNum":1,"year":"2020.0","disc":null},
                {"title":"Humans","artist":"Night Tapes","album":"Humans","duration":"4:11","path":"/Users/temmiefox/Music/Night Tapes/Humans/01 Night Tapes - Humans.mp3","id":"SoWiyKAFwP","hasImage":1,"trackNum":1,"year":"2022.0","disc":null},
                {"title":"Humans (live)","artist":"Night Tapes","album":"Humans (Volt live)","duration":"4:23","path":"/Users/temmiefox/Music/Night Tapes - Humans (live).mp3","id":"P9MPTiECYp","hasImage":1,"trackNum":1,"year":"2022.0","disc":null},
                {"title":"Forever","artist":"Night Tapes","album":"Dream Forever In Glorious Stereo","duration":"4:10","path":"/Users/temmiefox/Music/Night Tapes/Dream Forever In Glorious Stereo/02 Night Tapes - Forever.mp3","id":"cGylHuapou","hasImage":1,"trackNum":2,"year":"2019.0","disc":null},
                {"title":"Fever Dream Kids","artist":"Night Tapes","album":"Download Spirit","duration":"4:12","path":"/Users/temmiefox/Music/Night Tapes/Download Spirit/01 Night Tapes - Fever Dream Kids.mp3","id":"tazuU7SGkX","hasImage":1,"trackNum":1,"year":"2020.0","disc":null}

            ]
        }
    },
    methods: {
        getAlbumImage(song) {
            let port = this.$store.state.nav.port
            if (song.hasImage == 1) {
                let artistAlbum = `http://localhost:${port}/images/${(song.artist + song.album).replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')}.jpg`;
                return artistAlbum
            } else {
                return '../../assets/no_album.svg'
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.root {
}

main {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
}

.top-title {
    padding: 40px 70px 20px;
    display: flex;
    align-items: center;
    width: calc(100% - 140px);
    max-width: 1050px;

    h1 {
        font-size: 3.5em;
        margin: 0;
        letter-spacing: -0.04em;
    }
}

.darwin .top-title h1 {
    letter-spacing: -0.02em;
}

.content {
    width: 100%;

    section.home-list {
        width: 100%;

        h2 {
            margin-left: 70px;
            font-weight: 600;
        }

        .horiz-list {
            display: flex;
            overflow-x: auto;
            padding: 0px 70px 10px;

            .home-list-item {
                padding: 0px 20px;

                img {
                    width: 150px;
                    height: 150px;
                    border-radius: 5px;
                }

                .song-info {
                    margin-left: 5px;
                    margin-top: 6px;

                    .song-title {
                        font-size: 0.9em;
                        font-weight: 600;
                        margin-top: 0px;
                    }

                    .song-artist {
                        font-size: 0.75em;
                        opacity: 0.75;
                    }

                    p {
                        margin: 5px 0px;
                    }
                }
            }

            .home-list-item:first-child {
                padding-left: 0px;
            }

            .home-list-item:last-child {
                padding-right: 0px;
            }
        }


        .horiz-list:hover::-webkit-scrollbar-thumb {
            background: var(--text-op);
            border: solid 4px var(--bg);
            border-left-width: 70px;
            border-right-width: 70px;
        }

        .horiz-list::-webkit-scrollbar-thumb {
            background: transparent;
        }
    }
}
</style>