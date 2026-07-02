import DefaultTheme from 'vitepress/theme';
import HomePage from '../components/HomePage.vue';
import HomeIcon from '../components/HomeIcon.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomePage', HomePage);
    app.component('HomeIcon', HomeIcon);
  },
};
