import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import firebase from 'firebase'
import { BootstrapVue } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Install BootstrapVue
Vue.use(BootstrapVue)
Vue.config.productionTip = false

let app = null;

// wait for firebase auth to init before creating the app
firebase.auth().onAuthStateChanged(() => {
  // init app if not already created
  app = new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')

})
