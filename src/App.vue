
<template>
<!-- @change-link-target="log1"
  @node-added="log2"
  @link-added="log3"
  @select-cell="log4"
  @select-link="log5"
  @node-delete="log6"
  @link-delete="log7"
  @arr-node-delete="log8" -->
  <DataFlow
  
  ></DataFlow>
  <!-- <div id="app">
    <div class="btn_contain">
        <button id="btn-zoomout" class="btn">zoom out</button>
        <button id="btn-zoomin" class="btn">zoom in</button>
        <button id="btn-center" class="btn">center</button>
        <button id="btn-center-content" class="btn">center content</button>
    </div>
    <div ref="nodeStencile" id="stencil"></div>
    
    <div id="paper"></div>
    <div id="navigator"></div>
    
    
        </div>
   -->
</template>

<script>

// import '@/../public/vendor/jointJS/js/lib/backbone.js'
// import '@/../public/vendor/jointJS/js/lib/jquery.min.js'
// import '@/../public/vendor/jointJS/js/lib/lodash.min.js'
// import '@/../public/vendor/jointJS/js/lib/rappid.js'
// import '@/../public/vendor/jointJS/js/lib/backbone.min.js'


import DataFlow from './components/dataflowWithoutSelectedEl.vue'
// import DataFlow from './components/dataflow.vue'
// import { Options, Vue } from 'vue-class-component';
export default {
    components: {
    DataFlow
  },
  methods:{
    
    log1(evt){
      console.log('change-link-target')
      console.log(evt)
    },
    log2(evt){
      console.log('node-added')
      console.log(evt)
    },
    log3(evt){
      console.log('link-added')
      console.log(evt)
    },
    log4(evt){
      console.log('select-cell')
      console.log(evt)
    },
    log5(evt){
      console.log('select-link')
      console.log(evt)
    },
    log6(evt){
      console.log('node-delete')
      console.log(evt)
    },
    log7(evt){
      console.log('link-delete')
      console.log(evt)
    },
    log8(evt){
      console.log('arr-node-delete')
      console.log(evt)
    },
    log(evt){
      console.log(evt)
    },
  }

  }

  

</script>

<style >
/* @import "@/../public/vendor/jointJS/build/package/rappid.css"; */
@import "@/css/data_flow.css";
@import "@/css/lib/rappid.min.css";
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
}
.elements.joint-paper.joint-theme-default{
    width:100% !important;
}
.snapline.horizontal {
    border-bottom: 1px solid #2ecc71 !important;
    
}
.snapline.vertical {
    border-right: 1px solid #2ecc71 !important;
    
}
.joint-halo.joint-theme-default .handle.remove{
  background-image: url(./assets/close.png)!important;
  
}
.joint-halo.joint-theme-default .handle.clone{
  background-image: url(./assets/clone.png)!important;
  
}
.joint-halo.joint-theme-default .handle.link{
  background-image: url(./assets/right-arrow.png)!important;
  
}
.joint-halo.joint-theme-default .handle.fork{
  background-image: url(./assets/fork.png)!important;
  
}
.joint-halo.joint-theme-default .handle.unlink{
  background-image: url(./assets/unlink.png)!important;
  
}
</style>
