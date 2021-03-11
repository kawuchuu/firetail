<template>
    <div class="artists">
        <div class="sticky-bg" ref="stickyBg" :class="currentScroll">
            <div class="bg-inner">
                <h3 v-if="$route.query.q">{{ $route.query.q }}</h3>
                <h3 v-else>Albums</h3>
            </div>
        </div>
        <div class="special-gradient-bg-wrapper">
            <div class="bg-gradient" :style="imgBackground"></div>
            <div class="bg-gradient-layer"></div>
        </div>
        <section class="artists-list">
            <div class="artist-inner">
                <AlbumItems v-for="item in albumItems" :album="item" :key="item.id"/>
            </div>
        </section>
        <section class="song-list">
            <router-view></router-view>
        </section>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import AlbumItems from './AlbumItems'

export default {
    components: {
        AlbumItems
    },
    computed: {
        albumItems() {
            console.log(this)
            return this.$store.state.nav.albums
        },
        ...mapState('nav', {
            currentScroll: state => {
                if (state.scrolled > 200) {
                    return 'sticky'
                } else {
                    return ''
                }
            },
            imgBackground: state => {
                let artURL = state.albumViewCurrentArt
                if (artURL == '') {
                    return ''
                } else {
                    return `background-image: url('${artURL}')`
                }
            }
        })
    }
}
</script>

<style lang="scss" scoped>
.artist-inner {
    overflow: hidden;
    overflow-y: auto;
    width: 250px;
    z-index: 4;
    height: calc(100% - 225px);
    padding: 15px;
    background: #000000b3;
    border-radius: 20px;
    position: fixed;
    transform: translateY(45px);
}
.artists {
    display: flex;
    width: 100%;
    height: 100%;
}

.artists-list {
    min-width: 300px;
    height: calc(100% - 45px);
    margin-left: 15px;
}

.artist-inner::-webkit-scrollbar {
    display: none;
}

.song-list {
    width: calc(100% - 315px);
    height: 100%;
}

.bg-gradient {
    position: absolute;
    width: 100%;
    height: 450px;
    max-height: 450px;
    background-color: #00daa4;
    background-position: center;
    background-size: 150%;
    background-repeat: no-repeat;
    top: 0;
    z-index: -1;
    filter: blur(40px) brightness(0.5);
    overflow: hidden;
    transform: scale(1.3);
}

.bg-gradient-layer {
    position: absolute;
    width: 100%;
    height: 450px;
    background: linear-gradient(transparent, var(--bg));
    top: 0;
    z-index: -1;
}

.special-gradient-bg-wrapper {
    max-height: 450px;
    height: 450px;
    width: 100%;
    overflow: hidden;
    position: absolute;
    top: 0;
}

.sticky-bg {
    position: fixed;
    top: 0;
    height: 81px;
    width: 100%;
    background: rgba(0,0,0,.65);
    backdrop-filter: blur(15px);
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
}

.list-gradient-fade {
    width: 100%;
    height: 300px;
    position: absolute;
    background: linear-gradient(#12121233, transparent);
}
</style>