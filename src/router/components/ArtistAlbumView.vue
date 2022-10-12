<template>
    <div class="artists">
        <div class="albums-container">
            <section class="artists-list">
                <virtual-list :ref="'albumList'" class="artist-inner" v-show="$route.path === '/albums'"
                    :data-key="'album'"
                    :data-sources="albumItems"
                    :dataComponent="lItem"
                />
                <!-- <ListItem v-for="item in albumItems" :source="item" :key="item.id"/> -->
                <virtual-list :ref="'artistList'" class="artist-inner" v-show="$route.path === '/artists'"
                    :data-key="'artist'"
                    :data-sources="artistItems"
                    :dataComponent="lItem"
                />
                <!-- <ListItem v-for="item in artistItems" :item="item" :key="item.id"/> -->
            </section>
            <section class="song-list">
<!--                 <div class="sticky-bg" ref="stickyBg" :class="currentScroll">
                    <div class="bg-inner">
                        <h3 v-if="$route.query.q">{{ $route.query.q }}</h3>
                        <h3 v-else>Albums</h3>
                    </div>
                </div> -->
                <div class="special-gradient-bg-wrapper">
                    <div class="bg-gradient" :style="imgBackground"></div>
                    <div class="bg-gradient-layer"></div>
                </div>
                <router-view></router-view>
            </section>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import ListItem from './ListItem'

export default {
    components: {
        //ListItem
    },
    data() {
        return {
            lItem: ListItem,
        }
    },
    computed: {
        albumItems() {
            if (this.$route.path === '/albums') return this.$store.state.nav.albums
            else return []
        },
        artistItems() {
            if (this.$route.path === '/artists') return this.$store.state.nav.artists
            else return []
        },
        ...mapState('nav', {
            currentScroll: state => {
                if (state.scrolled > 278) {
                    return 'sticky'
                } else {
                    return ''
                }
            },
            imgBackground: state => {
                let artURL = state.albumViewCurrentArt
                if (artURL == '' || !artURL) {
                    return ''
                } else {
                    return `background-image: url('${artURL}'); filter: blur(25px) brightness(0.6)`
                }
            }
        })
    },
    watch: {
        $route(to, from) {
            if (to.path == '/albums' && from.path == '/artists') {
                this.$refs.albumList.scrollToOffset(0)
                console.log('to albums')
            } else if (to.path == '/artists' && from.path == '/albums') {
                this.$refs.artistList.scrollToOffset(0)
                console.log('to artists')
            }
        }
    }
}
</script>

<style lang="scss">
.artist-inner {
    overflow: hidden;
    overflow-y: auto;
    width: 100%;
    max-width: 270px;
    z-index: 4;
    height: calc(100% - 160px);
    padding: 15px;
    background: var(--bg);
    border-right: solid #5f587c 1px;
    position: fixed;
    top: 50px;
    border-radius: var(--main-border-radius);
}

.artist-inner::-webkit-scrollbar {
    display: none;
}

.artist-inner:hover::-webkit-scrollbar {
    display: block;
    width: 15px !important;
}

.artist-inner:hover {
    padding-right: 0px;
    max-width: 285px;
}

.list-fade {
    position: fixed;
    z-index: 10;
    top: 0;
    width: 270px;
    height: 68px;
    background: linear-gradient(var(--bg), var(--bg), var(--bg), transparent);
    padding: 0px 15px;
    transform: translateX(-15px);
    pointer-events: none;
}

.albums-container {
    display: grid;
    grid-template-areas: 'albums list';
    grid-template-columns: 300px 1fr;
    width: 100%;
    height: 100%;
}

.artists-list {
    min-width: 300px;
}

.song-list {
    width: 100%;
    height: 100%;
}

.bg-gradient {
    position: absolute;
    width: 100%;
    height: 450px;
    max-height: 450px;
    //background-color: #5e00da;
    background-position: center;
    background-size: 150%;
    background-repeat: no-repeat;
    top: 0;
    z-index: -1;
    overflow: hidden;
    transform: scale(1.3);
}

.bg-gradient-layer {
    position: absolute;
    width: 100%;
    height: 600px;
    background: linear-gradient(transparent, var(--bg)), radial-gradient(farthest-corner at 5% 10%, transparent 5%, var(--bg));
    top: 0;
    z-index: -1;
}

.special-gradient-bg-wrapper {
    max-height: 600px;
    height: 600px;
    width: 100%;
    overflow: hidden;
    position: absolute;
    top: 0;
}

/* .sticky-bg {
    position: fixed;
    top: 0;
    height: 81px;
    width: calc(100% - 225px - 16px);
    background: rgba(0,0,0,.65);
    z-index: 3;
    opacity: 0;
    transition: 0.15s;
    transition-property: opacity;

    .bg-inner {
        height: 50px;
        display: flex;
        align-items: center;

        h3 {
            margin: 0 110px;
            font-size: 24px;
            letter-spacing: -1px;
        }
    }
}

.sticky-bg.sticky {
    opacity: 1;
} */

.list-gradient-fade {
    width: 100%;
    height: 300px;
    position: absolute;
    background: linear-gradient(#12121233, transparent);
}

@media (max-width: 1350px) {
    .artist-inner {
        max-width: 80px;
        transition: 0.3s cubic-bezier(0, 1, 0.35, 1);
        //transition-delay: 0.2s;
    }
    .artists-list:hover {
        box-shadow: 2px 0px 10px rgba(0,0,0,.15);

        .list-fade {
            width: 270px;
        }

        .albums-item {
            width: calc(100% - 15px);
        }

        .albums-item a span {
            opacity: 0.65 !important;
        }

        .albums-item:hover a span, .albums-item a.router-link-exact-active span {
            opacity: 1 !important;
        }
    }
    .albums-container {
        grid-template-columns: 110px 1fr;
    }
    .list-fade {
        width: 80px;
        transition: 0.3s cubic-bezier(0, 1, 0.35, 1);
    }
    .albums-item a span {
        opacity: 0 !important;
        transition: 0.2s;
        transition-property: opacity;
    }
}
</style>