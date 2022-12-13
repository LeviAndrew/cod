import SIOM from '../events/SIOM';
import Mensagem from '../events/Mensagem';
class BasicComponents {
  constructor(componentName){
    this._componentName = componentName;
    this._siom = SIOM;
    this._data = {};
    this._methods = {};
    this._validations = {};
    this._computed = {};
    this._components = {};
    this._instance = {};
    this._components_controller = {};
    this._onReady = {};
    this._watch = {};
  }
  get watch() {
    return this._watch;
  }

  set watch(value) {
    this._watch = value;
  }
  get $vue(){
    return this._vue_component;
  }
  set $vue(vue_component){
    this._vue_component = vue_component;
  }
  get $instance(){
    return this._instance;
  }
  setInstance(instance){
    this._instance = instance;
  }
  get siom(){
    return this._siom;
  }
  get data(){
    return this._data;
  }
  set data(data){
    this._data = data;
  }
  get methods(){
    return this._methods;
  }
  set methods(methods){
    this._methods = methods;
  }
  get onReady(){
    return this._onReady;
  }
  set onReady(funcs){
    this._onReady = funcs;
  }
  get validations(){
    return this._validations;
  }
  set validations(validations){
    this._validations = validations;
  }
  get computed(){
    return this._computed;
  }
  set computed(computed){
    this._computed = computed;
  }
  get components(){
    return this._components;
  }
  set components(components){
    this._components = components;
    this.setComponents_controller();
  }
  get components_controller(){
    return this._components_controller;
  }
  setComponents_controller(){
    for(let index in this.components){
      if(this.components.hasOwnProperty(index)){
        this._components_controller[index] = this.components[index].controller;
        delete this.components[index].controller;
      }
    }
  }
  get name(){
    return this._componentName;
  }
  get listeners(){
    return this._listeners;
  }
  set listeners(listeners){
    this._listeners = listeners;
  }
  send_to_server(event, data, return_action){
    let msg = new Mensagem(event, data, return_action, this);
    this.siom.send_to_server(msg);
  }
  send_to_browser(event, data){
    this.siom.send_to_browser(event, data);
  }
  wiring(){
    for(let event in this.listeners){
      if(this.listeners.hasOwnProperty(event)){
        this.siom.on(event, this.listeners[event]);
      }
    }
    this.$vue = this.to_component_vue();
  }
  data_function(){
    return this.data;
  }
  validation_function(){
    return this.validations;
  }
  created(){
    for(let func in this.onReady){
      if(this.onReady.hasOwnProperty(func)){
        this.onReady[func]();
      }
    }
  }
  to_component_vue(){
    let me = this;
    return {
      name: this.name,
      data: this.data_function.bind(this),
      computed:this.computed,
      components: this.components,
      methods: this.methods,
      validations: this.validation_function.bind(this),
      created: function () {
        me.setInstance(this);
        me.created();
      },
      controller: me,
      watch: this.watch
    }
  }
}

export default BasicComponents;