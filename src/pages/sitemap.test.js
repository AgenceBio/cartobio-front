import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"
import routes from '~pages'

import Page from './sitemap.vue'

describe("/sitemap", () => {
  const ALIAS_PAGES = ['/logout']

  it("should contain only valid internal links", async () => {
    const wrapper = mount(Page)

    const links = wrapper.findAll('a:not([target="_blank"])').map(el => el.attributes('href'))

    const result = links
      .filter(link => ALIAS_PAGES.includes(link) === false)
      .every(link => routes.find(({ path }) => path === link))

    expect(result).toEqual(true)
  })
})
