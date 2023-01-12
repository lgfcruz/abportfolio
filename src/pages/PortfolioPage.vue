<template>
  <div class="row section-portfolio-details" id="portfolio">
    <div class="col-2"></div>
    <div class="col-8">
      <h2 class="text-uppercase text-bold">
        <small>{{ portfolio.name }}</small>
        Portfolio
      </h2>

      <div class="q-pa-md">
        <div class="q-col-gutter-md row items-start">
          <div
            class="col-6"
            v-for="(item, index) in portfolio.projects"
            :key="index"
            @click="onClickThumb(item)"
            style="cursor: pointer"
          >
            <q-img :src="item.thumb ? item.thumb : item.src">
              <div class="absolute-bottom text-subtitle1 text-center">
                {{ item.title }}
              </div>
            </q-img>
          </div>
        </div>
      </div>
    </div>
    <div class="col-2"></div>
  </div>

  <q-dialog ref="dialogRef">
    <q-card :class="`q-dialog-50p ${selected.type}-dialog`">
      <div class="row description-content q-pt-sm q-pb-md">
        <div class="col-12 text-h5 q-pl-md">{{ selected.title }}</div>
        <div class="col-12 text-body1 q-pl-md">
          {{ selected.description }}
        </div>
      </div>
      <div
        v-if="selected.type === 'image'"
        :style="`background: url(${selected.src}) no-repeat center center; background-repeat: no-repeat; background-color: #fff; background-size: contain; height: 80%; overflow: hidden; margin-top: 5px;`"
      ></div>
      <div v-if="selected.type === 'pdf'" class="pdf-content q-pl-md q-pr-md">
        <vue-pdf-embed :source="selected.src" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useDialogPluginComponent } from 'quasar';
import VuePdfEmbed from 'vue-pdf-embed';

export default defineComponent({
  name: 'PortfolioPage',
  components: {
    VuePdfEmbed,
  },
  setup() {
    const { dialogRef } = useDialogPluginComponent();
    // type = image, video, pdf
    const data = [
      {
        id: 'c4ca4238a0b923820dcc509a6f75849b',
        name: 'Fotografia',
        projects: [
          {
            type: 'pdf',
            title: 'Storyboard',
            src: '/d1f7a2f4ff895cdb7f04e83e46aafa53d6f176c7.pdf',
            thumb: '/69f278848aee7ecf4fd78d10394e0dc3fd264619.jpg',
            description: 'aaaaaaaaaaaa bbbbbbbbbbbbbb ccccccccccccc',
          },
          {
            type: 'image',
            title: 'Ambiente Dinâmico',
            src: '/7e3a9916ae761931ea09ad8848a29dbdc64c8aab.jpg',
            description: 'gsdfuifuhdgfdjk fdhfjkd ghjh',
          },
          {
            type: 'image',
            title: 'Ambiente Neutro',
            src: '/52840197e4cfac046be022e78902bae0c670a3ed.jpg',
            description:
              'sdghsghfsdhgfsdhgfdsgfhdsghfdsghfdsghfdgshfd dh djkshfjk dshkjgkjdf hjk',
          },
          {
            type: 'image',
            title: 'Ambiente Tranquilo',
            src: '/2bc86eebf0f75c2c13d878cb5e7e21f0e726bf59.jpg',
            description:
              'sdghsghfsdhgfsdhgfdsgfhdsghfdsghfdsghfdgshfd dh djkshfjk dshkjgkjdf hjk',
          },
          {
            type: 'image',
            title: 'Ambiente Sinistro',
            src: '/f53bcc9b44c3f2899f5941abc044bdd8eb658da6.jpg',
            description:
              'sdghsghfsdhgfsdhgfdsgfhdsghfdsghfdsghfdgshfd dh djkshfjk dshkjgkjdf hjk',
          },
        ],
      },
      {
        id: 'c81e728d9d4c2f636f067f89cc14862c',
        name: 'Animação',
        projects: [],
      },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const portfolio = ref<any>({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selected = ref<any>({
      src: '/bg.jpg',
    });

    onBeforeMount(() => {
      const id = useRouter().currentRoute.value.params.id;
      portfolio.value = data.find((item) => item.id === id);
    });

    return {
      dialogRef,
      portfolio,
      selected,

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClickThumb(item: any) {
        selected.value = item;
        if (dialogRef) {
          dialogRef.value?.show();
        }
      },
    };
  },
});
</script>
