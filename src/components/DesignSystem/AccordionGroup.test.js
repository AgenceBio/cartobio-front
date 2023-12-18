import { describe, expect, test } from "vitest"
import { defineComponent } from "vue"
import { mount } from "@vue/test-utils"

import AccordionSection from "./Accordion.vue"
import AccordionGroup from "./AccordionGroup.vue"


describe("AccordionGroup", () => {
  test('we trigger an edit form', async () => {
    const TestComponent = defineComponent({
      components: { AccordionGroup, AccordionSection },
      template: '<AccordionGroup><AccordionSection title="Un"><p>1</p></AccordionSection><AccordionSection title="Deux"><p>2</p></AccordionSection></AccordionGroup>'
    })

    const wrapper = mount(TestComponent)
    const sections = wrapper.findAll('div.fr-collapse')

    // both sections should be closed
    expect(sections.at(0).classes()).not.toContain('fr-collapse--expanded')
    expect(sections.at(1).classes()).not.toContain('fr-collapse--expanded')

    // unfold the first one
    await wrapper.findAll('.fr-accordion__btn').at(0).trigger('click')
    expect(sections.at(0).classes()).toContain('fr-collapse--expanded')
    expect(sections.at(1).classes()).not.toContain('fr-collapse--expanded')

    // unfold the second one
    await wrapper.findAll('.fr-accordion__btn').at(1).trigger('click')
    expect(sections.at(0).classes()).not.toContain('fr-collapse--expanded')
    expect(sections.at(1).classes()).toContain('fr-collapse--expanded')
  })

  test('we trigger an edit form', async () => {
    const wrapper = mount(AccordionSection, {
      props: { open: true, title: 'Un' }
    })

    const section = wrapper.find('.fr-collapse')

    // first section should be open
    expect(section.classes()).toContain('fr-collapse--expanded')
  })
})
