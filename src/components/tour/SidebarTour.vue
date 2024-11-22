<script>
import PointingArrow from "./PointingArrow.vue";
import TourSheet from "./TourSheet.vue";

export default {
  name: "SidebarTour",
  components: {TourSheet, PointingArrow},
  data() {
    return {
      part: 0,
      text: [
        {
          title: 'Sidebar',
          desc: "This is the main sidebar. Use these buttons to navigate through most of the app.",
          pointing: 'left'
        },
        {
          title: 'Songs',
          desc: 'All songs in your library are displayed here in one list.',
          pointing: 'left'
        },
        {
          title: 'Artists',
          desc: 'Split up the long song list and filter by artist here.',
          pointing: 'left'
        },
        {
          title: 'Albums',
          desc: 'Want to listen to a single album? View them all here.',
          pointing: 'left'
        },
        {
          title: 'Favourites',
          desc: 'Have a few songs you really enjoy? All your favourites are here.',
          pointing: 'left'
        },
        {
          title: 'Playlists',
          desc: 'Want to only listen to select songs? Create and view playlists here.',
          pointing: 'left'
        },
        {
          title: 'Playing Bar',
          desc: "This is the playing bar. You can view and control everything that's currently playing here.",
          pointing: 'down'
        }
      ]
    }
  },
  methods: {
    advancePart() {
      if (this.part === this.text.length - 1) this.$store.commit('nav/updateTourMode', false)
      else this.part++
    },
    backPart() {
      if (this.part === 0) return
      this.part--
    }
  },
  provide() {
    return {
      part: this.part,
      advancePart: this.advancePart,
      backPart: this.backPart
    }
  }
}
</script>

<template>
<div class="sidebar-tour">
  <div class="highlight-tour" :class="`sidebar-${part}`"></div>
  <PointingArrow :class="`pa-${part}`" :pointing="text[part].pointing" />
  <TourSheet :class="`ts-${part}`">
    <h1>{{this.text[this.part].title}}</h1>
    <p>{{this.text[this.part].desc}}</p>
  </TourSheet>
</div>
</template>

<style scoped lang="scss">
.pa-0 {
  position: fixed;
  top: 200px;
  left: calc(var(--sidebar-width) + 16px);
}
.ts-0 {
  top: 180px;
  left: calc(var(--sidebar-width) + 80px);
}
.highlight-tour.sidebar-0 {
  width: calc(var(--sidebar-width) - 20px);
  height: calc(100% - 85px - 20px);
}


.pa-1 {
  position: fixed;
  top: 90px;
  left: calc(var(--sidebar-width) + 16px);
}
.ts-1 {
  top: 80px;
  left: calc(var(--sidebar-width) + 80px);
}
.highlight-tour.sidebar-1 {
  top: 77px;
  width: calc(var(--sidebar-width) - 20px);
  height: 47px;
  border-radius: 14px;
}

.pa-2 {
  position: fixed;
  top: 135px;
  left: calc(var(--sidebar-width) + 20px);
}
.ts-2 {
  top: 125px;
  left: calc(var(--sidebar-width) + 80px);
}
.highlight-tour.sidebar-2 {
  top: 119px;
  width: calc(var(--sidebar-width) - 20px);
  height: 47px;
  border-radius: 14px;
}

.pa-3 {
  position: fixed;
  top: 180px;
  left: calc(var(--sidebar-width) + 20px);
}
.ts-3 {
  top: 170px;
  left: calc(var(--sidebar-width) + 80px);
}
.highlight-tour.sidebar-3 {
  top: 161px;
  width: calc(var(--sidebar-width) - 20px);
  height: 47px;
  border-radius: 14px;
}

.pa-4 {
  position: fixed;
  top: 225px;
  left: calc(var(--sidebar-width) + 20px);
}
.ts-4 {
  top: 215px;
  left: calc(var(--sidebar-width) + 80px);
}
.highlight-tour.sidebar-4 {
  top: 203px;
  width: calc(var(--sidebar-width) - 20px);
  height: 47px;
  border-radius: 14px;
}

.pa-5 {
  position: fixed;
  top: 295px;
  left: calc(var(--sidebar-width) + 20px);
}
.ts-5 {
  top: 285px;
  left: calc(var(--sidebar-width) + 80px);
}
.highlight-tour.sidebar-5 {
  top: 260px;
  width: calc(var(--sidebar-width) - 20px);
  height: calc(100vh - 85px - 280px);
}

.pa-5 {
  position: fixed;
  top: 295px;
  left: calc(var(--sidebar-width) + 20px);
}
.ts-5 {
  top: 285px;
  left: calc(var(--sidebar-width) + 80px);
}
.highlight-tour.sidebar-5 {
  top: 260px;
  width: calc(var(--sidebar-width) - 20px);
  height: calc(100vh - 85px - 280px);
}

.pa-6 {
  position: fixed;
  top: calc(100vh - 125px);
  left: calc(50vw - 20px);
}
.ts-6 {
  top: calc(100vh - 350px);
  left: calc(50vw - 125px);
}
.highlight-tour.sidebar-6 {
  top: calc(100vh - 85px);
  width: calc(100vw - 20px);
  height: 65px;
}
</style>