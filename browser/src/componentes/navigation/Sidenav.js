import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';

class Sidenav extends Basic {
  constructor() {
    super('Sidenav');
    this.methods = {};
    this.data = {
      user: CacheValues.getData('user'),
      active_route: '/homeRoot',
      drawer: null,
    };
    this.wiring();
  }
}

export default new Sidenav().$vue;