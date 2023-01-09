<template>
  <q-layout view="hHh lpR fFf" @scroll="scrolling">
    <q-header :elevated="!onTop" :class="`${onTop ? 'on-top' : ''}`">
      <q-toolbar :class="`${!onTop ? 'shadow-2' : ''}`">
        <div class="col-2"></div>
        <div class="col-8">
          <q-btn flat round dense icon="menu" class="q-mr-sm" />

          <div class="float-right">
            <q-btn stretch flat no-caps label="Home" to="/" />
            <q-btn stretch flat no-caps label="About" href="/#about" />
            <q-btn stretch flat no-caps label="Portfolio" href="/#portfolio" />
            <q-btn stretch flat no-caps label="Contact" href="/#contact" />
          </div>
        </div>
        <div class="col-2"></div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const leftDrawerOpen = ref(false);
    const onTop = ref(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scrolling = (e: any) => {
      if (e && e.position && Number(e.position) > 10) {
        onTop.value = false;
      } else {
        onTop.value = true;
      }
    };

    return {
      leftDrawerOpen,
      onTop,
      scrolling,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
