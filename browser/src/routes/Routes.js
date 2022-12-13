import VueRouter from 'vue-router';
import Login from '../views/login/Login.vue';
import Home from '../views/home/Home.vue';
import HomeRoot from '../views/homeRoot/HomeRoot.vue';
import ResearcherManager from '../views/researcherManager/ResearcherManager.vue';
import ResearchTable from '../views/researchTable/ResearchTable.vue';
import ReviewTable from "../views/reviewTable/ReviewTable.vue";
import RegionManager from '../views/regionManager/RegionManager.vue';
import SourceManager from '../views/sourceManager/SourceManager.vue';
import ProductBasket from '../views/productBasket/ProductBasket.vue';
import Report from '../views/report/Report.vue';
import Visitor from '../views/visitor/Visitor.vue';
import CacheValues from '../utils/CacheValues';

const configs = require('../configs/RouterConfig.json');

const initial_routes = [
  {path: '/', component: Login}
];
const logged_routes = [
  {path: '/researchTable', name: 'Pesquisas', component: ResearchTable, user_type: 'admin'},
  {path: '/researchTable', name: 'Pesquisas', component: ResearchTable, user_type: 'researcher'},
  {path: '/reviewTable', name: 'Tabela de crítica', component: ReviewTable, user_type: 'admin'},
  {path: '/report', name: 'Relatório', component: Report, user_type: 'admin'},
  {path: '/productBasket', name: 'Cesta de Produtos', component: ProductBasket, user_type: 'admin'},
  {path: '/researcherManager', name: 'Pesquisadores', component: ResearcherManager, user_type: 'admin'},
  {path: '/sourceManager', name: 'Fontes', component: SourceManager, user_type: 'admin'},
  {path: '/regionManager', name: 'Regiões', component: RegionManager, user_type: 'admin'},
  {path: '/home', name: 'Perfil', component: Home, user_type: 'admin'},
  {path: '/home', name: 'Perfil', component: Home, user_type: 'researcher'},
  {path: 'visitor', component: Visitor, user_type: null},
  {path: 'homeRoot', component: HomeRoot, user_type: 'admin'}
];
import SIOM from '../events/SIOM';

class Routes {
  constructor(configs) {
    configs.routes = Routes.add_init_routes(configs.routes);
    this._vueRouter = new VueRouter(configs);
    this._listeners = {
      'change_route': this.change_route.bind(this),
      'user_logged': this.user_logged.bind(this),
      'user_logout': this.user_logout.bind(this),
    };
    this.wiring();
  }

  get listeners() {
    return this._listeners;
  }

  static add_init_routes(routes) {
    return routes.concat(initial_routes);
  }

  get router() {
    return this._vueRouter;
  }

  add_routes(routes) {
    this.router.addRoutes(routes);
    this.change_route_no_historic(routes[0].path);
  }

  change_route_no_historic(route) {
    this.router.replace({path: route});
  }

  user_logged(user) {
    CacheValues.updateData('user', user);
    this.add_routes(Routes.get_routes_by_type(user.type));
    SIOM.send_to_browser('user_ready');
  }

  static get_routes_by_type(type) {
    let ret = [];
    for (let i = 0; i < logged_routes.length; i++) {
      if (logged_routes[i].user_type === type) {
        ret.push(logged_routes[i]);
      }
    }
    return ret;
  }

  change_route(route) {
    for (let index in logged_routes) {
      if (logged_routes.hasOwnProperty(index) && logged_routes[index].path === route) {
        logged_routes[index].component.methods.ready();
      }
    }
    this.router.push({path: route});
  }

  user_logout() {
    console.log('TEY');
    CacheValues.updateData('user', {
      email: false,
      type: false
    });
    this.router.replace({path: '/'});
  }

  wiring() {
    for (let event in this.listeners) {
      if (this.listeners.hasOwnProperty(event)) {
        SIOM.on(event, this.listeners[event]);
      }
    }
  }
}

export default new Routes(configs);