import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';

class Report extends Basic {
  constructor() {
    super('Report');
    this.data = {
      valid: true,
      loading: true,
      years: [],
      months: [],
      year: '',
      month: '',
      report: [],
      regions: [],
      totalPreviousWeight: 0,
      totalWeight: 0,
      monetaryInflation: 0,
      group1: [],
      group2: [],
      group3: [],
      // group4: [],
      products: [],
      valueGroup1: [],
      valueGroup2: [],
      valueGroup3: [],
      // valueGroup4: [],
      valueProducts: [],
      headers: [
        {text: 'Código', value: 'code', align: 'center'},
        {
          text: 'Ponderador anterior',
          value: 'previousWeight',
          align: 'center',
          sortable: false
        },
        {text: 'Inflação', value: 'inflation', align: 'center'},
        {
          text: 'Ponderador atual',
          value: 'weight',
          align: 'center',
          sortable: false
        },
        {text: 'Grupo 1', value: 'group1', align: 'center', sortable: false},
        {text: 'Grupo 2', value: 'group2', align: 'center', sortable: false},
        {text: 'Grupo 3', value: 'group3', align: 'center', sortable: false},
        // {text: 'Grupo 4', value: 'group4', align: 'center', sortable: false},
        {
          text: 'Produto',
          value: 'productName',
          align: 'center',
          sortable: false
        },
      ],
      regionId: '',
    };
    this.inicials = {
      report: new Map(),
      group1: {},
      group2: {},
      group3: {},
      // group4: {},
      products: new Map(),
    };
    this.months = new Map();
    this.methods = {
      'clear': this.clear.bind(this),
      'filterDates': this.filterDates.bind(this),
      'downloadReportXLSX': this.downloadReportXLSX.bind(this),
    };
    this.components = {};
    this.listeners = {
      'reportRead': this.reportRead.bind(this),
      'reportReturnReadRegions': this.reportReturnReadRegions.bind(this),
      'returnedRegionDate': this.returnedRegionDate.bind(this),
    };
    this.watch = {
      valueGroup1: this.valueGroup1Changed.bind(this),
      valueGroup2: this.valueGroup2Changed.bind(this),
      valueGroup3: this.valueGroup3Changed.bind(this),
      // valueGroup4: this.valueGroup4Changed.bind(this),
      valueProducts: this.valueProductsChanged.bind(this),
      year: this.getMonths.bind(this),
    };
    this.wiring();
    this.onReady = [
      this.readRegions.bind(this),
    ];
  }

  clear() {
    this._instance.$refs.form.reset();
  }

  readRegions() {
    this.send_to_server('read_all_regions', null, 'reportReturnReadRegions')
  }

  readReport(id) {
    this.data.regionId = id;
    this.readRegionDate(id);
    this.send_to_server('read_report', {regionId: id}, 'reportRead');
  }

  // Função buscar datas
  readRegionDate(regionId) {
    this.send_to_server('read_report_dates', {regionId: regionId}, 'returnedRegionDate');
  }

  getMonths() {
    // this.data.month = '';
    this.data.months = this.months.get(this.data.year);
  }

  returnedRegionDate(msg) {
    if (msg.source !== this) return;
    if (msg.datas.data.length > 0) {
      for (let i = msg.datas.data.length - 1; i >= 0; i--) {
        for (let key in msg.datas.data[i]) {
          if (msg.datas.data[i].hasOwnProperty(key)) {
            if (!this.months.has(key)) this.months.set(key, []);
            for (let j = msg.datas.data[i][key].months.length - 1; j >= 0; j--) {
              this.months.get(key).push(msg.datas.data[i][key].months[j].month);
            }
          }
        }
      }
      for (let year of  this.months.keys()) {
        this.data.years.push(year);
      }
      this.data.year = this.data.years[0];
      this.data.month = this.months.get(this.data.year)[0];
    }
  }

  // TODO: ARRUMAR O REGIONID -> '[0]'
  filterDates(regionId) {
    console.log(this.data.year, this.data.month, this.data.regions[0].value.id);
    let data = {
      date: {
        year: this.data.year,
        month: this.data.month,
      },
      regionId: this.data.regions[0].value.id
    };
    this.send_to_server('read_report', data, 'reportRead');
  }

  reportReturnReadRegions(msg) {
    if (!msg.datas.success) return console.error('error aqui', msg);
    if (msg.datas.data.length > 0) {
      this.data.regions = msg.datas.data.map(region => {
        return {
          text: region.name,
          value: {
            id: region.id,
          }
        }
      });
    }
    if (this.data.regions.length === 1) {
      this.readReport(this.data.regions[0].value.id);
    }
  }

  valueGroup1Changed() {
    if (this.data.valueGroup1.length) {
      this.getSonsFilter(1, this.data.valueGroup1);
    } else {
      this.getSonsFilter(1, Object.keys(this.inicials.group1));
    }
  }

  valueGroup2Changed() {
    if (this.data.valueGroup2.length) {
      this.getSonsFilter(2, this.data.valueGroup2);
    } else {
      this.getSonsFilter(2, Object.keys(this.inicials.group2));
    }
  }

  valueGroup3Changed() {
    if (this.data.valueGroup3.length) {
      this.getSonsFilter(3, this.data.valueGroup3);
    } else {
      this.getSonsFilter(3, Object.keys(this.inicials.group3));
    }
  }

  // valueGroup4Changed() {
  //   if (this.data.valueGroup4.length) {
  //     this.getSonsFilter(4, this.data.valueGroup4);
  //   } else {
  //     this.getSonsFilter(4, Object.keys(this.inicials.group4));
  //   }
  // }

  valueProductsChanged() {
    let filteredReport = [];
    for (let i = 0; i < this.data.valueProducts.length; i++) {
      filteredReport.push(this.inicials.report.get(this.data.valueProducts[i]));
    }
    this.weightCalculate(filteredReport);
  }


  /**
   * Seleciona os grupos que são filhos dos grupos passados e chama a função que adapta o filtro.
   *
   * @param groupSet
   * @param groupsName
   */
  getSonsFilter(groupSet, groupsName) {
    let sonsNameSet = new Set();
    for (let i = 0; i < groupsName.length; i++) {
      for (let son in this.inicials[`group${groupSet}`][groupsName[i]].groupSon) {
        if (this.inicials[`group${groupSet}`][groupsName[i]].groupSon.hasOwnProperty(son)) {
          sonsNameSet.add(son);
        }
      }
    }
    if (groupSet <= 2) {
      this.adaptFilter(groupSet + 1, sonsNameSet);
    } else {
      this.adaptProductsFilter(sonsNameSet);
    }
  }

  adaptProductsFilter(products) {
    let productsFilter = [];
    for (let item of products) productsFilter.push(item);
    this.data.products = productsFilter;
    this.data.valueProducts = productsFilter;
  }

  adaptFilter(groupSet, groupsNameSet) {
    let groupsName = [];
    for (let item of groupsNameSet) groupsName.push(item);
    this.data[`group${groupSet}`] = groupsName;
    this.getSonsFilter(groupSet, groupsName);
  }

  weightCalculate(dataReport) {
    this.data.monetaryInflation = 0;
    this.data.totalPreviousWeight = 0;
    this.data.totalWeight = 0;
    for (let i = 0; i < dataReport.length; i++) {
      this.data.totalPreviousWeight += dataReport[i].previousWeight;
      this.data.totalWeight += dataReport[i].weight;
      dataReport[i].inflation = (((dataReport[i].weight / dataReport[i].previousWeight) - 1) * 100).toFixed(2);
    }
    this.data.report = dataReport;
    let inflation = this.data.totalWeight / this.data.totalPreviousWeight;
    this.data.monetaryInflation = ((inflation - 1) * 100).toFixed(2);
  }

  setInitials(data) {
    for (let i = 0; i < data.length; i++) {
      let productName = `${data[i].code} ${data[i].productName}`;
      this.inicials.report.set(productName, data[i]);
      this.createGroup(this.inicials.group1, data[i].group1, data[i].group2);
      this.createGroup(this.inicials.group2, data[i].group2, data[i].group3);
      // this.createGroup(this.inicials.group3, data[i].group3, data[i].group4);
      this.createGroup(this.inicials.group3, data[i].group3, productName);
    }
    this.data.group1 = Object.keys(this.inicials.group1);
    this.data.group2 = Object.keys(this.inicials.group2);
    this.data.group3 = Object.keys(this.inicials.group3);
    // this.data.group4 = Object.keys(this.inicials.group4);
    this.data.products = [...this.inicials.report.keys()];
    this.data.valueProducts = this.data.products;
    this.weightCalculate(data);
  }

  createGroup(groupObject, groupName, groupSon) {
    if (!groupObject[groupName]) groupObject[groupName] = {groupSon: {}};
    groupObject[groupName].groupSon[groupSon] = true;
  }

  reportRead(msg) {
    this.setInitials(msg.datas.data);
  }

  downloadReportXLSX() {
    console.log('downloadReportXLSX', this.data.year, this.data.month, this.data.regionId);
    if (this.data.year && this.data.month && this.data.regionId) {
      return this.siom.windowOpen(`/api/open/reportXLSX?regionId=${this.data.regionId}&year=${this.data.year}&month=${this.data.month}`);
    }
  }

}

export default new Report().$vue;