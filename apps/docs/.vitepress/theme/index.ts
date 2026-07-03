import DefaultTheme from 'vitepress/theme';
import HomePage from '../components/HomePage.vue';
import HomeIcon from '../components/HomeIcon.vue';
import AvatarPlayground from '../components/AvatarPlayground.vue';
import PlaceholderPlayground from '../components/PlaceholderPlayground.vue';
import ScenePlayground from '../components/ScenePlayground.vue';
import MockPlayground from '../components/MockPlayground.vue';
import PhotoPlayground from '../components/PhotoPlayground.vue';
import CodePlayground from '../components/CodePlayground.vue';
import SkeletonPlayground from '../components/SkeletonPlayground.vue';
import ApiPlaygroundShell from '../components/ApiPlaygroundShell.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomePage', HomePage);
    app.component('HomeIcon', HomeIcon);
    app.component('AvatarPlayground', AvatarPlayground);
    app.component('PlaceholderPlayground', PlaceholderPlayground);
    app.component('ScenePlayground', ScenePlayground);
    app.component('MockPlayground', MockPlayground);
    app.component('PhotoPlayground', PhotoPlayground);
    app.component('CodePlayground', CodePlayground);
    app.component('SkeletonPlayground', SkeletonPlayground);
    app.component('ApiPlaygroundShell', ApiPlaygroundShell);
  },
};
