<template>
    <div class="artists-item">
        <router-link :to="`?hideTop=true&column=artist&q=${encodeURIComponent(artist.artist)}&view=artist_${encodeURIComponent(artist.artist)}`">
            <div :style="getArtistImage" class="artist-img"/>
            <span>{{ artist.artist }}</span>
        </router-link>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
export default {
    props: ['artist'],
    asyncComputed: {
        ...mapState('audio', {
            spotifyToken: state => state.spotifyActiveToken,
            async getArtistImage() {
                let token = this.spotifyToken
                let artist = this.artist.artist
                if (token == "") return
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
            }
        })
    }
}
</script>

<style scoped>
.artists-item {
    height: 60px;
    border-bottom: solid 1px var(--bd);
}

.router-link-exact-active {
    background-color: var(--li-hv);
    cursor: default;
}

.artists-item a {
    display: flex;
    align-items: center;
    height: 100%;
}

.artists-item:hover {
    background-color: var(--li-hv)
}

.artists-item a span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.artist-img {
    min-width: 45px;
    min-height: 45px;
    margin: 0px 15px;
    background-color: var(--fg-bg);
    border-radius: 60px;
    background-image: url('../../assets/no_artist.svg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
</style>