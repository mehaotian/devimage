import DefaultTheme from 'vitepress/theme';
import type { EnhanceAppContext } from 'vitepress';
import HomePage from '../components/HomePage.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('HomePage', HomePage);
  },
};
