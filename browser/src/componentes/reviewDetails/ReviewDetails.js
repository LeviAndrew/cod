import SIOM from '../../events/SIOM.js'
import Mensagem from "../../events/Mensagem";
import CacheValues from "../../utils/CacheValues";

export default {
  name: "ReviewDetails",
  props: ['searches', 'regionId'],
  data() {
    return {
      changed: false,
      price: '',
      timeout: {},
      money: {
        decimal: ',',
        thousands: '.',
        prefix: 'R$',
        precision: 2,
        masked: false
      },
    }
  },

  methods: {

    adjustPrice(search) {
      search.price = search.price.toString();
      search.price = search.price.replace(/,/g, '.');
      let index = search.price.lastIndexOf('.');
      if (index >= 0) search.price = search.price.substr(0, index).replace(/\./, '') + search.price.substr(index);
      search.price = Number(search.price);
    },

    saveReview() {
      this.stopTimeOut(this.timeout);
      this.timeout = setTimeout(() => {
        this.adjustPrice(this.searches);
        let msg = new Mensagem('change_research_by_review', {
          searches: [{
            id: this.searches.id,
            price: this.searches.price,
            changed: this.searches.changed,
          }],
          regionId: this.regionId
        }, 'returnSaveReview', this);
        SIOM.send_to_server(msg)
      }, 4000);
    },

    returnSaveReview(msg) {
      // console.log('Pesquisa salva', msg
    },

    stopTimeOut(data) {
      clearTimeout(data);
    },

    getLocation(location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${location}`);
    }

  }
}
