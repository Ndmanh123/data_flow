/* eslint-disable */ 
import { createApp } from 'vue'
import App from './App.vue'
// import '@/../public/vendor/jointJS/js/lib/backbone.js'
// import '@/../public/vendor/jointJS/js/lib/jquery.js'
// import '@/../public/vendor/jointJS/js/lib/lodash.js'
// import '@/../public/vendor/jointJS/js/lib/backbone.min.js'
import 'jointjs/dist/joint.core.css';
window.$ = require('jquery');
// window.V = require('C:/Users/Admin/dataflow-test/node_modules/jointjs/dist/joint');
require('./../public/vendor/jointJS/js/lib/jointjs.js');
// window.ui= require('C:/Users/Admin/dataflow-test/public/vendor/jointJS/js/lib/rappid.js')
createApp(App).mount('#app')
