import CacheValues from './utils/CacheValues';
import Basic from './utils/BasicComponents';
import Toolbar from './componentes/navigation/Sidenav.vue';

class App extends Basic {
  constructor() {
    super('app');
    this.components = {
      'Toolbar': Toolbar
    };
    this.data = {
      user: CacheValues.getData('user'),
      active_route: '/homeRoot',
      toolbar: false,
      drawer: null,
    };
    this.methods = {
      'go': this.go.bind(this),
      'logout': this.logout.bind(this),
      'open0': this.open.bind(this),
    };
    this.listeners = {
      'logout_ret': this.logout_ret.bind(this),
    };
    this.wiring();
  }

  activate_toolbar() {
    this.data.toolbar = true;
  }

  go(route) {
    this.send_to_browser('change_route', route);
    this.data.active_route = route;
  }

  logout_ret(msg) {
    if (msg.source !== this) return;
    this.send_to_browser('user_logout');
  }

  logout() {
    this.data.toolbar = false;
    this.send_to_server('logout', null, 'logout_ret');
  }

  open(data) {
    this.data.pageName = data;
  }
}

export default new App().$vue;
