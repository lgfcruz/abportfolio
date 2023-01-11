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
      <q-page>
        <router-view />
        <div class="row section-footer">
          <div class="col-2"></div>
          <div class="col-8">
            <div class="row">
              <div class="col-4">
                <div class="location">Lisbon, Portugal</div>
              </div>
              <div class="col-4 text-center">
                <a class="email" :href="`mailto:${email}`" :title="email">{{
                  email
                }}</a>
              </div>
              <div class="col-4 text-right social">
                <a href="#" title="facebook"
                  ><q-icon name="fa-brands fa-facebook"
                /></a>
                <a href="#" title="facebook"
                  ><q-icon name="fa-brands fa-twitter"
                /></a>
                <a
                  href="https://www.youtube.com/@4speedmain780"
                  title="facebook"
                  target="_blank"
                  ><q-icon name="fa-brands fa-youtube"
                /></a>
                <a href="#" title="facebook"
                  ><q-icon name="fa-brands fa-instagram"
                /></a>
              </div>
            </div>

            <div class="row q-mt-xl">
              <div class="col-12">
                <p class="text-weight-light text-center">
                  Copyright © 2023 Arthur Brabo
                </p>
              </div>
            </div>
          </div>
          <div class="col-2"></div>
        </div>
      </q-page>
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

    const email = 'arthurbrabo5@gmail.com';

    return {
      leftDrawerOpen,
      onTop,
      scrolling,
      email,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
