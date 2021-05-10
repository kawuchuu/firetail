<template>
    <div class="artists">
        <div class="sticky-bg" ref="stickyBg" :class="currentScroll">
            <div class="bg-inner">
                <h3>Artists</h3>
            </div>
        </div>
        <div class="bg-gradient"></div>
        <!-- <div class="list-gradient-fade"></div> -->
        <section class="artists-list">
            <div class="artist-inner">
                <ArtistItems v-for="item in artistItems" :artist="item" :key="item.id"/>
            </div>
        </section>
        <section class="song-list">
            <router-view></router-view>
        </section>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import ArtistItems from './ArtistItems'

export default {
    components: {
        ArtistItems
    },
    computed: {
        artistItems() {
            console.log(this)
            return this.$store.state.nav.artists
        },
        ...mapState('nav', {
            currentScroll: state => {
                if (state.scrolled > 230) {
                    return 'sticky'
                } else {
                    return ''
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
    background: linear-gradient(#00d2da, transparent);
    top: 0;
    z-index: -1;
}

.sticky-bg {
    position: fixed;
    top: 0;
    height: 81px;
    width: calc(100% - #{$sidebarwidth} - 16px);
    background: #005e61;
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