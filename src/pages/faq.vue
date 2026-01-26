<route lang="yaml">
meta:
  generalAudience: true
  seo:
    title: Foire aux questions
</route>

<template>
  <div class="fr-container fr-py-16v">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-md-10">
        <h1>Foire aux questions</h1>

        <section class="fr-py-6v">
          <AccordionGroup class="fr-mb-3w">
            <AccordionSection
              v-for="(item, index) in typedFaqData.questions"
              :key="index"
              :ref="(el) => (accordionRefs[index] = el)"
              :title="item.question"
              @click="scrollToCenter(index)"
            >
              <div v-html="item.answer"></div>
            </AccordionSection>
          </AccordionGroup>
        </section>

        <b
          ><a href="https://docs-cartobio.agencebio.org/cartobio-aide/" target="_blank"
            >Retrouver notre guide utilisateur complet</a
          ></b
        >
        <p class="fr-mt-2w">
          Si vous n’avez trouvé la réponse à votre question, vous pouvez nous contacter à cette adresse :
          <a href="mailto:support-cartobio@agencebio.org">support-cartobio@agencebio.org</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import AccordionGroup from "@/components/widgets/AccordionGroup.vue";
import AccordionSection from "@/components/widgets/Accordion.vue";
import faqData from "@/data/faq.json";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqData {
  questions: FaqItem[];
}

const typedFaqData = faqData as FaqData;
const accordionRefs = ref([]);

const scrollToCenter = async (index: number) => {
  await nextTick();

  const element = accordionRefs.value[index];
  if (element && element.$el) {
    const elementTop = element.$el.getBoundingClientRect().top + window.scrollY;
    const elementHeight = element.$el.offsetHeight;
    const windowHeight = window.innerHeight;

    const scrollTo = elementTop - windowHeight / 2 + elementHeight / 2;

    window.scrollTo({
      top: scrollTo,
      behavior: "smooth",
    });
  }
};
</script>
