<template>
  <div class="scrollable-content" ref="container" @scroll="updateScrollbar">
    <div class="content" ref="content">
      <slot></slot>
    </div>
    <div class="scrollbar" ref="scrollbar" @mousedown="startDrag" @touchstart="startDrag">
      <div class="thumb" ref="thumb"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dragging: false,
      startY: 0,
      startThumbTop: 0
    };
  },
  mounted() {
    this.updateScrollbar();
  },
  updated() {
    this.updateScrollbar();
  },
  methods: {
    updateScrollbar() {
        const scrollableContent = this.$refs.container;
        const scrollbar = this.$refs.scrollbar;
        const thumb = this.$refs.thumb;
        if (!scrollableContent || !scrollbar || !thumb) return;

        const clientHeight = scrollableContent.clientHeight;
        const scrollHeight = scrollableContent.scrollHeight;
        const scrollRatio = clientHeight / scrollHeight;

        if (scrollRatio >= 1) {
            // Hide scrollbar if no scrolling is required
            scrollbar.style.opacity = 0;
            thumb.style.height = 0;
            return;
        } else {
            scrollbar.style.opacity = 1;
        }

        // Calculate thumb size and position
        const thumbHeight = clientHeight * scrollRatio;
        const thumbTop = Math.floor((scrollableContent.scrollTop / scrollHeight) * clientHeight);

        thumb.style.height = `${thumbHeight}px`;
        thumb.style.top = `${thumbTop}px`;

        // Update scrollable content position when thumb is dragged
        /* thumb.onmousedown = (event) => {
            event.preventDefault();

            const startY = event.clientY;
            const startTop = thumb.offsetTop;

            const onMouseMove = (event) => {
            const diffY = event.clientY - startY;
            const thumbTop = Math.min(Math.max(0, startTop + diffY), clientHeight - thumbHeight);
            thumb.style.top = `${thumbTop}px`;

            // Update scrollable content position
            const scrollPosition = (thumbTop / clientHeight) * scrollHeight;
            scrollableContent.scrollTop = scrollPosition;
            };

            const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }; */

        // Update thumb position when scrollable content is scrolled manually
        scrollableContent.onscroll = () => {
            const thumbTop = Math.floor((scrollableContent.scrollTop / scrollHeight) * clientHeight);
            thumb.style.top = `${thumbTop}px`;
        };
    },
    startDrag(event) {
        event.preventDefault();
        this.dragging = true;
        this.startY = event.clientY || event.touches[0].clientY;
        this.startThumbTop = parseInt(this.$refs.thumb.style.top) || 0;
        document.addEventListener("mousemove", this.drag);
        document.addEventListener("mouseup", this.stopDrag);
        document.addEventListener("touchmove", this.drag, { passive: false });
        document.addEventListener("touchend", this.stopDrag);
    },
    drag(event) {
        event.preventDefault();
        const container = this.$refs.container;
        const content = this.$refs.content;
        //const scrollbar = this.$refs.scrollbar;
        const thumb = this.$refs.thumb;

        const y = event.clientY || event.touches[0].clientY;
        const thumbDeltaY = y - this.startY;

        const maxThumbTop = container.clientHeight - thumb.clientHeight;
        const thumbTop = Math.min(Math.max(this.startThumbTop + thumbDeltaY, 0), maxThumbTop);

        thumb.style.top = `${thumbTop}px`;
        content.style.transform = `translateY(-${thumbTop / container.clientHeight * (content.scrollHeight - container.clientHeight)}px)`;
    },
    stopDrag() {
        this.dragging = false;
        document.removeEventListener("mousemove", this.drag);
        document.removeEventListener("mouseup", this.stopDrag);
        document.removeEventListener("touchmove", this.drag);
        document.removeEventListener("touchend", this.stopDrag);
    }
  }
};
</script>

<style>
.scrollable-content {
    overflow: hidden;
    overflow-y: auto;
    position: fixed;
    height: calc(100% - 130px);
    width: calc(100% - var(--sidebar-width));
    background: var(--bg);
    border-radius: var(--main-border-radius);
}

.content {
  width: 100%;
  height: max-content;
}

.scrollbar {
  position: fixed;
  right: 0;
  top: 44px;
  bottom: 0;
  width: 12px;
  /* background-color: red; */
  border-radius: 5px;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  height: calc(100% - 130px);
  z-index: 55;
}

.scrollbar:hover {
  opacity: 1;
}

.thumb {
  position: absolute;
  left: 0;
  right: 0;
  width: 8px;
  background-color: #ffffff2c;
  border-radius: 5px;
}
</style>