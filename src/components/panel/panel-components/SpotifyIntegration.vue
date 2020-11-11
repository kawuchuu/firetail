<template>
    <div class="integration-wrapper">
        <div class="1 shown" ref="1">
            <div class="message-wrapper">
                <p style="color: #ff3a3a"><b>THIS, ALONG WITH PANELS, ARE INCOMPLETE FEATURES AND COULD BREAK AT ANYTIME.</b></p>
                <p>Firetail supports fetching song metadata from Spotify! In order to enable this feature, you will have to setup a couple things.</p>
                <p>In order to fetch from Spotify, we'll need you to create a new Spotify application and provide Firetail its client ID and secret.</p>
                <p>To continue, click next.</p>
            </div>
            <div class="buttons">
                <Button :button="{label: 'Next'}" @click.native="nextButton"/>
            </div>
        </div>
        <div ref="2" class="2 hide">
            <div class="input-app-info">
                <p>Please provide your Spotify app's client ID & secret. Official instructions will be available at a later date.</p>
                <div class="spotify-input">
                    <div class="input">
                        <label class="input-label">Client ID</label>
                        <input type="text" v-model="clientID" placeholder="eg. 0123456789abcdef0123456789abcdef">
                    </div>
                    <div class="input">
                        <label class="input-label">Client secret</label>
                        <input type="password" v-model="clientSecret" placeholder="eg. 0123456789abcdef0123456789abcdef">
                    </div>
                </div>
            </div>
            <div class="buttons">
                <Button :button="{label: 'Back'}" @click.native="prevButton"/>
                <Button :button="{label: 'Next'}" @click.native="nextButton('wait')"/>
            </div>
        </div>
        <div ref="3" class="3 hide">
            <p>Your browser should have opened a Spotify authorisation page. Follow their instructions to continue.</p>
            <div class="spinner-text">
                <div class="load-spinner"></div>
                <span>Waiting for a response from Spotify...</span>
            </div>
        </div>
        <div ref="4" class="4 hide">
            <div class="final">
                <div class="confirm">
                    <i class="material-icons-outlined">check_circle_outline</i>
                    <span>Connected to Spotify successfully</span>
                </div>
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
        nextButton(action) {
            if (action == 'wait' && (this.clientID == '' || this.clientSecret == '')) return
            let oldNum = this.active
            this.active++
            this.doShow(this.active, oldNum)
            switch(action) {
                case "wait":
                    ipcRenderer.send('openLink', `http://localhost:56741/login?client_id=${this.clientID}&client_auth=${btoa(this.clientID + ':' + this.clientSecret)}`)
                    ipcRenderer.once('spotifyAuthFinish', () => {
                        this.nextButton()
                    })
                    break;
                default:
            }
        },
        prevButton() {
            if (this.active != 1) {
                let oldNum = this.active
                this.active--
                this.doShow(this.active, oldNum)
            }
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
            clientID: '',
            clientSecret: ''
        }
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