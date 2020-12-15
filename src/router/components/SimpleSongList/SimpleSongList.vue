<template>
    <div class="root">
        <div class="blank" v-if="list.length == 0">
            <i class="material-icons-outlined">person</i>
        </div>
        <div v-else>
            <div class="actionsContainer">
                <b>ACTIONS</b>
                <div class="actionsButtons">
                    <Button :button="{label: 'Play Random'}" @click.native="playRandom()"/>
                    <Button :button="{label: 'Burn'}" @click.native="burn()"/>
                </div>
            </div>
            <div class="list-section">
                <i class="material-icons-outlined play-pause" style="visibility: hidden;">play_arrow</i>
                <i class="material-icons-outlined favourite-icon" style="visibility: hidden">favorite_border</i>
                <div class="artist-title-album section">
                    <p class="list-title">{{ $t('songList.listTitle') }}</p>
                    <p class="list-duration"><i class="material-icons-outlined">schedule</i></p>
                </div>
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
import Button from '@/components/Button.vue';


export default {
    components: {
        SongItem,
        Button
    },
    computed: mapState('audio', {
        list: function(state) {
            return state.currentList
        },
        burn: async function(state) {
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
    }),
    methods: {
        playRandom: () => {
            alert("Play Random");
        }
    }
}
</script>

<style lang="scss" scoped>
.root {
    width: 100%;
    height: 100%;
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
    padding-right: 40px;
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
    padding-right: 20px;
}

.list-section {
    overflow: hidden;
    height: 30px;
    display: flex;
    align-items: center;
    top: 0;
    z-index: 11;
    background: var(--bg);
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: solid 1px var(--bd);
    position: sticky;
}

.list-section .list-duration:hover {
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
    padding: 0 5px 0 15px;
}

.blank {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
        font-size: 134px;
        opacity: 0.25;
    }
}

.actionsContainer {
    padding: 9px;
}
</style>