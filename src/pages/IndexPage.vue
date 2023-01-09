<template>
  <q-page>
    <div class="row section-header">
      <div class="col-4 panel-left"></div>
      <div class="col-4"></div>
      <div class="col-2"></div>
      <div class="personal">
        <div class="firstname">{{ firstname }}</div>
        <div class="surname">
          {{ surname }}
          <div class="code">{{ registration }}</div>
        </div>

        <div class="short-summary">
          {{ shortSummary }}
        </div>
      </div>
    </div>

    <div class="row section-about" id="about">
      <div class="col-2"></div>
      <div class="col-8">
        <div class="row">
          <div class="col-5">
            <q-img
              src="https://marketifythemes.net/wp/waxon/1/wp-content/uploads/2021/11/2-2.jpg"
              :ratio="1"
              class="thumbnail"
            />
          </div>
          <div class="col-7 q-pl-xl">
            <h2 class="text-uppercase text-bold">
              <small>{{ firstname }} {{ surname }}</small>
              About
            </h2>
            <div class="short-summary">
              {{ shortSummary }}
            </div>

            <q-separator />

            <p class="text-weight-light">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
              convallis odio dapibus massa ornare, sed ullamcorper nisl euismod.
              Ut vitae laoreet lorem, at pulvinar ligula. Etiam diam orci,
              rhoncus nec finibus a, tempor non orci. Phasellus vehicula nunc
              ipsum, non dapibus nulla egestas non. Nam maximus nunc nunc,
              laoreet hendrerit nisi tincidunt eget. Phasellus pharetra auctor
              eros, id gravida turpis auctor sit amet.
            </p>
          </div>
        </div>
      </div>
      <div class="col-2"></div>
    </div>

    <div class="row section-portfolio" id="portfolio">
      <div class="col-2"></div>
      <div class="col-8">
        <h2 class="text-uppercase text-bold">
          <small>Featured Works</small>
          Portfolio
        </h2>

        <div class="row">
          <div class="col-4">
            <q-card color flat square class="bg-teal-2 q-ml-md q-mr-md">
              <q-card-section class="title">Photograph</q-card-section>
              <div class="content-icon">
                <q-icon name="fa-solid fa-camera" />
              </div>
              <q-card-actions align="right">
                <q-btn
                  flat
                  no-caps
                  label="More"
                  href="/#/portfolio/c4ca4238a0b923820dcc509a6f75849b"
                />
              </q-card-actions>
            </q-card>
          </div>

          <div class="col-4">
            <q-card color flat square class="bg-pink-2 q-ml-md q-mr-md">
              <q-card-section class="title">Photograph</q-card-section>
              <div class="content-icon">
                <q-icon name="fa-solid fa-camera" />
              </div>
              <q-card-actions align="right">
                <q-btn
                  flat
                  no-caps
                  label="More"
                  href="/#/portfolio/c81e728d9d4c2f636f067f89cc14862c"
                />
              </q-card-actions>
            </q-card>
          </div>

          <div class="col-4">
            <q-card color flat square class="bg-light-blue-7 q-ml-md q-mr-md">
              <q-card-section class="title">Photograph</q-card-section>
              <div class="content-icon">
                <q-icon name="fa-solid fa-camera" />
              </div>
              <q-card-actions align="right">
                <q-btn
                  flat
                  no-caps
                  label="More"
                  href="/#/portfolio/eccbc87e4b5ce2fe28308fd9f2a7baf3"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <div class="row q-mt-xl">
          <div class="col-4">
            <q-card color flat square class="bg-red-3 q-ml-md q-mr-md">
              <q-card-section class="title">Photograph</q-card-section>
              <div class="content-icon">
                <q-icon name="fa-solid fa-camera" />
              </div>
              <q-card-actions align="right">
                <q-btn
                  flat
                  no-caps
                  label="More"
                  href="/#/portfolio/a87ff679a2f3e71d9181a67b7542122c"
                />
              </q-card-actions>
            </q-card>
          </div>

          <div class="col-4">
            <q-card color flat square class="bg-light-blue-3 q-ml-md q-mr-md">
              <q-card-section class="title">Photograph</q-card-section>
              <div class="content-icon">
                <q-icon name="fa-solid fa-camera" />
              </div>
              <q-card-actions align="right">
                <q-btn
                  flat
                  no-caps
                  label="More"
                  href="/#/portfolio/e4da3b7fbbce2345d7772b0674a318d5"
                />
              </q-card-actions>
            </q-card>
          </div>

          <div class="col-4">
            <q-card color flat square class="bg-amber-3 q-ml-md q-mr-md">
              <q-card-section class="title">Photograph</q-card-section>
              <div class="content-icon">
                <q-icon name="fa-solid fa-camera" />
              </div>
              <q-card-actions align="right">
                <q-btn
                  flat
                  no-caps
                  label="More"
                  href="/#/portfolio/1679091c5a880faf6fb5e6087eb1b2dc"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
      <div class="col-2"></div>
    </div>

    <div class="row section-contact" id="contact">
      <div class="col-2"></div>
      <div class="col-8">
        <h2 class="text-uppercase text-bold">
          <small>GET IN TOUCH</small>
          Contact
        </h2>

        <div class="row">
          <div class="col-6">
            <p class="text-weight-light">
              Hi, if you are interested you can contact me by email
            </p>
            <p class="text-weight-light">
              <a :href="`mailto:${email}`" :title="email">{{ email }}</a>
            </p>
          </div>
          <div class="col-6">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d99580.03468293071!2d-9.23024330429283!3d38.743605703647816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd19331a61e4f33b%3A0x400ebbde49036d0!2sLisbon!5e0!3m2!1sen!2spt!4v1673289792062!5m2!1sen!2spt"
              width="100%"
              height="300"
              style="border: 0"
              allowfullscreen="true"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
      <div class="col-2"></div>
    </div>

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
            <a href="#" title="facebook"
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'IndexPage',
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
