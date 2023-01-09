<template>
  <q-page>
    <div class="row">
      <div class="col-2"></div>
      <div class="col-8">Portfolio</div>
      <div class="col-2"></div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PortfolioPage',
  components: {},
  setup() {
    const firstname = 'Arthur';
    const surname = 'Brabo';
    const registration = 'A22204108';
    const email = 'arthurbrabo5@gmail.com';
    const shortSummary = 'Lorem ipsum dolor sit amet, consectetur.';

    return { firstname, surname, registration, email, shortSummary };
  },
});
</script>
