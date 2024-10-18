import { describe, expect, it } from "vitest";
import { mount } from '@vue/test-utils';
import NotificationState from './NotificationState.vue'

describe('NotificationState', () => {
  it('renders correctly for "BROUILLON" state', () => {
    const wrapper = mount(NotificationState, {
      props: {
        record: 'BROUILLON',
        text: true
      }
    });

    expect(wrapper.find('.fr-icon--sm').classes()).toContain('fr-icon-article-line');
    expect(wrapper.find('span').text().replace(/\u00A0/g, ' ')).toContain('Notification Brouillon');

    const spanElement = wrapper.find('span');
    expect(spanElement.attributes('style')).toContain('background-color: rgb(211, 211, 211)');
    expect(spanElement.attributes('style')).toContain('color: rgb(128, 128, 128)');

    expect(spanElement.classes()).toContain('rounded');
  });

  it('does not render text when "text" prop is false', () => {
    const wrapper = mount(NotificationState, {
      props: {
        record: 'BROUILLON',
        text: false
      }
    });

    expect(wrapper.find('.mr-1').exists()).toBe(false);
  });

  it('applies styles and classes for "ENGAGEE" state', () => {
    const wrapper = mount(NotificationState, {
      props: {
        record: 'ENGAGEE',
        text: true
      }
    });

    expect(wrapper.find('.fr-icon--sm').classes()).toContain('fr-icon-sucess-line--sm');
    expect(wrapper.find('span').text().replace(/\u00A0/g, ' ')).toContain('Notification Engagée');

    const spanElement = wrapper.find('span');
    expect(spanElement.attributes('style')).toContain('background-color: rgb(158, 249, 190)');
    expect(spanElement.attributes('style')).toContain('color: rgb(41, 114, 84)');
  });
});
