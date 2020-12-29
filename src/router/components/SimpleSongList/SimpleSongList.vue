<template>
    <div class="root">
        <div class="top-title" ref="topTitle">
            <div class="tab-album-art" :style="getArtistImage"></div>
            <div>
                <h1>{{ list[0].artist }}</h1>
                <p>{{ screenCountNum }} songs</p>
            </div>
        </div>
        <div class="root-wrapper">
            <div v-show="isCDEnabled" class="actionsContainer">
                <b>ACTIONS</b>
                <div class="actionsButtons">
                    <Button :button="{label: 'Play Random'}" @click.native="playRandom()"/>
                    <Button :button="{label: 'Burn'}" @click.native="burn()"/>
                </div>
            </div>
            <div class="list-section" :class="currentScroll">
                <i class="material-icons-outlined play-pause" style="visibility: hidden;">play_arrow</i>
                <i class="material-icons-outlined favourite-icon" style="visibility: hidden">favorite_border</i>
                <div class="artist-title-album section">
                    <p class="list-title">{{ $t('songList.listTitle') }}</p>
                    <p class="list-duration"><i class="material-icons-outlined">schedule</i></p>
                </div>
                <div class="sec-border"></div>
            </div>
            <div class="wrapper">
                <SongItem v-for="item in list" :song="item" :key="item.id"/>
            </div>
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import SongItem from './SimpleSongItem'
import { mapState } from 'vuex'
import axios from 'axios'
import Button from '@/components/Button.vue';

export default {
    components: {
        SongItem,
        Button
    },
    asyncComputed: {
        ...mapState('audio', {
            list: function(state) {
                return state.currentList
            },
            spotifyToken: state => state.spotifyActiveToken,
            async getArtistImage() {
                try {
                    let token = this.spotifyToken
                    let artist = this.list[0].artist
                    console.log(artist)
                    if (token == "" || token == null) return
                    let resp = await axios({
                        method: 'GET',
                        url: 'https://api.spotify.com/v1/search',
                        params: {
                            q: artist,
                            type: 'artist',
                            limit: 1
                        },
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    let img = resp.data.artists.items[0].images[1].url
                    console.log(img)
                    return `background-image: url('${img}')`
                } catch(err) {
                    return ''
                }
            },
            burn: async function(state) {
                if (process.platform == 'linux') {
                    let canBurn = await ipcRenderer.invoke('canBurn');
                    if (canBurn) {
                        console.log(state.currentList);
                        if (confirm(`Burn ${state.currentList.length} items to disc?`)) {
                            //Start burning to disc
                            let burnJobId = await ipcRenderer.invoke("burn", {
                                items: state.currentList.map(item => {
                                    return {
                                        path: item.path,
                                        title: item.title,
                                        artist: item.artist
                                    }
                                }),
                                title: "CD" // In other views, replace this with the album name
                            });
                            console.log(`Starting burn job ${burnJobId}`);
                        }
                    } else {
                        alert("Burning a CD is not possible at this time");
                    }
                }
            },
        }),
        ...mapState('nav', {
            screenCountNum: state => state.screenCountNum,
            currentScroll: state => {
                if (state.scrolled > 200) {
                    return 'sticky'
                } else {
                    return ''
                }
            },
            isCDEnabled: state => state.isCDBurnEnable
        })
    },
    methods: {
        playRandom: () => {
            alert("Play Random");
        }
    }
}
</script>

<style lang="scss" scoped>
$currentGradColour: $gradient1;
$subColour: desaturate(darken($currentGradColour, 25%), 40%);

.wrapper {
    padding: 5px 20px;
}

.bg-gradient {
    position: absolute;
    width: 100%;
    height: 450px;
    background: linear-gradient($currentGradColour, transparent);
    top: 0;
    z-index: -1;
}

.artist-title-album {
    display: flex;
    width: calc(100% - 72px);
    font-size: 14px;
    align-items: center;
}

.list-title {
    margin: 0;
    margin-left: 14px;
    width: 100%;
    padding-right: 40px !important;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 9px 0;
    pointer-events: none;
    white-space: nowrap;
}

.list-duration {
    width: calc(30% - 77px);
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 9px 0;
    pointer-events: none;
    white-space: nowrap;
}

.artist-title-album .list-duration i {
    font-size: 18px;
    padding: 0 6px;
}

.list-duration {
    width: 40px;
    text-align: right;
    padding-right: 22px;
}

.list-section {
    overflow: hidden;
    height: 30px;
    display: flex;
    align-items: center;
    top: 0;
    z-index: 3;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: solid 1px #ffffff3f;
    position: sticky;
    margin-bottom: 5px;
    margin: 0px 20px;
}

.list-section.sticky {
    margin: 0;
    padding: 0px 20px;
}

.list-section .list-artist:hover, .list-section .list-album:hover, .list-section .list-duration:hover {
    color: var(--text);
    text-decoration: none;
    cursor: default;
    opacity: 1;
}

.list-section .list-duration:active {
    color: var(--text);
    text-decoration: none;
    opacity: 1;
}

div.section {
    font-size: 12px;
    opacity: .75;
}

.results-link .favourite-icon {
    font-size: 20px;
    cursor: pointer;
    padding-right: 10px;
}

.play-pause {
    font-size: 24px !important;
    padding: 0;
    cursor: pointer;
    opacity: 0;
}

.results-link i, .list-section i {
    padding: 0 10px;
}

.top-title {
    padding: 50px 25px 50px 50px;
    display: flex;
    align-items: center;
    //background: linear-gradient(#e74e8e, #e74e8ea6)
}

.top-title h1 {
    font-size: 64px;
    margin: 0;
    letter-spacing: -2px;
}

.top-title p {
    margin: 0px;
    margin-top: 5px;
    opacity: .75;
}

.tab-album-art {
    min-width: 130px;
    height: 130px;
    background-color: #000000b3;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url('../../../assets/no_artist.svg');
    border-radius: 100px;
    margin-right: 40px;
}

.actionsContainer {
    padding: 9px;
}
</style>