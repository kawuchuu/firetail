<template>
    <div class="integration-wrapper">
        <div ref="1" class="1 shown">
            <p>Your browser should have opened a Spotify authorisation page. Follow their instructions to continue.</p>
            <div class="spinner-text">
                <div class="load-spinner"></div>
                <span>Waiting for a response from Spotify...</span>
            </div>
        </div>
        <div ref="2" class="2 hide">
            <div class="final">
                <div class="confirm">
                    <i class="material-icons-outlined">check_circle_outline</i>
                    <span>Connected to Spotify successfully</span>
                </div>
                <p>Hi, {{user}}!</p>
                <p>Firetail can now fetch metadata from Spotify!</p>
            </div>
            <div class="buttons">
                <Button :button="{label: 'Done'}" @click.native="close()"/>
            </div>
        </div>
    </div>
</template>

<script>
import Button from '@/components/Button'
import { ipcRenderer } from 'electron'

export default {
    props: ['props'],
    components: {
        Button
    },
    methods: {
        doShow(num, oldNum) {
            this.$refs[num].classList.add('shown')
            this.$refs[num].classList.remove('hide')
            this.$refs[oldNum].classList.add('hide')
            this.$refs[oldNum].classList.remove('shown')
        },
        close() {
            this.$store.commit('panel/updateActive', false)
        }
    },
    data() {
        return {
            buttons: [
                {
                    label: 'Back',
                },
                {
                    label: 'Next'
                }
            ],
            active: 1,
            comp: this,
            user: 'unknown'
        }
    },
    mounted: async function() {
        const randomString = length => {
            let text = ''
            let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            for (let i = 0; i < length; i++) {
                text += characters.charAt(Math.floor(Math.random() * characters.length))
            }
            return text
        }
        const random = randomString(99);
        const buffer = new TextEncoder().encode(random);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const codeChallenge = btoa(String.fromCharCode.apply(null, new Uint8Array(hashBuffer))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        const state = randomString(20);
        sessionStorage.setItem('temp-state', state);
        sessionStorage.setItem('code-verifier', random);
        const query = new URLSearchParams({
            'client_id': 'd1084781b7af46d6b6948192e372e4a6',
            'response_type': 'code',
            'redirect_uri': 'http://localhost:56741/spconnect/',
            'code_challenge_method': 'S256',
            'code_challenge': codeChallenge,
            'state': state
        }).toString()
        ipcRenderer.send('openLink', `https://accounts.spotify.com/authorize?${query}`)
        ipcRenderer.once('spotifyAuthFinish', async (evt, args) => {
            if (sessionStorage.getItem('temp-state') == args.state) {
                const query = new URLSearchParams({
                    'client_id': 'd1084781b7af46d6b6948192e372e4a6',
                    'grant_type': 'authorization_code',
                    'code': args.code,
                    'redirect_uri': 'http://localhost:56741/spconnect/',
                    'code_verifier': sessionStorage.getItem('code-verifier')
                })
                const resp = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: query.toString()
                })
                const data = await resp.json()
                if (data.error) return console.error(data)
                localStorage.setItem('sp-token', data.access_token)
                localStorage.setItem('refresh-token', data.refresh_token)
                localStorage.setItem('expires', Date.parse(new Date()) + (data.expires_in * 1000))
                fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('sp-token')}`
                    }
                }).then(sresp => {
                    sresp.json().then(account => {
                        if (account.error) return console.error(account)
                        const details = {
                            name: account.display_name,
                            uri: account.uri
                        }
                        localStorage.setItem('sp-name', details.name)
                        localStorage.setItem('sp-uri', details.uri)
                        this.$store.commit('nav/updateSpotifyDetails', details)
                        this.$store.commit('nav/updateSpotifyActive', true)
                        this.user = account.display_name
                        this.active++;
                        this.doShow(2, 1)
                    })
                })
            }
        })
    }
}

</script>

<style scoped>
.shown {
    display: block;
}

.hide {
    display: none;
}

.buttons {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.integration-wrapper {
    padding: 10px 20px 15px;
    height: 100%;
}

.spotify-input {
    display: flex;
    flex-direction: column;
}

.input {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
}

.input label {
    font-size: 12px;
    opacity: 0.75;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
}

.input input {
    background: var(--fg-bg);
    border: none;
    padding: 10px 15px;
    height: 20px;
    color: var(--text);
    font-family: Inter, sans-serif;
    border-radius: 10px;
    outline: none;
}

.input input:focus {
    background: var(--bd)
}

p {
    margin-top: 0;
}

.spinner-text {
    display: flex;
    align-items: center;
    padding: 20px;
    padding-left: 0;
}

.spinner-text span {
    margin-left: 20px;
}

.final {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.confirm {
    display: flex;
    align-content: center;
    padding: 20px 20px 40px;
}

.confirm span {
    margin-left: 20px;
    font-weight: bold;
    font-size: 20px;
}

.confirm i {
    font-size: 30px;
}
</style>