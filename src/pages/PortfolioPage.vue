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
      <q-video
        v-if="selected.type === 'video'"
        :ratio="16 / 9"
        :src="selected.src"
      />
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
            description:
              'Este exercício é um storyboard com o objetivo de explorar enquadramentos e tipos de planos para suportar a estrutura narrativa.',
          },
          {
            type: 'image',
            title: 'Ambiente Dinâmico',
            src: '/7e3a9916ae761931ea09ad8848a29dbdc64c8aab.jpg',
            description:
              'Este é um exercício com o objetivo de utilizar luz e cores para transmitir a sensação de que o ambiente é dinâmico utilizando de um enquadramento inclinado e foco na personagem do segundo plano.',
          },
          {
            type: 'image',
            title: 'Ambiente Neutro',
            src: '/52840197e4cfac046be022e78902bae0c670a3ed.jpg',
            description:
              'Este é um exercício com o objetivo de utilizar luz e cores para transmitir a sensação de que o ambiente é neutro utilizando um fundo branco para refletir mais luz e o posicionamento das personagens.',
          },
          {
            type: 'image',
            title: 'Ambiente Tranquilo',
            src: '/2bc86eebf0f75c2c13d878cb5e7e21f0e726bf59.jpg',
            description:
              'Este é um exercício com o objetivo de utilizar luz e cores para transmitir a sensação de que o ambiente é tranquilo utilizando uma luz de cor violeta e outra azul, mais suave em conjunto com um fundo branco.',
          },
          {
            type: 'image',
            title: 'Ambiente Sinistro',
            src: '/f53bcc9b44c3f2899f5941abc044bdd8eb658da6.jpg',
            description:
              'Este é um exercício com o objetivo de utilizar luz e cores para transmitir a sensação de que o ambiente é sinistro utilizando uma luz vermelha mais agressiva, uma luz secundária violeta e o foco na personagem em primeiro plano.',
          },
          {
            type: 'video',
            title: 'Enquadramento',
            src: 'https://www.youtube.com/embed/7z615xAKMTY',
            thumb: '/8e313dfbcde1c9eb99b3b1f3cd20fcb1cac011ae.jpg',
            description:
              'Este é um exercício com o objetivo utilizar o enquadramento e o movimento para atrair o foco do espectador para a personagem em primeiro plano a direita.',
          },
          {
            type: 'video',
            title: 'Luz',
            src: 'https://www.youtube.com/embed/ECYD_8EMmnY',
            thumb: '/60aa59009f1dd66a0101802c4039b05067c54916.jpg',
            description:
              'Este é um exercício com o objetivo utilizar o movimento da luz para atrair o foco do espectador para a personagem central.',
          },
          {
            type: 'video',
            title: 'Cor',
            src: 'https://www.youtube.com/embed/22LmKyppBlw',
            thumb: '/e47670624bc7f1b44354f61e0f7dbabb4ad43398.jpg',
            description:
              'Este é um exercício com o objetivo utilizar diferentes cores e o movimento para atrair o foco do espectador para a personagem de cor verde.',
          },
          {
            type: 'video',
            title: 'Movimento',
            src: 'https://www.youtube.com/embed/3YGUB-g1Ec0',
            thumb: '/afa28bd6cf4688d6002ceec1c856d57f450ab362.jpg',
            description:
              'Este é um exercício com o objetivo utilizar o movimento para atrair o foco do espectador de maneira que apenas uma das personagens possua o movimento completamente diferente das outras.',
          },
          {
            type: 'video',
            title: 'Personagem',
            src: 'https://www.youtube.com/embed/3Mn6exLwp2w',
            thumb: '/2b9ff67f58bd0808c4e9e6f9bfe835c20538ee3a.jpg',
            description:
              'Este é um exercício com o objetivo de atrair o foco do espectador utilizando três personagens similares e uma diferente.',
          },
          {
            type: 'pdf',
            title: 'Storyboard Individual',
            src: '/9535b2bf593d89db1b4ea5294e96282407850e18.pdf',
            thumb: '/6f88020ac77f65254930ff38a850dd7c1fe7ab7d.jpg',
            description:
              'Este é um exercício com o objetivo de expandir um guião apresentado em aula e desenvolver o seu storyboard com tempos, movimentos de câmera, planos e enquadramentos diferentes.',
          },
          {
            type: 'pdf',
            title: 'Storyboard Fotografia Grupo',
            src: '/9535b2bf593d89db1b4ea5294e96282407850e18.pdf',
            thumb: '/b6610d8d7a2bd75602eae622349d3eac06e00163.jpg',
            description:
              'Este é um exercício com o objetivo de desenvolver um storyboard de fotografias em grupo baseado no trabalho "Storyboard Individual", em conjunto com Francisco Xia (A22204578), Maria Rendas () e Sofia ().',
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
