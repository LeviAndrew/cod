import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';

class HomeRoot extends Basic {
  constructor() {
    super('HomeRoot');
    this.data = {
      user: CacheValues.getData('user')
    };

    this.methods = {
      'ready': this.ready.bind(this)
    };
    this.components = {};
    this.listeners = {
      'user_ready': this.ready.bind(this)
    };
    this.watch = {};
    this.wiring();
  }

  ready() {
    this.send_to_browser('activate_toolbar', {});
  }

}

export default new HomeRoot().$vue;