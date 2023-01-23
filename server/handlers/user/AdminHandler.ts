import {CommonHandler} from "./CommonHandler";
import {QueryObject} from '../util/QueryObject';
import {UpdateObject} from '../util/UpdateObject';
import {Types} from 'mongoose'
import {Util} from "../../util/Util";

const xlsx2json = require('xlsx2json');

const buscaCEP = require('busca-cep');

export class AdminHandler extends CommonHandler {

  /**
   * Envia para o banco dados para criacao de uma região.
   *
   * @param data
   * @returns {Promise<{success: boolean; data: any & [any , any , any , any , any , any , any , any , any , any]} | {success: boolean; data}>}
   */
  async regionCreate(data) {
    // let test = await this.isAdmin(data.auth); // Validar se usuário é Admin // Levi
    // if (test.data.success[0].type === "admin") { // Validar se usuário é Admin // Levi
    //   return await this.returnHandler({
    //     model: 'address',
    //     data: {error: "Usuário não é admin"}
    //   })
    // }
    let ret = await this.emit_to_server('db.region.create', data.data);
    return await this.returnHandler({
      model: 'region',
      data: ret.data,
    });
  }

  public async readReviewDate(data) {
    let ret = await this.emit_to_server('db.review.read', new QueryObject(
      {
        region: data.data.regionId
      },
      "year month",
      null, 2, null,
      {
        year: -1,
        month: -1,
      }
    ));
    return await this.returnHandler({
      model: 'review',
      data: ret.data,
    });
  }

  /**
   * Cria fonte e coloca na região.
   *
   * @param data
   * @returns {Promise<any>}
   */
  async sourceCreate(data) {
    let address = await this.getAddressIdFromDB({
      stateInitial: data.data.source.address.state,
      cityName: data.data.source.address.city,
      neighborhoodName: data.data.source.address.neighborhood,
    });
    if (!address.state.success || !address.city.success || !address.neighborhood.success) {
      let invalidsAddress = [];
      for (let attr in address) {
        if (address.hasOwnProperty(attr)) {
          if (!address[attr].success) invalidsAddress.push(address[attr].data);
        }
      }
      return {
        success: false,
        data: invalidsAddress
      };
    }
    data.data.source.address.state = address.state.data[0].id;
    data.data.source.address.city = address.city.data[0].id;
    data.data.source.address.neighborhood = address.neighborhood.data[0].id;
    let retSource = await this.emit_to_server('db.source.create', data.data.source);
    if (retSource.data.error) return this.returnHandler({
      model: 'source',
      data: retSource.data,
    });
    let retRegion = await this.emit_to_server('db.region.update', new UpdateObject(
      data.data.regionId,
      {
        $push: {
          sources: retSource.data.success[0].id,
        }
      }
    ));
    if (retRegion.data.error) return console.error('não salvou a fonte dentro da região', retRegion.data.error);
    return await this.returnHandler({
      model: 'source',
      data: retSource.data,
    });
  }

  /**
   * Atualiza o endereço na fonte.
   * Se esse endereço já estiver cadastrado no banco de dados, ele apenas associa a fonte.
   * Se o endereço for novo, ele cria no banco e associa a fonte.
   *
   * @param sourceId
   * @param newAddress
   * @returns {Promise<any>}
   */
  private async updateSourceAddress(sourceId, newAddress) {
    let sourceAddress = await this.emit_to_server('db.source.read', new QueryObject(
      sourceId,
      'address',
      {
        path: 'address.city address.state address.neighborhood',
        select: 'id name initial'
      }
    ));
    sourceAddress = sourceAddress.data.success.address;
    let promises = [null, null, null];
    for (let attr in sourceAddress) {
      if (sourceAddress.hasOwnProperty(attr)) {
        if (attr === 'neighborhood' && newAddress[attr]) {
          promises[0] = this.getNeighborhoodIdByName(newAddress[attr]);
        } else if (attr === 'city' && newAddress[attr]) {
          promises[1] = this.getCityIdByName(newAddress[attr]);
        } else if (attr === 'state' && newAddress[attr]) {
          promises[2] = this.getStateIdByInitial(newAddress[attr]);
        } else if (attr !== 'neighborhood' && attr !== 'city' && attr !== 'state') {
          sourceAddress[attr] = newAddress[attr];
        }
      }
    }
    let ret = [];
    if (!!promises[0] || !!promises[1] || !!promises[2]) {
      ret = await Promise.all(promises);
      for (let i = 0; i < ret.length; i++) {
        if (ret[i] && !ret[i].success) return ret[i];
      }
    }
    sourceAddress.neighborhood = ret[0] && ret[0].success ? ret[0].data[0].id : sourceAddress.neighborhood.id;
    sourceAddress.city = ret[1] && ret[1].success ? ret[1].data[0].id : sourceAddress.city.id;
    sourceAddress.state = ret[2] && ret[2].success ? ret[2].data[0].id : sourceAddress.state.id;
    return {
      success: true,
      data: sourceAddress,
    };
  }

  /**
   * Não é possivel atualizar fonte a partir dessa funcionalidade
   * Atualiza dados da fonte.
   * Verifica se os dados estão vindo corretamente.
   * Retorna erro caso algo esteja errado.
   *
   * @param data
   * @returns {Promise<any>}
   */
  async sourceUpdate(data) {
    delete data.data.update.products;
    let updateValidate = await this.updateValidator(data.data);
    if (!updateValidate.success) return updateValidate;
    if (data.data.update.address) {
      let newAddress = await this.updateSourceAddress(data.data.id, data.data.update.address);
      if (!newAddress.success) return newAddress;
      data.data.update.address = newAddress.data;
    }
    let ret = await this.emit_to_server('db.source.update', new UpdateObject(
      data.data.id,
      data.data.update,
      {
        new: true,
        runValidators: true,
        fields: {
          id: 1,
        }
      }
    ));
    if (ret.data.error) return this.returnHandler({
      model: 'source',
      data: ret.data,
    });
    return await this.sourceReadById([data.data.id]);
  }

  /**
   * Retorna inforamções sobre a fonte relacionado ao id passado por parametro.
   *
   * @param sourceId
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | [any]} | {success: boolean; data: any[] | any | boolean}>}
   */
  private async sourceReadById(sourceId) {
    let ret = await this.emit_to_server('db.source.read', new QueryObject(
      {
        _id: {
          $in: sourceId,
        },
        removed: false,
      },
      'name code address researchers products',
      {
        path: 'researchers products address.city address.state address.neighborhood',
        select: 'id name initial email surname'
      }
    ));
    return this.returnHandler({
      model: 'source',
      data: ret.data,
    });
  }

  /**
   * Retorna todas as fontes da região que estão cadastradas e não removidas.
   *
   * @param data
   * @returns {Promise<null>}
   */
  public async sourceReadRegion(data) {
    let region = await this.emit_to_server('db.region.read', new QueryObject(
      data.data.regionId,
      "sources",
      {
        path: "sources",
        select: "name id removed"
      }
    ));
    let sources = [];
    for (let i = 0; i < region.data.success.sources.length; i++) {
      if (!region.data.success.sources[i].removed) {
        sources.push(region.data.success.sources[i]);
      }
      delete region.data.success.sources[i].removed;
    }
    return await this.returnHandler({
      model: "source",
      data: {
        success: sources,
      }
    });
  }

  /**
   * Retorna inforamções sobre a fonte relacionado ao id passado por parametro.
   *
   * @param data
   * @returns {Promise<null>}
   */
  public async sourceReadId(data) {
    let source = await this.emit_to_server('db.source.read', new QueryObject(
      {
        _id: data.data.sourceId,
        removed: false,
      },
      "name code address",
      {
        path: "address.city address.neighborhood address.state",
        select: "id name initial"
      }
    ));
    return this.returnHandler({
      model: "source",
      data: source.data,
    });
  }

  /**
   * Marca a fonte como removida, ou seja, ela deixa de ser visivel e passa a ser um dado historico.
   *
   * @param data
   * @returns {Promise<any>}
   */
  async sourceRemove(data) {
    data.data.update = {
      removed: true,
    };
    let removed = await this.sourceUpdate({data: data.data});
    if (!removed.success) return removed;
    let regions = await this.emit_to_server('db.region.update', new UpdateObject(
      {
        sources: data.data.id,
      },
      {
        $pull: {
          sources: data.data.id,
        }
      }
    ));
    if (regions.data.error) return this.returnHandler({
      model: 'region',
      data: regions.data,
    });
    return removed;
  }

  /**
   * Lê todos os produtos cadastrados na fonte.
   *
   * @param data
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | any[]} | {success: boolean; data: any | any[] | boolean}>}
   */
  public async sourceReadProducts(data) {
    if (!data.data.sourceId) return await this.returnHandler({
      model: 'source',
      data: {error: "hasNoSourceId"},
    });
    let ret = await this.emit_to_server('db.source.read', new QueryObject(
      data.data.sourceId,
      'products',
      {
        path: 'products',
        select: 'code id name',
      }
    ));
    return await this.returnHandler({
      model: 'source',
      data: ret.data,
    });
  }

  /**
   * Retorna os produtos que não existem na fonte passada por parametro.
   *
   * @param data
   * @returns {Promise<any>}
   */
  private async unconnectedProduct(data) {
    let source = await this.emit_to_server('db.source.read', new QueryObject(
      data.sourceId,
      'products',
      {
        path: 'products',
        select: 'id',
      }
    ));
    if (!source.data.success.products.length) return data.productsId;
    let objectsIds = {};
    for (let i = 0; i < data.productsId.length; i++) {
      objectsIds[data.productsId[i]] = true;
    }
    for (let i = 0; i < source.data.success.products.length; i++) {
      if (objectsIds[source.data.success.products[i].id]) delete objectsIds[source.data.success.products[i].id];
    }
    return Object.keys(objectsIds);
  }

  /**
   * Recebe um array de ids de produtos e associa a fonte.
   * Se algum dos produtos já exitir na fonte, ele é eliminado do array de atualização.
   * Se faltar algum dado, ele retorna um erro.
   *
   * @param data
   * @returns {Promise<null>}
   */
  async connectProductsSource(data) {
    if (!data.data.data.sourceId) return await this.returnHandler({
      model: 'source',
      data: {error: 'connectProduct.sourceIdRequired'}
    });
    if (!Array.isArray(data.data.data.productsId) || !data.data.data.productsId.length) return await this.returnHandler({
      model: 'source',
      data: {error: 'connectProduct.productsIdRequired'}
    });
    let produtctsToConnect = await this.unconnectedProduct(data.data.data);
    let ret = await this.emit_to_server('db.source.update', new UpdateObject(
      data.data.data.sourceId,
      {
        $push: {
          products: {
            $each: produtctsToConnect,
          }
        }
      },
      {
        new: true,
        runValidators: true,
        fields: {
          id: 1,
        }
      }
    ));
    if (ret.data.error) return await this.returnHandler({
      model: 'source',
      data: ret.data,
    });
    let source = await this.emit_to_server('db.source.read', new QueryObject(
      data.data.data.sourceId,
      'name products',
      {
        path: 'products',
        select: 'name code',
      }
    ));
    return await this.returnHandler({
      model: 'source',
      data: source.data,
    });
  }

  /**
   * Pega o estado do banco de dados pela sigla, caso esse estado ainda não
   * tenha um cadastro, será criado.
   *
   * @param stateInitial
   * @returns {Promise<any>}
   */
  private async getStateIdByInitial(stateInitial: string) {
    if (!stateInitial) return this.returnHandler({
      model: 'address',
      data: {error: 'initialRequired'},
    });
    let ret = await this.emit_to_server('db.state.read', new QueryObject(
      {
        initial: stateInitial
      }
    ));
    ret = await this.returnHandler({model: 'state', data: ret.data});
    if (ret.success && ret.data.length < 1) {
      ret = await this.emit_to_server('db.state.create', {
        initial: stateInitial,
      });
      ret = await this.returnHandler({model: 'state', data: ret.data});
    }
    return ret;
  }

  /**
   * Pega a cidade pelo nome, caso esta não exista, ele cadastra.
   *
   * @param {string} cityName
   * @returns {Promise<any>}
   */
  private async getCityIdByName(cityName: string) {
    if (!cityName) return this.returnHandler({
      model: 'address',
      data: {error: 'cityNameRequired'},
    });
    let ret = await this.emit_to_server('db.city.read', new QueryObject(
      {
        name: cityName,
      }
    ));
    ret = await this.returnHandler({model: 'city', data: ret.data});
    if (ret.success && ret.data.length < 1) {
      ret = await this.emit_to_server('db.city.create', {
        name: cityName
      });
      ret = await this.returnHandler({model: 'city', data: ret.data});
    }
    return ret;
  }

  /**
   * Recebe um nome de bairro.
   * Caso esse bairro já esteja cadastrado, ele retorno o id.
   * Se o bairro não existir no banco de dados, ele cadastra e em seguida retorna o id.
   *
   * @param {string} neighborhoodName
   * @returns {Promise<any>}
   */
  private async getNeighborhoodIdByName(neighborhoodName: string) {
    if (!neighborhoodName) return this.returnHandler({
      model: 'address',
      data: {error: 'neighborhoodNameRequired'},
    });
    let ret = await this.emit_to_server('db.neighborhood.read', new QueryObject(
      {
        name: neighborhoodName,
      }
    ));
    ret = await this.returnHandler({model: 'neighborhood', data: ret.data});
    if (ret.success && ret.data.length < 1) {
      ret = await this.emit_to_server('db.neighborhood.create', {
        name: neighborhoodName,
      });
      ret = await this.returnHandler({model: 'neighborhood', data: ret.data});
    }
    return ret;
  }

  /**
   * Retorna todos os ids necessarios relacionados ao endereço de uma fonte.
   *
   * @returns {Promise<{stateId: string; cityId: string; neighborhoodId: string}>}
   * @param address
   */
  private async getAddressIdFromDB(address: { stateInitial: string, cityName: string, neighborhoodName: string }) {
    let ret = await Promise.all([
      this.getStateIdByInitial(address.stateInitial),
      this.getCityIdByName(address.cityName),
      this.getNeighborhoodIdByName(address.neighborhoodName),
    ]);
    return {
      state: ret[0],
      city: ret[1],
      neighborhood: ret[2],
    };
  }

  /**
   * Busca no buscaCEP dados de um endereço completo pelo cep.
   *
   * @param data
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | [any]} | {success: boolean; data: any}>}
   */
  async addressByZipCode(data) {
    try {
      // let test = await this.isAdmin(data.auth); // Validar se usuário é Admin // Levi
      // if (test.data.success[0].type === "admin") { // Validar se usuário é Admin // Levi
      //   return await this.returnHandler({
      //     model: 'address',
      //     data: {error: "Usuário não é admin"}
      //   })
      // }
      let addressBuscaCEP = await buscaCEP(data.zipCode);
      return await this.returnHandler({
        model: 'address',
        data: {
          success: addressBuscaCEP,
        }
      });
    } catch (error) {
      return await this.returnHandler({
        model: 'address',
        data: {
          error: error,
        }
      });
    }
  }

  /**
   * Retorna todas as regiões cadastradas e não removidas do banco de dados.
   *
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | [any]} | {success: boolean; data: any}>}
   */
  async readAllRegions() {
    let ret = await this.emit_to_server('db.region.read', new QueryObject(
      {
        removed: false,
      },
      'name sources'
    ));
    return this.returnHandler({
      model: 'region',
      data: ret.data,
    });
  }

  /**
   * Atualiza a região passada por parametro.
   * Verifica se os dados estão certo.
   * Se sim envia ao banco.
   * Se algo estiver errado, retorna o erro correspondente.
   *
   * @param data
   * @returns {Promise<any>}
   */
  async regionUpdate(data) {
    let updateValidate = await this.updateValidator(data.data);
    if (!updateValidate.success) return updateValidate;
    let ret = await this.emit_to_server('db.region.update', new UpdateObject(
      data.data.id,
      data.data.update,
      {
        new: true,
        runValidators: true,
        fields: {
          id: 1,
          name: 1,
        }
      }
    ));
    return this.returnHandler({
      model: 'region',
      data: ret.data,
    });
  }

  /**
   * Marca a região passada por parametro como removida e torna ela como um dado historico.
   *
   * @param data
   * @returns {Promise<{success: boolean; data: any} | {success: boolean} | Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | [any]} | {success: boolean; data: any}>>}
   */
  async regionRemove(data) {
    data.data.update = {
      removed: true,
    };
    return await this.regionUpdate({data: data.data});
  }

  /**
   * Cria o pesquisador.
   *
   * @param data
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | [any]} | {success: boolean; data: any}>}
   */
  async researcherCreate(data) {
    let ret = await this.emit_to_server('db.researcher.create', data.data);
    return this.returnHandler({
      model: 'researcher',
      data: ret.data,
    });
  }

  /**
   * Busca todos os pesquisadores ativos do banco.
   *
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | [any]} | {success: boolean; data: any}>}
   */
  async readAllResearchers() {
    let ret = await this.emit_to_server('db.user.read', new QueryObject(
      {
        removed: false,
      },
      'email logged phoneNumber surname name'
    ));
    return this.returnHandler({
      model: 'researcher',
      data: ret.data,
    })
  }

  /**
   * Atualiza informações do pesquisador.
   * Se o admin tentar mudar o password, este remove.
   *
   * @param data
   * @returns {Promise<any>}
   */
  async researcherUpdate(data) {
    delete data.data.update.password;
    let updateValidate = await this.updateValidator(data.data);
    if (!updateValidate.success) return updateValidate;
    const updateObj = new UpdateObject(
      data.data.id,
      data.data.update,
      {
        new: true,
        runValidators: true,
        fields: {
          email: 1,
          id: 1,
          logged: 1,
          name: 1,
          phoneNumber: 1,
          surname: 1,
        }
      }
    );
    let ret = await this.emit_to_server('db.researcher.update', updateObj);
    return this.returnHandler({
      model: 'researcher',
      data: ret.data,
    });
  }

  /**
   * Marca o pesquisador passado na requisição como removido.
   * Tornando esse um dado historico.
   *
   * @param data
   * @returns {Promise<any>}
   */
  async researcherRemove(data) {
    data.data.update = {
      removed: true,
    };
    let removed = await this.researcherUpdate({data: data.data});
    if (!removed.success) return removed;
    const userId = data.data.id;
    let sources = await this.emit_to_server('db.source.update', new UpdateObject(
      {
        researchers: userId,
      },
      {
        $pull: {
          researchers: userId,
        }
      }
    ));
    if (sources.data.error) return this.returnHandler({ // dando erro aqui
      model: 'region',
      data: sources.data,
    });
    return removed;
  }

  /**
   * Vefifica se o usuario já está conectado a fonte.
   *
   * @param fontId
   * @param userId
   * @returns {Promise<boolean>}
   */
  private async verifyUserAlreadyConnected(fontId, userId) {
    let ret = await this.emit_to_server('db.source.read', new QueryObject(
      {
        _id: fontId,
        researchers: userId,
      }
    ));
    return !!ret.data.success.length;
  }

  /**
   * Conecta um usuario a fonte.
   * Verifica se os dados para conexão estão corretos.
   *
   * @param data
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | [any]} | {success: boolean; data: any}>}
   */
  async connectResearcherSource(data) {
    if (!data.data.fontId) return this.returnHandler({
      model: 'source',
      data: {error: 'connect.fontId'}
    });
    if (!data.data.researcherId) return this.returnHandler({
      model: 'source',
      data: {error: 'connect.researcherId'}
    });
    if (await this.verifyUserAlreadyConnected(data.data.fontId, data.data.researcherId)) return this.returnHandler({
      model: 'source',
      data: {error: 'connect.researcherAlreadyConnected'},
    });
    let ret = await this.emit_to_server('db.source.update', new UpdateObject(
      data.data.fontId,
      {
        $push: {
          researchers: data.data.researcherId,
        },
      },
      {
        new: true,
        runValidators: true,
        fields: {
          id: 1,
          name: 1,
          code: 1,
        }
      }
    ));
    return this.returnHandler({
      model: 'source',
      data: ret.data,
    });
  }

  /**
   * Faz os calculos da razao para as ocorrencias validas.
   *
   * @param occurrence
   * @returns {null}
   */
  private validOccurrenceReason(occurrence) {
    if (occurrence.previousSearch) {
      if (!occurrence.changed && occurrence.price && occurrence.previousSearch.price) {
        occurrence['reason'] = occurrence.price / occurrence.previousSearch.price;
      }
      this.validOccurrenceReason(occurrence.previousSearch);
    }
  }

  /**
   * Faz o calculo da média das razões por colunas de pesquisas por produto.
   * Inclui apenas as pesquisas que já possuem razão, calculada na funcao anterior.
   *
   * @param occurrences
   * @param time
   * @returns {{}}
   */
  private calculateProductIPC(occurrences, time) {
    let previousOccurrences = [];
    let reasons = [];
    for (let i = 0; i < occurrences.length; i++) {
      if (occurrences[i].reason) reasons.push(occurrences[i].reason);
      if (occurrences[i].previousSearch) previousOccurrences.push(occurrences[i].previousSearch);
    }
    let partialIPC = 1;
    let sumReasons = 0;
    let thisAverage = 1;
    if (reasons.length) {
      for (let r = 0; r < reasons.length; r++) {
        sumReasons += reasons[r];
      }
      thisAverage = sumReasons / reasons.length;
    }
    if (previousOccurrences.length && time > 1) partialIPC = this.calculateProductIPC(previousOccurrences, time - 1);
    return partialIPC * thisAverage;
  }

  /**
   * Faz o calculo das médias das razoes por produto.
   *
   * @returns {null}
   * @param productsSearches
   */
  private calculateIPCs(productsSearches) {
    for (let i = 0; i < productsSearches.length; i++) {
      // if(productsSearches[i].product.code === '2420111'){
      //   console.log(productsSearches[i].product.code);
      // }
      if (productsSearches[i].searches.length) {
        for (let s = 0; s < productsSearches[i].searches.length; s++) {
          this.validOccurrenceReason(productsSearches[i].searches[s]);
        }
        productsSearches[i]['IPC'] = this.calculateProductIPC(productsSearches[i].searches, productsSearches[i].searchNumber);
      }
    }
    return productsSearches;
  }

  /**
   * Salva os calculos do produdo no relatório.
   *
   * @param calculated
   * @param productsCalculated
   * @returns {Promise<void>}
   */
  private async saveCalculatedProducts(calculated, productsCalculated) {
    let calculatedObject = {};
    for (let i = 0; i < calculated.length; i++) {
      calculatedObject[calculated[i].product.id] = calculated[i];
    }
    let promises = [];
    for (let i = 0; i < productsCalculated.length; i++) {
      if (calculatedObject[productsCalculated[i].product.toString()].IPC) {
        promises.push(
          this.emit_to_server('db.calculatedProduct.update', new UpdateObject(
            productsCalculated[i].id,
            {
              ipc: calculatedObject[productsCalculated[i].product.toString()].IPC,
              weight: (productsCalculated[i].previousWeight * calculatedObject[productsCalculated[i].product.toString()].IPC).toFixed(10),
            }
          ))
        )
      }
    }
    await Promise.all(promises);
  }

  /**
   * Faz o calculo das pesquisas e insere no relatório do mes.
   *
   * @param data
   * @returns {Promise<any>}
   */
  public async calculateReport(data) {
    let query = {
      region: data.data.regionId,
      year: data.data.year,
      month: data.data.month,
    };
    let previousSearches = await this.getPreviousSearches(data.data);
    if (previousSearches.data.error || !previousSearches.data.success.length) return this.returnHandler({
      model: 'report',
      data: {success: false},
    });
    let searchInLine = await this.getSearchesInLIne(query);
    if (!searchInLine.success) return searchInLine;
    await this.mergeSearches(previousSearches.data.success[0].searches, searchInLine.data);
    let productsCalculation = this.calculateIPCs(searchInLine.data);
    const obj = new QueryObject(
      query,
      "calculatedProducts",
      {
        path: "calculatedProducts",
        select: "id ipc previousWeight product weight",
      }
    );
    let ret = await this.emit_to_server('db.report.read', obj);
    await this.saveCalculatedProducts(productsCalculation, ret.data.success[0].calculatedProducts);
    return this.returnHandler({
      model: 'report',
      data: {success: true},
    });
  }

  private async mergeSearches(previousSearches, searchInLine) {
    let previousMap = new Map();
    for (let i = 0; i < previousSearches.length; i++) {
      for (let j = 0; j < previousSearches[i].searches.length; j++) {
        previousMap.set(previousSearches[i].searches[j].code, previousSearches[i].searches[j]);
      }
    }
    let promises = [];
    for (let i = 0; i < searchInLine.length; i++) {
      for (let j = 0; j < searchInLine[i].searches.length; j++) {
        promises.push(this.setPreviousSearchByCode(searchInLine[i].searches[j], previousMap.get(searchInLine[i].searches[j].code)));
      }
    }
    return await Promise.all(promises);
  };

  private async setPreviousSearchByCode(search, previousSearch) {
    if (search.previousSearch) {
      return await this.setPreviousSearchByCode(search.previousSearch, previousSearch);
    } else {
      search.previousSearch = previousSearch;
      return;
    }
  }

  public async readReportDates(data) {
    let report = await this.emit_to_server('db.report.read', new QueryObject(
      {
        region: data.data.regionId
      },
      'year month'
    ));
    let dateMap = new Map();
    for (let i = 0; i < report.data.success.length; i++) {
      if (!dateMap.has(report.data.success[i].year)) dateMap.set(report.data.success[i].year, {months: []});
      dateMap.get(report.data.success[i].year).months.push({
        month: report.data.success[i].month,
        reportId: report.data.success[i].id
      });
    }
    let dateArray = [];
    for (let key of dateMap.keys()) {
      let obj = {};
      obj[`${key}`] = dateMap.get(key);
      dateArray.push(obj);
    }
    report.data.success = dateArray;
    return await this.returnHandler({
      model: 'report',
      data: report.data,
    });
  }

  public async readReport(data) { // metodo enviado para o AdminHandler
    let date: any = data.data.date;
    if (!data.data.date) {
      date = await this.readReviewDate({data: data.data});
      if (!date.success) return this.returnHandler({
        model: 'report',
        data: {error: "dateNotFound"},
      });
      date = date.data[0];
    }
    let report = await this.emit_to_server('db.report.read', new QueryObject(
      {
        region: data.data.regionId,
        year: date.year,
        month: date.month,
        removed: false,
      },
      'calculatedProducts groups month year',
      {
        path: 'calculatedProducts groups',
        select: 'id ipc previousWeight product weight name node nodeSon products',
        populate: {
          path: 'product',
          model: 'product',
          select: 'id code name'
        }
      }
    ));
    let ret = this.tableHandlerAdmin(report.data.success[0]);
    return await this.returnHandler({
      model: 'report',
      data: {
        success: ret,
      }
    });
  }

  private tableHandlerAdmin(report) { // metodo do BasicHandler // tableHandler
    let mapCalculatedProducts = this.mapCalculatedProductsAdmin(report.calculatedProducts);
    return this.mountTree(report.groups, mapCalculatedProducts);
  }

  protected mapCalculatedProductsAdmin(calculatedProducts) { // metodo do BasicHandler // mapCalculatedProducts
    let mapCalculatedProducts = {};
    for (let i = 0; i < calculatedProducts.length; i++) {
      mapCalculatedProducts[calculatedProducts[i].product.id] = calculatedProducts[i];
    }
    return mapCalculatedProducts;
  }

  private getChild(groupId, groupsMap, mapCalculatedProducts) {
    let child = groupsMap[groupId];
    if (child.nodeSon && child.nodeSon.length) {
      for (let i = 0; i < child.nodeSon.length; i++) {
        child.nodeSon[i] = this.getChild(child.nodeSon[i].toString(), groupsMap, mapCalculatedProducts);
      }
    }
    for (let i = 0; i < child.products.length; i++) {
      child.products[i] = mapCalculatedProducts[child.products[i].toString()];
    }
    return child;
  }

  /**
   * Retorna todos os pesquisadores que tem pesquisa em aberto.
   *
   * @param data
   * @returns {Promise<null>}
   */
  public async verifyOpenedSearchesUser(data) {
    let userSource = await this.emit_to_server('db.search.aggregate', [
      {
        $match: {
          status: {
            $ne: "Closed",
          },
        },
      },
      {
        $lookup:
          {
            from: "sources",
            localField: "source",
            foreignField: "_id",
            as: "source"
          }
      },
      {
        $unwind: "$source"
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          "user.name": 1,
          "user.surname": 1,
          "user.id": 1,
          "source.code": 1,
          "source.id": 1,
          "source.name": 1,
          "status": 1,
        }
      },
      {
        $group: {
          _id: {
            "source": "$source",
            "user": "$user"
          }
        }
      },
      {
        $addFields: {
          source: "$_id.source",
          user: "$_id.user"
        }
      },
      {
        $project: {
          "_id": 0,
          "user": 1,
          "source": 1
        }
      },
      {
        $sort:
          {
            "source.name": 1,
          }
      }
    ]);
    let map = new Map();
    for (let i = 0; i < userSource.data.success.length; i++) {
      let fullName = `${userSource.data.success[i].user.name} ${userSource.data.success[i].user.surname}`;
      if (!map.has(fullName)) map.set(fullName, []);
      map.get(fullName).push(userSource.data.success[i].source);
    }
    let ret = [];
    for (let [key, value] of map.entries()) {
      ret.push({
        user: key,
        source: value,
      });
    }
    return await this.returnHandler({
      model: 'search',
      data: {success: ret},
    });
  }

  /**
   * Pega a ultima Review da região passada por parametro.
   * Pega as pesquisas dessa Review.
   * Pega as ultimas repetições fechadas dessas pesquisas.
   * Copia as ultimas repetições fechadas e cria uma nova baseada nesta.
   *
   * @param data
   * @returns {Promise<null>}
   */
  public async openNewMonthSearches(data) {
    let lastReviewProductsSearchId = await this.emit_to_server('db.review.aggregate', [
      {
        $match: {
          region: new Types.ObjectId(data.data.regionId)
        }
      },
      {
        $sort: {
          year: -1,
          month: -1
        }
      },
      {
        $limit: 1
      },
      {
        $lookup: {
          from: "productsearches",
          localField: "searches",
          foreignField: "_id",
          as: "searches"
        }
      },
      {
        $lookup: {
          from: "searches",
          localField: "searches.searches",
          foreignField: "_id",
          as: "searchesRepeat"
        }
      },
      {
        $project: {
          "_id": 0,
          "searches": 1,
          "searchesRepeat": {
            $filter: {
              input: "$searchesRepeat",
              as: "search",
              cond: {
                $eq: ["$$search.status", "Closed"]
              }
            }
          }
        }
      },
      {
        $project: {
          "searches.id": 1,
          "searches.product": 1,
          "searches.searchNumber": 1,
          "searchesRepeat.code": 1,
          "searchesRepeat.especOne": 1,
          "searchesRepeat.especTwo": 1,
          "searchesRepeat.barCode": 1,
          "searchesRepeat.id": 1,
          "searchesRepeat.price": 1,
          "searchesRepeat.product": 1,
          "searchesRepeat.source": 1,
          "searchesRepeat.user": 1,
          "searchesRepeat.itemIndex": 1,
        }
      }
    ]);
    if (lastReviewProductsSearchId.data.error) return await this.returnHandler({
      model: 'searches',
      data: lastReviewProductsSearchId.data,
    });
    let newSearches: any = this.cloneSearches(lastReviewProductsSearchId.data.success[0].searchesRepeat);
    if (!newSearches.length) return await this.returnHandler({
      model: 'searche',
      data: {error: 'hasNoSearchToNextWeek'}
    });
    newSearches = await this.emit_to_server('db.search.create', newSearches);
    if (newSearches.data.error) return await this.returnHandler({
      model: 'searche',
      data: newSearches.data,
    });
    let updatedSearches = await this.updateProductSearches(newSearches.data.success, lastReviewProductsSearchId.data.success[0].searches);
    if (!updatedSearches) return console.error('isso não podia ter acontecido');
    return await this.returnHandler({
      model: 'searche',
      data: {success: updatedSearches},
    });
  }

  /**
   * Atualiza os productSearches para a abertura de um novo mes.
   * Recebe as novas repetições de pesquisa e adiciona com principal nos productSearches passados por paremetro.
   *
   * @param newSearches
   * @param productSearches
   * @returns {Promise<boolean>}
   */
  private async updateProductSearches(newSearches, productSearches) {
    let searchesByProduct = {};
    for (let i = 0; i < productSearches.length; i++) {
      searchesByProduct[productSearches[i].product.toString()] = productSearches[i];
    }
    let objToSave = {};
    for (let i = 0; i < newSearches.length; i++) {
      if (objToSave[newSearches[i].product.toString()]) {
        objToSave[newSearches[i].product.toString()].searches.push(newSearches[i].id);
      } else {
        objToSave[newSearches[i].product.toString()] = {
          id: searchesByProduct[newSearches[i].product.toString()].id,
          searchNumber: searchesByProduct[newSearches[i].product.toString()].searchNumber + 1,
          searches: [newSearches[i].id],
        };
      }
    }
    let promises = [];
    for (let productId in objToSave) {
      if (objToSave.hasOwnProperty(productId)) {
        promises.push(this.emit_to_server('db.productsearch.update', new UpdateObject(
          objToSave[productId].id,
          {
            searches: objToSave[productId].searches,
            searchNumber: objToSave[productId].searchNumber,
          }
        )))
      }
    }
    let rets = await Promise.all(promises);
    let hasError = false;
    for (let i = 0; i < rets.length; i++) {
      if (rets[i].data.error) {
        hasError = true;
        break;
      }
    }
    return !hasError;
  }

  /**
   * Clona as pesquisas antigas para as novas, na abertura de uma nova pesquisa no mes.
   *
   * @param oldSearches
   * @returns {any[]}
   */
  private cloneSearches(oldSearches) {
    let ret = [];
    for (let i = 0; i < oldSearches.length; i++) {
      ret.push({
        code: oldSearches[i].code,
        user: oldSearches[i].user.toString(),
        product: oldSearches[i].product.toString(),
        source: oldSearches[i].source.toString(),
        especOne: oldSearches[i].especOne,
        especTwo: oldSearches[i].especTwo,
        price: Number(oldSearches[i].price),
        previousSearch: oldSearches[i].id,
        barCode: oldSearches[i].barCode,
        itemIndex: oldSearches[i].itemIndex,
      })
    }
    return ret;
  }

  /**
   * Inicia um novo ciclo de pesquisa ignorando o anterio, tendo ou não um anterior.
   * Verifica se não tem nenhum relatório no periodo passado por parametro ou no periodo acima. todo <<<<<<<<<<<<<<<
   * Busca todos os produtos relationados a cesta da região passada por parametro.
   * Utiliza o ponderador base que está na cesta para a criação dos produtos calculados.
   * Cria os produtos calculados.
   * Cria um novo report, utilizando o ano e o mes passado por parametro.
   * Cria o relatorio de critica e prepara os produtos para a primeira pesquisa.
   *
   * @param data
   * @returns {Promise<null>}
   */
  async openNewMonthDiscardPrevious(data) {
    let initPromises = await this.emit_to_server('db.productbasket.read', new QueryObject(
      {
        region: data.data.regionId,
      },
      "basket"
    ));
    let calculatedProducts = [];
    for (let i = 0; i < initPromises.data.success[0].basket.length; i++) {
      calculatedProducts.push({
        previousWeight: initPromises.data.success[0].basket[i].baseWeight,
        weight: initPromises.data.success[0].basket[i].baseWeight,
        ipc: 0,
        product: initPromises.data.success[0].basket[i].product.toString(),
      });
    }
    let promises = await Promise.all([
      this.emit_to_server('db.calculatedProduct.create', calculatedProducts),
      this.emit_to_server('db.grouper.read', new QueryObject(
        {
          productBasket: initPromises.data.success[0].id,
        },
        "id"
      )),
      this.openNewSearch({
        year: data.data.year,
        month: data.data.month,
        regionId: data.data.regionId,
        searchNumber: 1
      })
    ]);
    let report: any = {
      region: data.data.regionId,
      year: data.data.year,
      month: data.data.month,
      groups: [],
      calculatedProducts: [],
    };
    let length = Math.max(promises[0].data.success.length, promises[1].data.success.length);
    for (let i = 0; i < length; i++) {
      if (promises[0].data.success.length >= i + 1) {
        report.calculatedProducts.push(promises[0].data.success[i].id);
      }
      if (promises[1].data.success.length >= i + 1) {
        report.groups.push(promises[1].data.success[i].id);
      }
    }
    report = await this.emit_to_server('db.report.create', report);
    return await this.returnHandler({
      model: "report",
      data: report.data,
    });
  }

  /**
   * Le todas as pesquisas relacionadas ao Review anterior.
   * Cria as Search
   * Cria as novas ProductSearch.
   * Cria o Review atualizado.
   * Chama a função para calcular o relatório.
   *
   * @param data
   * @returns {Promise<any>}
   */
  public async openNewMonth(data) {
    let lastReviewProductsSearchId = await this.emit_to_server('db.review.aggregate', [
      {$match: {region: new Types.ObjectId(data.data.regionId)}},
      {$sort: {year: -1, month: -1}},
      {$limit: 1},
      {
        $lookup: {
          from: "productsearches",
          localField: "searches",
          foreignField: "_id",
          as: "searches"
        }
      },
      {
        $lookup: {
          from: "searches",
          localField: "searches.searches",
          foreignField: "_id",
          as: "searchesRepeat"
        }
      },
      {
        $project: {
          "month": 1,
          "year": 1,
          "searches.id": 1,
          "searches.product": 1,
          "searches.searchNumber": 1,
          "searchesRepeat.code": 1,
          "searchesRepeat.especOne": 1,
          "searchesRepeat.especTwo": 1,
          "searchesRepeat.barCode": 1,
          "searchesRepeat.id": 1,
          "searchesRepeat.price": 1,
          "searchesRepeat.product": 1,
          "searchesRepeat.source": 1,
          "searchesRepeat.user": 1,
          "searchesRepeat.itemIndex": 1,
        }
      }
    ]);
    if (lastReviewProductsSearchId.data.error) return await this.returnHandler({
      model: 'searches',
      data: lastReviewProductsSearchId.data,
    });
    let newSearchesRepeat: any = await this.cloneSearchesFirst(lastReviewProductsSearchId.data.success[0].searchesRepeat);
    if (newSearchesRepeat.error) return await this.returnHandler({
      model: 'searches',
      data: {error: newSearchesRepeat.error},
    });
    newSearchesRepeat = await this.emit_to_server('db.search.create', newSearchesRepeat);
    if (newSearchesRepeat.data.error) return await this.returnHandler({
      model: 'searches',
      data: newSearchesRepeat.data,
    });
    let newSearches: any = await this.createFirstSearchLikeBefore(lastReviewProductsSearchId.data.success[0].searches, newSearchesRepeat.data.success);
    if (!newSearches) return console.error('isso não podia ter acontecido');
    return await this.createReview({
      currentYear: lastReviewProductsSearchId.data.success[0].year,
      currentMonth: lastReviewProductsSearchId.data.success[0].month,
      searches: newSearches,
      regionId: data.data.regionId
    });
  }

  /**
   * Copia os calculatedProducts do report anterior para clonar.
   *
   * @param calculatedProducts
   * @returns {Promise<any[]>}
   */
  private async createNextCalculatedProducts(calculatedProducts) {
    let ret = [];
    let toSave = [];
    for (let i = 0; i < calculatedProducts.length; i++) {
      let id = new Types.ObjectId().toString();
      toSave.push({
        _id: id,
        previousWeight: calculatedProducts[i].weight,
        weight: calculatedProducts[i].weight,
        ipc: calculatedProducts[i].ipc,
        product: calculatedProducts[i].product.toString(),
      });
      ret.push(id);
    }
    let saved = await this.emit_to_server('db.calculatedProduct.create', toSave);
    if (saved.data.error) console.log('não era pra acontecer isso aqui');
    return ret;
  }

  /**
   * Pega a proxima data (mes e ano), referente a data passada por paremetro.
   *
   * @param currentDate
   * @returns {any}
   */
  private getNextDate(currentDate) {
    if (currentDate.month < 12) return {
      month: currentDate.month + 1,
      year: currentDate.year,
    };
    return {
      month: 1,
      year: currentDate.year + 1,
    };
  }

  /**
   * Cria o proximo report com base no anterior.
   *
   * @param data
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | any[]} | {success: boolean; data: any | any[] | boolean}>}
   */
  private async createNextReport(data) {
    let report = await this.emit_to_server('db.report.read', new QueryObject(
      {
        year: data.year,
        month: data.month,
        region: data.regionId,
      },
      "calculatedProducts groups",
      {
        path: 'calculatedProducts',
        select: 'ipc product weight'
      }
    ));
    let nextCalculatedProducts = await this.createNextCalculatedProducts(report.data.success[0].calculatedProducts);
    let groups = [];
    for (let i = 0; i < report.data.success[0].groups.length; i++) {
      groups.push(report.data.success[0].groups[i].toString());
    }
    let date = this.getNextDate({month: data.month, year: data.year});
    let ret = await this.emit_to_server('db.report.create', {
      region: data.regionId,
      year: date.year,
      month: date.month,
      calculatedProducts: nextCalculatedProducts,
      groups: groups,
    });
    return this.returnHandler({
      model: 'report',
      data: ret.data,
    });
  }

  /**
   * Cria um novo Review com base no anterior.
   *
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | any[]} | {success: boolean; data: any | boolean | any[]}>}
   * @param data
   */
  private async createReview(data: { currentYear: number, currentMonth: number, searches: string[], regionId: string }) {
    let toSave = {
      year: null,
      month: null,
      region: data.regionId,
      searches: data.searches,
    };
    if (data.currentMonth == 12) {
      toSave.year = data.currentYear + 1;
      toSave.month = 1;
    } else {
      toSave.year = data.currentYear;
      toSave.month = data.currentMonth + 1;
    }
    let ret = await this.emit_to_server('db.review.create', toSave);
    await this.calculateReport({
      data: {
        regionId: data.regionId,
        year: data.currentYear,
        month: data.currentMonth,
      }
    });
    let nextReport = await this.createNextReport({
      regionId: data.regionId,
      month: data.currentMonth,
      year: data.currentYear
    });
    if (!nextReport.success) return nextReport;
    return await this.returnHandler({
      model: 'review',
      data: ret.data,
    });
  }

  /**
   * Cria o productSearch de cada produto, baseado na pesquisa anterior.
   *
   * @param currentSearch
   * @param newSearchRepeat
   * @returns {Promise<any>}
   */
  private async createFirstSearchLikeBefore(currentSearch, newSearchRepeat) {
    let repeatByProduct = {};
    for (let i = 0; i < newSearchRepeat.length; i++) {
      if (!repeatByProduct[newSearchRepeat[i].product.toString()]) {
        repeatByProduct[newSearchRepeat[i].product.toString()] = [
          newSearchRepeat[i].id
        ];
      } else {
        repeatByProduct[newSearchRepeat[i].product.toString()].push(newSearchRepeat[i].id);
      }
    }
    let toSave = [];
    let objIds = {};
    for (let i = 0; i < currentSearch.length; i++) {
      objIds[currentSearch[i].id] = true;
      let obj: { product: string, searchNumber: number, searches?: [string] } = {
        product: currentSearch[i].product.toString(),
        searchNumber: 1,
      };
      if (repeatByProduct[currentSearch[i].product.toString()]) {
        obj.searches = repeatByProduct[currentSearch[i].product.toString()];
      }
      toSave.push(obj);
    }
    let ids = Object.keys(objIds);
    let updated = await this.emit_to_server('db.productsearch.update', new UpdateObject(
      {
        _id: {
          $in: ids,
        },
      },
      {
        status: "Closed",
      },
      {
        new: true,
        runValidators: true,
        multi: true,
      }
    ));
    if (updated.data.error) return false;
    if (updated.data.success.nModified !== ids.length) return false;
    let save = await this.emit_to_server('db.productsearch.create', toSave);
    if (save.data.error) return false;
    let ret = [];
    for (let i = 0; i < save.data.success.length; i++) {
      ret.push(save.data.success[i].id);
    }
    return ret;
  }

  /**
   * Clona a ultima pesquisa do mês anterior para a primeira pesquisa do mês atual.
   *
   * @param oldSearches
   * @returns {any[]}
   */
  private async cloneSearchesFirst(oldSearches) {
    let ids: object = {};
    let ret = [];
    for (let i = 0; i < oldSearches.length; i++) {
      ids[oldSearches[i].id] = true;
      ret.push({
        code: oldSearches[i].code,
        user: oldSearches[i].user.toString(),
        product: oldSearches[i].product.toString(),
        source: oldSearches[i].source.toString(),
        especOne: oldSearches[i].especOne,
        especTwo: oldSearches[i].especTwo,
        price: oldSearches[i].price,
        barCode: oldSearches[i].barCode,
      })
    }
    let oldSearchesId = Object.keys(ids);
    let updated = await this.emit_to_server('db.search.update', new UpdateObject(
      {
        _id: {
          $in: oldSearchesId,
        }
      },
      {
        status: 'Closed'
      },
      {
        new: true,
        runValidators: true,
        multi: true,
      }
    ));
    if (updated.data.error) return {error: updated.data.error};
    if (updated.data.success.nModified !== oldSearchesId.length) return {error: "searchUpdateError"};
    return ret;
  }

  /**
   * Funcção responsavel por abrir uma nova pesquisa.
   * Verifica se tem Search com o status diferente de Closed, se voltar alguma com init ou create, elas serão fechadas.
   * Cria uma Search por Product na fonte/user, ou seja, pra cada usuario e fontes que o usuario participa, será criado a nova search com base na anterior, se tiver anterior.
   * Verifica, pela data, se tem que criar uma nova Review; se sim pega o actualSearchNumber da antiga, caso exista; se não existe antiga, cria uma nova.
   *
   * @returns {Promise<null>}
   * @param data
   */
  private async openNewSearch(data: { year: number, month: number, regionId: string, searchNumber: number }) {
    let productSearch = await this.getProductSearchByReview({
      searchNumber: data.searchNumber,
      regionId: data.regionId,
      month: data.month,
      year: data.year,
    });
    let searches = await this.createSearch({
      regionId: data.regionId,
      year: data.year,
      month: data.month,
      searchNumber: data.searchNumber
    });
    let ids = [];
    for (let i = 0; i < productSearch.length; i++) {
      ids.push(productSearch[i].id);
    }
    return await this.emit_to_server('db.productsearch.updateSearch', {
      ids,
      searches
    });
  }

  /**
   * Cria as pesquisas baseadas na anterior.
   *
   * @returns {Promise<null>}
   * @param data
   */
  private async createSearch(data: { regionId: string; year: number, month: number, searchNumber: number }) {
    let previusSearch = await this.productSearchByDate({
      year: data.year,
      month: data.month,
      regionId: data.regionId
    });
    if (!previusSearch) return await this.createFirstSearch(data);
    return null;
  }

  /**
   * Busca todas as fontes pela região.
   * Cria a primeira pesquisa de cada produto da fonte no sisteama.
   *
   * @returns {Promise<{}>}
   * @param data
   */
  private async createFirstSearch(data: { regionId: string; year: number, month: number, searchNumber: number }) {
    let sources = await this.emit_to_server('db.region.read', new QueryObject(
      data.regionId,
      "sources",
      {
        path: "sources",
        select: "products researchers",
      }
    ));
    sources = sources.data.success.sources;
    let searches = {};
    let toSave = [];
    for (let s = 0; s < sources.length; s++) {
      let sourceId = sources[s].id;
      for (let p = 0; p < sources[s].products.length; p++) {
        let productId = sources[s].products[p].toString();
        if (!searches[productId]) searches[productId] = [];
        for (let r = 0; r < sources[s].researchers.length; r++) {
          let id = new Types.ObjectId();
          let code = new Types.ObjectId();
          let search = {
            _id: id.toString(),
            code: code.toString(),
            user: sources[s].researchers[r].toString(),
            product: productId,
            source: sourceId,
            especOne: "sem especificação 1",
            especTwo: "sem especificação 2",
            price: 0,
          };
          toSave.push(search);
          searches[productId].push(id.toString());
        }
      }
    }
    let ret = await this.emit_to_server('db.search.create', toSave);
    return searches;
  }

  /**
   * Busca o relatorio referente ao mes anterior da data passada por parametro na região.
   *
   * @returns {Promise<any>}
   * @param data
   */
  private async productSearchByDate(data: { year: number; month: number; regionId: string }) {
    let query = null;
    if (data.month === 1) query = {
      year: data.year - 1,
      month: 12,
      region: data.regionId,
    };
    else query = {
      year: data.year,
      month: data.month - 1,
      region: data.regionId,
    };
    let ret = await this.emit_to_server('db.review.read', new QueryObject(
      query,
    ));
    if (ret.data.success.length) return ret.data.success[0].searches;
    return false;
  }

  /**
   * Faz uma busca dos productSearch por review, buscando o review pela data.
   * Se o review não exite, ela cria uma nova e monta os peoductSeach para esta.
   * Retorna os productSearch.
   *
   * @returns {Promise<null>}
   * @param data
   */
  private async getProductSearchByReview(data: { regionId: string, year: number, month: number, searchNumber: number }) {
    let review = await this.emit_to_server('db.review.read', new QueryObject(
      {
        year: data.year,
        month: data.month,
        region: data.regionId
      },
      "id month searches year",
      {
        path: "searches",
        select: "id searchNumber",
      }
    ));
    if (review.data.error) return console.error('db.review.read error', review.data.error);
    if (!review.data.success.length) review = await this.createNewReview({
      year: data.year,
      month: data.month,
      regionId: data.regionId,
      searchNumber: data.searchNumber,
    });
    return Array.isArray(review.data.success) ? review.data.success[0].searches : review.data.success.searches;
  }

  /**
   * Cria uma nova review.
   * Busca os produtos ativos da cesta na região.
   * Cria uma nova productSearch para cada produto ativo da região.
   * Cria a review, inseridon os poductsSearch nela.
   *
   * @returns {Promise<any>}
   * @param data
   */
  private async createNewReview(data: { year: number; month: number; regionId: string; searchNumber: number }) {
    let regionProducts = await this.emit_to_server('db.productbasket.read', new QueryObject(
      {
        region: data.regionId,
      },
      "basket.product",
      {
        path: "basket.product",
        select: "id removed",
      }
    ));
    let productsSearch: any = [];
    for (let i = 0; i < regionProducts.data.success[0].basket.length; i++) {
      if (!regionProducts.data.success[0].basket[i].removed) productsSearch.push({
        product: regionProducts.data.success[0].basket[i].product.id,
        searchNumber: data.searchNumber,
      });
    }
    productsSearch = await this.emit_to_server('db.productsearch.create', productsSearch);
    if (productsSearch.data.error) return productsSearch;
    let review: any = {
      year: data.year,
      month: data.month,
      region: data.regionId,
      searches: [],
    };
    for (let i = 0; i < productsSearch.data.success.length; i++) {
      review.searches.push(productsSearch.data.success[i].id);
    }
    review = await this.emit_to_server('db.review.create', review);
    return await this.emit_to_server('db.review.read', new QueryObject(
      review.data.success[0].id,
      "id month searches year",
      {
        path: "searches",
        select: "id searchNumber product searches",
      }
    ));
  }

  /**
   * faz uma leitura do banco do product basket de uma região, passando o seu id.
   * @param {{regionId: string}} data
   * @returns {Promise<void>}
   */
  public async readProductBasket(data: { data: {regionId: string} }) { // read_product_basket
    let read_obj = new QueryObject({region: data.data.regionId}, 'id region basket',
      {path: 'basket.product', select: 'id name code'});
    let ret = await this.emit_to_server('db.productbasket.read', read_obj);
    return await this.returnHandler({
      model: 'productbasket',
      data: ret.data
    });
  }

  /**
   * Caso de um erro na importação dos produtos, essa função remove o productbasket que tem esses produtos.
   * Retorna o erro referente essa impossibilidade.
   *
   * @param regionId
   * @param error
   * @param {number} times
   * @returns {Promise<any>}
   */
  private async rollbackProductBasket(regionId, error, times = 0) {
    let removed = await this.emit_to_server('db.productbasket.delete', {
      region: regionId
    });
    if (removed.data.error) {
      if (times < 4) {
        return await this.rollbackProductBasket(regionId, error, times++);
      } else {
        return await this.returnHandler({
          model: 'productbasket',
          data: {error: 'import.seriousError'},
        })
      }
    }
    return await this.returnHandler({
      model: 'productbasket',
      data: error,
    });
  }

  /**
   * Apaga os produtos, que estão com algum problema, da base de dados.
   *
   * @param products
   * @param error
   * @param {number} times
   * @returns {Promise<any>}
   */
  private async rollbackProducts(products, error, times = 0) {
    let ids = [];
    for (let i = 0; i < products.length; i++) {
      ids.push(products[i].id);
    }
    let removed = await this.emit_to_server('db.product.delete', {
      _id: {
        $in: ids,
      }
    });
    if (removed.data.error) {
      if (times < 4) return await this.rollbackProducts(products, error, times++);
      else return await this.returnHandler({
        model: 'productbasket',
        data: {error: 'import.seriousError'},
      })
    }
    return await this.returnHandler({
      model: 'productbasket',
      data: error,
    })
  }

  /**
   * Funcionalidade responsavel por salvar os dados que vieram na planilha importada pelo cliente.
   *
   * @param data
   * @returns {Promise<any>}
   */
  public async importBasket(data) {
    let exists = await this.emit_to_server('db.productbasket.exists', {query: {region: data.data.regionId}});
    if (exists.data.success) {
      return await this.returnHandler({
        model: 'productbasket',
        data: {
          error: 'import.existsBasket',
        },
      })
    }
    let documentSource = await Util.writeXLS(data.data.document, data.data.regionId);
    let jsonDocument = await xlsx2json(documentSource);
    await Util.removeFile(documentSource);
    let products = [];
    let basket = {
      region: data.data.regionId,
      basket: [],
    };
    let productsByCode = {};
    for (let i = 1; i < jsonDocument[0].length; i++) {
      let id = new Types.ObjectId().toString();
      products.push({
        _id: id,
        name: jsonDocument[0][i].B.toUpperCase(),
        code: jsonDocument[0][i].A,
      });
      basket.basket.push({
        product: id,
        baseWeight: Number(jsonDocument[0][i].C),
      });
      if (productsByCode[jsonDocument[0][i].A]) {
        console.log('repetido', productsByCode[jsonDocument[0][i].A]);
        return await this.returnHandler({
          model: "productbasket",
          data: {
            error: {
              index: i,
              msg: 'products.repeatedCode',
            }
          }
        });
      }
      productsByCode[jsonDocument[0][i].A] = {id};
    }
    let ret = await Promise.all([
      this.emit_to_server('db.product.create', products),
      this.emit_to_server('db.productbasket.create', basket),
    ]);
    if (ret[0].data.error) return await this.rollbackProductBasket(basket.region, ret[0].data);
    if (ret[1].data.error) return await this.rollbackProducts(ret[0].data.success, ret[1].data);
    let groups = await this.createGroupsFromXLS(jsonDocument, this.mapProducts(products), ret[1].data.success[0].id);
    let savedGroups = await this.emit_to_server('db.grouper.create', groups);
    if (savedGroups.data.error) return this.returnHandler({
      model: 'grouper',
      data: savedGroups.data,
    });
    return await this.readProductBasket({data: {regionId: data.data.regionId}});
  }

  /**
   * Mapeia um array de products, para uma estrutura com chave e valor.
   * Onde a chave seria o codigo do produto e o valor o proprio produto.
   *
   * @param products
   * @returns {{}}
   */
  private mapProducts(products) {
    let ret = {};
    for (let i = 0; i < products.length; i++) {
      ret[products[i].code] = products[i];
    }
    return ret;
  }

  /**
   * Monta a estrutura agrupadora de produtos.
   * Utilizando as informações que estão vindo do excel.
   *
   * @param jsonDocument
   * @param products
   * @param basketId
   * @returns {Promise<any[]>}
   */
  private async createGroupsFromXLS(jsonDocument, products, basketId) {
    let groups = {};
    for (let i = jsonDocument.length - 1; i > 0; i--) {
      for (let j = 1; j < jsonDocument[i].length; j++) {
        if (!groups[`${jsonDocument[i][j].B}-${i}`]) {
          groups[`${jsonDocument[i][j].B}-${i}`] = {
            _id: new Types.ObjectId().toString(),
            node: null,
            nodeSon: [],
            productBasket: basketId,
            name: jsonDocument[i][j].B,
            products: [],
          };
        }
        groups[`${jsonDocument[i][j].B}-${i}`].products.push(products[jsonDocument[i][j].A].id);
        if (!groups[`${jsonDocument[i][j].B}-${i}`].node && jsonDocument[i][j].C) {
          groups[`${jsonDocument[i][j].C}-${i + 1}`].nodeSon.push(groups[`${jsonDocument[i][j].B}-${i}`]._id);
          groups[`${jsonDocument[i][j].B}-${i}`].node = groups[`${jsonDocument[i][j].C}-${i + 1}`]._id;
        }
      }
    }
    let ret = [];
    for (let group in groups) {
      if (groups.hasOwnProperty(group)) {
        ret.push(groups[group]);
      }
    }
    return ret;
  }

  private async getProductsByRegion(data: { regionId: string }) {
    let ret: any = await this.readProductBasket({data:{regionId: data.regionId}});
    if (!ret.success) return null;
    let products = [];
    for (let i = 0; i < ret.data[0].basket.length; i++) {
      products.push({
        text: `${ret.data[0].basket[i].product.code} ${ret.data[0].basket[i].product.name}`,
        value: {
          id: ret.data[0].basket[i].product.id,
        }
      });
    }
    return products;
  }

  private async getSourceUserByRegion(data: { regionId: string }) {
    let region = await this.emit_to_server('db.region.read', new QueryObject(
      data.regionId,
      "sources",
      {
        path: "sources",
        select: "name id removed researchers",
        populate: {
          path: "researchers",
          select: "name surname email id"
        }
      }
    ));
    let ret = {researchers: [], sources: []};
    if (region.data.error) return ret;
    for (let i = 0; i < region.data.success.sources.length; i++) {
      if (!region.data.success.sources[i].removed) {
        for (let p = 0; p < region.data.success.sources[i].researchers.length; p++) {
          ret.researchers.push({
            text: `${region.data.success.sources[i].researchers[p].name} ${region.data.success.sources[i].researchers[p].surname}`,
            value: {
              id: region.data.success.sources[i].researchers[p].id,
            }
          });
        }
        ret.sources.push({
          text: region.data.success.sources[i].name,
          value: {
            id: region.data.success.sources[i].id,
          },
        })
      }
    }
    return ret;
  }

  private async getFilters(data: { regionId: string }) {
    let toFilter = await Promise.all([
      this.getSourceUserByRegion({regionId: data.regionId}),
      this.getProductsByRegion({regionId: data.regionId}),
    ]);
    return {
      researchers: toFilter[0].researchers,
      sources: toFilter[0].sources,
      products: toFilter[1],
    }
  }

  /**
   * Busca todas as pesquisas pesquisas feitas do review, referente ao periodo passado e da região informada.
   *
   * @param data {regionId: string, year: number, month: number}
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | [any]} | {success: boolean; data: any | any[] | boolean}>}
   */
  public async readAllSearchesToReview(data: {data:{ regionId: string, year: number, month: number }}) {
    let ret = await Promise.all([
      this.getSearchesInLIne({
        region: data.data.regionId,
        year: data.data.year,
        month: data.data.month,
      }),
      this.getFilters({regionId: data.data.regionId})
    ]);
    if (!ret[0].success) return ret;
    let review = this.handlerReview(ret[0]);
    review.data = {...review.data, ...ret[1]};
    return review;
  }

  private handlerReview(review) {
    let searches = [];
    let columnsAmount = 0;
    for (let i = 0; i < review.data.length; i++) {
      if (review.data[i].searchNumber > columnsAmount) columnsAmount = review.data[i].searchNumber;
      if (review.data[i].searches) {
        for (let j = 0; j < review.data[i].searches.length; j++) {
          searches.push(this.handlerSearch(review.data[i].product, review.data[i].searches[j]));
        }
      } else {
        searches.push({product: review.data[i].product});
      }
    }
    review.data = {
      searches,
      columnsAmount,
    };
    return review;
  }

  private handlerSearch(product, search) {
    let sorted = [];
    let source = search.source;
    delete search.source;
    this.sortSearchByOld(search, sorted);
    return {
      product,
      source,
      searches: sorted,
    };
  }

  private sortSearchByOld(search, retArray) {
    if (search.previousSearch) this.sortSearchByOld(search.previousSearch, retArray);
    delete search.previousSearch;
    retArray.push(search);
  }

  /**
   * Faz a busca e a montagem das pesquisas cadastradas no periodo.
   * Essa função aceita filtros, caso a funcionalidade responsavel por buscar o produto utilizando aquele filtro esteja disponivel na classe, ela é chamada.
   * Se essa funcionalidade não estiver cadastrada, ele a ignora.
   *
   * @param data
   * @returns {Promise<{success: boolean; data: {title: string; description: string; buttons: {label: string; method: string}[]; type: string} | any | any[]} | {success: boolean; data: any | any[] | boolean}>}
   */
  public async readAllSearchesToReviewFilter(data) {
    let dados = data.data;
    if (!dados.filter) return await this.readAllSearchesToReview({data: data.data});
    let reviews = await this.emit_to_server('db.review.read', new QueryObject(
      {
        region: dados.regionId,
        year: dados.year,
        month: dados.month,
      },
      "searches",
    ));
    let byFilter = [];
    for (let filter in dados.filter) {
      if (dados.filter.hasOwnProperty(filter) && dados.filter[filter].length > 0) {
        if (this[`${filter}Filter`]) {
          byFilter.push(this[`${filter}Filter`](dados.filter[filter], reviews.data.success[0].searches));
        }
      }
    }
    if (byFilter.length < 1) return await this.readAllSearchesToReview({data: data.data});
    let rets = await Promise.all(byFilter);
    let ret = null;
    if (rets[0].searches) {
      ret = await this.getSearchesInLIneFilter(rets[0].searches.data.success, dados);
      this.getValidSearches(ret.data.success, rets[0].ids);
    } else {
      ret = await this.getSearchesInLIneFilter(rets[0].data.success, dados);
    }
    ret = await this.returnHandler({
      model: 'review',
      data: ret.data,
    });
    if (!ret.success) return ret;
    return this.handlerReview(ret);
  }

  private getValidSearches(allSearches, validSearches) {
    for (let i = 0; i < allSearches.length; i++) {
      let valids = [];
      for (let j = 0; j < allSearches[i].searches.length; j++) {
        if (validSearches.has(allSearches[i].searches[j].id)) valids.push(allSearches[i].searches[j]);
      }
      allSearches[i].searches = valids;
    }
  }

  /**
   * Faz o mapiamento de um array de pesquisa, para uma estrutura de chave valor.
   * Onde a chave é o id da pesquisa e o valor a propria pesquisa.
   *
   * @param search
   * @returns {{}}
   */
  private mapBigger(search) {
    let ret = {};
    for (let i = 0; i < search.length; i++) {
      ret[search[i].id] = search[i];
    }
    return ret;
  }

  /**
   * Faz a seaparação da pesquisa com a menor quantidade de retornos, das que estão com mais quantidade que ela.
   *
   * @param searches
   * @returns {{smaller: any; bigger: any[]}}
   */
  private isolateSmaller(searches) {
    let ret = {
      smaller: searches[0],
      bigger: [],
    };
    for (let i = 1; i < searches.length; i++) {
      if (searches[i].length < ret.smaller.length) {
        ret.bigger.push(this.mapBigger(ret.smaller));
        ret.smaller = searches[i];
      } else {
        ret.bigger.push(this.mapBigger(searches[i]));
      }
    }
    return ret;
  }

  /**
   * Quando ocorre a pesquisa por filtros e se tem mais de um filtro.
   * Essa funcoinalidade é responsavel por fazer a junção entre os produtos que são comum em todos os retornos.
   * Fazendo a interação do menor array.
   *
   * @param data
   * @param regionId
   * @returns {Promise<any>}
   */
  private async joinSearchesFiltered(data, regionId) {
    let searches = [];
    for (let i = 0; i < data.length; i++) {
      searches.push(data[i].data.success);
    }
    let toJoin = this.isolateSmaller(searches);
    let inCommon = [];
    for (let i = 0; i < toJoin.smaller.length; i++) {
      let toAdd = true;
      for (let j = 0; j < toJoin.bigger.length; j++) {
        if (!toJoin.bigger[j][toJoin.smaller[i].id]) {
          toAdd = false;
          break;
        }
      }
      if (toAdd) inCommon.push(toJoin.smaller[i]);
    }
    return await this.getPreviousSearchInLine(inCommon, regionId);
  }

  private async researchersFilter(researchesId, productSearchesId) {
    let sources = await this.emit_to_server('db.source.read', new QueryObject(
      {
        researchers: {
          $in: researchesId
        }
      },
      'products'
    ));
    return await this.productsFilterToFilter(this.getProductsIdsByFonts(sources.data.success), productSearchesId);
  }

  private getProductsIdsByFonts(fonts) {
    let ret = {
      products: [],
      sources: new Set(),
    };
    for (let i = 0; i < fonts.length; i++) {
      ret.products = ret.products.concat(fonts[i].products);
      ret.sources.add(fonts[i].id);
    }
    return ret;
  }

  /**
   * Encontra os produtos que estão relacionados a fonte passada por parametro.
   * Retorna o resultado da função responsavel por pegar pesquisas por id de produtos.
   *
   * @param sourcesId
   * @param productSearchesId
   * @returns {Promise<any>}
   */
  private async fontsFilter(sourcesId, productSearchesId) {
    let sources = await this.emit_to_server('db.source.read', new QueryObject(
      {
        _id: {
          $in: sourcesId,
        },
      },
      'products',
    ));
    return await this.productsFilterToFilter(this.getProductsIdsByFonts(sources.data.success), productSearchesId);
  }

  /**
   * Retorna todas as pesquisas que contem o id das pesquisas e o id dos produtos.
   *
   * @param data
   * @param productSearchesId
   * @returns {Promise<any>}
   */
  private async productsFilterToFilter(data, productSearchesId) {
    let searches = await this.emit_to_server('db.productsearch.read', new QueryObject(
      {
        _id: {
          $in: productSearchesId,
        },
        product: {
          $in: data.products,
        }
      },
      null,
      {
        path: 'searches',
        select: 'source'
      }
    ));
    let ids = this.formatFilter(searches.data.success, data.sources);
    return {searches, ids};
  };

  /**
   * Retorna todas as pesquisas que contem o id das pesquisas e o id dos produtos.
   *
   * @param productsId
   * @param productSearchesId
   * @returns {Promise<any>}
   */
  private async productsFilter(productsId, productSearchesId) {
    let searches = await this.emit_to_server('db.productsearch.read', new QueryObject(
      {
        _id: {
          $in: productSearchesId,
        },
        product: {
          $in: productsId,
        }
      }
    ));
    return searches;
  };

  private formatFilter(searches, fontsID) {
    let ret = new Set();
    for (let i = 0; i < searches.length; i++) {
      let fontsSearches = [];
      for (let j = 0; j < searches[i].searches.length; j++) {
        if (fontsID.has(searches[i].searches[j].source.toJSON())) {
          let id = searches[i].searches[j].id;
          fontsSearches.push(id);
          ret.add(id);
        }
      }
      searches[i].searches = fontsSearches;
    }
    return ret;
  }

  /**
   * Cria as promises que executam o update das pesquisas passadas por parametro.
   *
   * @param data
   * @returns {any[]}
   */
  private getPromiseToUpdate(data) {
    let ret = [];
    for (let i = 0; i < data.length; i++) {
      let obj: any = {};
      let ifChanged = false;
      if (data[i].hasOwnProperty('price')) {
        obj.price = data[i].price;
        ifChanged = true;
      }
      if (data[i].hasOwnProperty('changed')) {
        obj.changed = data[i].changed;
        ifChanged = true;
      }
      if (ifChanged) {
        ret.push(this.emit_to_server('db.search.update', new UpdateObject(
          data[i].id,
          obj,
          {
            new: true,
            runValidators: true,
            fields: {
              id: 1,
              changed: 1,
              price: 1,
            }
          }
        )));
      }
    }
    return ret;
  }

  /**
   * Retorna apenas os updates que vem com success.
   *
   * @param searches
   * @returns {{success: any[]}}
   */
  private getUpdated(searches) {
    let ret = [];
    for (let i = 0; i < searches.length; i++) {
      if (!searches[i].data.error && searches[i].data.success[0]) ret.push(searches[i].data.success[0]);
    }
    return {
      success: ret,
    }
  }

  /**
   * Salva a alteração feita através critica nas pesquisas.
   *
   * @param data
   * @returns {Promise<null>}
   */
  public async changeResearchByReview(data) {
    let promises = await Promise.all(this.getPromiseToUpdate(data.data.searches));
    return this.returnHandler({
      model: 'search',
      data: this.getUpdated(promises),
    });
  }

  public async checkedReviewSearch(data) {
    let ret = await this.emit_to_server('db.search.update', new UpdateObject(
      data.data.searchId,
      {
        $set: {
          reviewChecked: data.data.reviewChecked
        }
      },
      {
        new: true,
        runValidators: true,
        fields: {
          id: 1,
          reviewChecked: 1,
        }
      }
    ));
    return await this.returnHandler({
      model: "search",
      data: ret.data,
    })
  }

  private async existReportByDate(data) {
    let ret = await this.emit_to_server('db.report.count', {
        region: data.regionId,
        month: data.month,
        year: data.year,
      }
    );
    if (ret.data.error) return false;
    return !!ret.data.success;
  }

  public async importReview(data) {
    if (!await this.verifyRegionHasBasket(data.regionId)) return await this.returnHandler({
      model: 'review',
      data: {error: 'regionHasNoBasket'},
    });
    let documentSource = await Util.writeXLS(data.document, `review_${data.year}_${data.month}_${data.regionId}`);
    let jsonDocument = await xlsx2json(documentSource);
    await Util.removeFile(documentSource);
    if (jsonDocument[1] && jsonDocument[1].length > 1) await this.researcherCreateFromTable(jsonDocument[1]);
    if (jsonDocument[2] && jsonDocument[2].length > 1) await this.sourceCreateFromTable(jsonDocument[0], jsonDocument[2], data.regionId);
    if (await this.existReportByDate(data)) {
      await this.updateSearchesFromTable({
        searches: jsonDocument[0],
        year: data.year,
        month: data.month,
        regionId: data.regionId
      });
    } else {
      let withPrevious = await this.createMonthFromTable({
        year: data.year,
        month: data.month,
        regionId: data.regionId
      });
      if (!withPrevious) {
        await this.createNewSearchesFromTable({
          searches: jsonDocument[0],
          year: data.year,
          month: data.month,
          regionId: data.regionId
        });
      } else {
        await this.updateSearchesFromTable({
          searches: jsonDocument[0],
          year: data.year,
          month: data.month,
          regionId: data.regionId
        });
      }
    }
    await this.calculateReport({data: data});
    return await this.returnHandler({
      model: 'review',
      data: {success: true}
    });
  }

  private async mapByWeek(productMap, weekNumber, searches) {
    if (weekNumber > 0 && searches.length) {
      let previousSearch = [];
      if (!productMap.has(weekNumber)) productMap.set(weekNumber, new Map());
      for (let i = 0; i < searches.length; i++) {
        productMap.get(weekNumber).set(searches[i].code, {
          changed: searches[i].changed,
          especOne: searches[i].especOne,
          especTwo: searches[i].especTwo,
          price: searches[i].price,
          id: searches[i].id,
        });
        if (searches[i].previousSearch) previousSearch.push(searches[i].previousSearch);
        await this.mapByWeek(productMap, weekNumber - 1, previousSearch);
      }
    }
  }

  private async getMapExistingSearch(data) {
    let lines = await this.getSearchesInLIne({
      year: data.year,
      month: data.month,
      region: data.regionId
    });
    let mapToReturn = new Map();
    if (!lines.success) {
      console.error('deu ruim aqui', lines.data);
    }
    let promises = [];
    for (let i = 0; i < lines.data.length; i++) {
      if (!mapToReturn.has(lines.data[i].product.code)) mapToReturn.set(lines.data[i].product.code, new Map());
      if (lines.data[i].searches.length) {
        promises.push(this.mapByWeek(mapToReturn.get(lines.data[i].product.code), lines.data[i].searchNumber, lines.data[i].searches));
      }
    }
    await Promise.all(promises);
    return mapToReturn;
  }

  private async adjustSource(sources) {
    for (let value of sources.values()) {
      let productsSet = new Set();
      for (let i = 0; i < value.products.length; i++) {
        productsSet.add(value.products[i].id);
      }
      value.products = productsSet;
    }
  }

  private async adjustProductSearch(productSearches) {
    for (let value of productSearches.values()) {
      let searchesMap = new Set();
      if (value.searches && value.searches.length) {
        for (let i = 0; i < value.searches.length; i++) {
          searchesMap.add(value.searches[i].toString());
        }
      }
      value.searches = searchesMap;
    }
  }

  verifyInUse(base, productSearchesByWeek, loop, productSearches) {
    for (let key of loop.keys()) {
      if (!productSearchesByWeek.get(Number(key))) {
        console.log('deu ruim aqui');
      }
      let search = productSearchesByWeek.get(Number(key)).get(base.code);
      if (!search) {
        console.log(base);
      }
      if (productSearches.has(search.id)) {
        base.inUse = true;
        return;
      }
    }
  }

  private async updateSearchesFromTable(data) {
    let mapsToSearch = await this.getReqsToSearchMap({
      year: data.year,
      month: data.month,
      regionId: data.regionId
    });
    let keys = this.getTableKeys(data.searches[0]);
    let monthSearches = [];
    let mapExistingSearch = await this.getMapExistingSearch(data);
    let updates = [];
    let sourcesToUpdate = new Map();
    await Promise.all([
      this.adjustSource(mapsToSearch.get('sources')),
      this.adjustProductSearch(mapsToSearch.get('products'))
    ]);
    for (let i = 1; i < data.searches.length; i++) {
      let productSearch = mapsToSearch.get('products').get(data.searches[i][keys.get('productCode')]);
      // let teste;
      // if(data.searches[i].A === "2420111"){
      //   teste = data.searches[i];
      //   console.log('aquiii');
      // }
      let source = mapsToSearch.get('sources').get(data.searches[i][keys.get('source')]);
      let researcher = mapsToSearch.get('users').get(data.searches[i][keys.get('research')]);
      if (!source) {
        let wrongSearch = data.searches[i];
        console.error('errou', wrongSearch);
      }
      if (!productSearch) {
        console.log('quem é o errado');
      }
      if (!source.products.has(productSearch.product.id)) {
        source.products.add(productSearch.product.id);
        sourcesToUpdate.set(source.name, source);
      }
      let baseToSearch = {
        user: researcher.id,
        product: productSearch.product.id,
        source: source.id,
        code: data.searches[i][keys.get('searchCode')],
        especOne: data.searches[i][keys.get('especOne')],
        especTwo: data.searches[i][keys.get('especTwo')],
        status: 'Closed',
        previousSearch: null,
        inUse: false,
        newSearch: false,
      };
      this.verifyInUse(baseToSearch, mapExistingSearch.get(productSearch.product.code), keys.get('searches'), productSearch.searches);
      let id;
      for (let [key, value] of keys.get('searches').entries()) {
        if (data.searches[i][value.mudouEspec]) {
          if (mapExistingSearch.has(productSearch.product.code) &&
            mapExistingSearch.get(productSearch.product.code).has(Number(key)) &&
            mapExistingSearch.get(productSearch.product.code).get(Number(key)).has(baseToSearch.code)) {
            let search = mapExistingSearch.get(productSearch.product.code).get(Number(key)).get(baseToSearch.code);
            id = search.id;
            let price = data.searches[i][value.valor] ? Number(data.searches[i][value.valor]) : 0;
            let update: any = {
              status: "Closed",
              changed: data.searches[i][value.mudouEspec] === 'S',
              especOne: baseToSearch.especOne,
              especTwo: baseToSearch.especTwo,
              price: price,
            };
            updates.push(new UpdateObject(
              search.id,
              update,
            ));
          } else {
            let _id = new Types.ObjectId();
            id = _id.toString();
            baseToSearch.newSearch = true;
            monthSearches.push({
              _id: _id,
              id: id,
              user: baseToSearch.user,
              product: baseToSearch.product,
              source: baseToSearch.source,
              code: baseToSearch.code,
              especOne: baseToSearch.especOne,
              especTwo: baseToSearch.especTwo,
              status: baseToSearch.status,
              previousSearch: baseToSearch.previousSearch,
              price: Number(data.searches[i][value.valor]),
              changed: data.searches[i][value.mudouEspec] === 'S',
            });
          }
          if (!productSearch.searches.has(id)) {
            if (baseToSearch.inUse && productSearch.searches.has(baseToSearch.previousSearch)) {
              productSearch.searches.delete(baseToSearch.previousSearch);
              productSearch.searches.add(id);
            } else if (baseToSearch.newSearch && !baseToSearch.previousSearch) {
              productSearch.searches.add(id);
            }
          }
          baseToSearch.previousSearch = id;
          if (productSearch.searchNumber < Number(key)) productSearch.searchNumber = Number(key);
        }
      }
    }
    let promises = [];
    if (sourcesToUpdate.size > 0) {
      promises.push(this.updateSourcesFromTable(sourcesToUpdate));
    }
    if (monthSearches.length > 0) {
      promises.push(this.emit_to_server('db.search.createFromTable', monthSearches));
    }
    for (let value of mapsToSearch.get('products').values()) {
      let searches = [];
      for (let searchId of value.searches.values()) {
        searches.push(new Types.ObjectId(searchId));
      }
      promises.push(this.emit_to_server('db.productsearch.update', new UpdateObject(
        value.id,
        {
          searches: searches,
          searchNumber: value.searchNumber,
        }
      )))
    }
    let promisesRet = await Promise.all(promises);
    for (let i = 0; i < promisesRet.length; i++) {
      if (promisesRet[i].error) {
        let promiseError = promisesRet[i];
        console.log('erro aqui');
      }
    }
    await this.executePromises(updates, 0);
    return true;
  }

  private async executePromises(updates, index) {
    let limit = 999;
    let promisesToExecute = [];
    let count = 0;
    while (count <= limit && count + index < updates.length) {
      promisesToExecute.push(this.emit_to_server('db.search.update', updates[index + count]));
      count++;
    }
    let teste = await Promise.all(promisesToExecute);
    if (updates.length > index + count) {
      await this.executePromises(updates, index + count);
    }
  }

  private async createNewSearchesFromTable(data) {
    let mapsToSearch = await this.getReqsToSearchMap({
      year: data.year,
      month: data.month,
      regionId: data.regionId
    });
    let keys = this.getTableKeys(data.searches[0]);
    let monthSearches = [];
    for (let i = 1; i < data.searches.length; i++) {
      let productSearch = mapsToSearch.get('products').get(data.searches[i][keys.get('productCode')]);
      if (!productSearch) {
        console.log('deu ruim aqui');
      }
      if (!productSearch.searches) productSearch.searches = [];
      let source = mapsToSearch.get('sources').get(data.searches[i][keys.get('source')]);
      let researcher = mapsToSearch.get('users').get(data.searches[i][keys.get('research')]);
      if (!source) {
        let wrongSearch = data.searches[i];
        console.error('errou', wrongSearch);
      }
      if (!source.products || !source.products.size) source.products = new Set();
      source.products.add(productSearch.product.id);
      let baseToSearch = {
        user: researcher.id,
        product: productSearch.product.id,
        source: source.id,
        code: data.searches[i][keys.get('searchCode')],
        especOne: data.searches[i][keys.get('especOne')],
        especTwo: data.searches[i][keys.get('especTwo')],
        status: 'Closed',
        previousSearch: null,
      };
      let id;
      for (let [key, value] of keys.get('searches').entries()) {
        if (data.searches[i][value.valor] && data.searches[i][value.mudouEspec]) {
          let _id = new Types.ObjectId();
          id = _id.toString();
          monthSearches.push({
            _id: _id,
            id: id,
            user: baseToSearch.user,
            product: baseToSearch.product,
            source: baseToSearch.source,
            code: baseToSearch.code,
            especOne: baseToSearch.especOne,
            especTwo: baseToSearch.especTwo,
            status: baseToSearch.status,
            previousSearch: baseToSearch.previousSearch,
            price: Number(data.searches[i][value.valor]),
            changed: data.searches[i][value.mudouEspec] === 'S',
          });
          baseToSearch.previousSearch = id;
          if (productSearch.searchNumber < Number(key)) productSearch.searchNumber = Number(key);
        }
      }
      if (id) {
        productSearch.searches.push(id);
      }
    }
    await Promise.all([
      this.emit_to_server('db.search.createFromTable', monthSearches),
      this.updateProductSearchFromTable(mapsToSearch.get("products")),
      this.updateSourcesFromTable(mapsToSearch.get('sources'))
    ]);
    return true;
  }

  private async updateSourcesFromTable(sourcesMap) {
    let sourcePromises = [];
    for (let source of sourcesMap.values()) {
      let products = [];
      for (let productId of source.products.values()) {
        products.push(productId);
      }
      sourcePromises.push(this.emit_to_server('db.source.update', new UpdateObject(
        source.id,
        {
          $push: {
            products: {
              $each: products,
            }
          }
        }
      )))
    }
    if (sourcePromises.length) {
      let sourceUpdateResult = await Promise.all(sourcePromises);
      for (let i = 0; i < sourceUpdateResult.length; i++) {
        if (sourceUpdateResult[i].data.error) console.error('deu ruim na fonte', i);
      }
    }
  }

  private async updateProductSearchFromTable(productSearchesMap) {
    let productSearchPromise = [];
    for (let productSearch of productSearchesMap.values()) {
      if (productSearch.searches.length) {
        productSearchPromise.push(this.emit_to_server('db.productsearch.update', new UpdateObject(
          productSearch.id,
          {
            searchNumber: productSearch.searchNumber,
            $push: {
              searches: {
                $each: productSearch.searches
              }
            }
          }
        )))
      }
    }
    let productSearchUpdateResult = await Promise.all(productSearchPromise);
    for (let i = 0; i < productSearchUpdateResult.length; i++) {
      if (productSearchUpdateResult[i].data.error) console.error('deu ruim aqui', i);
    }
  }

  private getTableKeys(line) {
    let ret = new Map();
    ret.set('searches', new Map());
    for (let key in line) {
      if (line.hasOwnProperty(key)) {
        switch (line[key]) {
          case 'Codigo produto':
            ret.set('productCode', key);
            break;
          case 'Produto ou servico':
            ret.set('productName', key);
            break;
          case 'Especificacao 1':
            ret.set('especOne', key);
            break;
          case 'Especificacao 2':
            ret.set('especTwo', key);
            break;
          case 'Pesquisador':
            ret.set('research', key);
            break;
          case 'Fonte':
            ret.set('source', key);
            break;
          case 'Codigo pesquisa':
            ret.set('searchCode', key);
            break;
          default:
            let searchNumber = line[key].slice(line[key].indexOf(' ') + 1, line[key].lastIndexOf(' '));
            if (!ret.get('searches').has(searchNumber)) ret.get('searches').set(searchNumber, {});
            ret.get('searches').get(searchNumber)[line[key].slice(line[key].lastIndexOf(' ') + 1)] = key;
        }
      }
    }
    return ret;
  }

  private async getReqsToSearchMap(data) {
    let reqToSearch = await Promise.all([
      this.emit_to_server('db.review.read', new QueryObject(
        {
          year: data.year,
          month: data.month,
          region: data.regionId,
        },
        'searches',
        {
          path: 'searches',
          select: 'product searchNumber searches',
          populate: {
            path: 'product',
            select: 'code'
          }
        }
      )),
      this.emit_to_server('db.user.read', new QueryObject(
        {
          removed: false,
        },
        'name surname email'
      )),
      this.emit_to_server('db.region.read', new QueryObject(
        data.regionId,
        'sources',
        {
          path: 'sources',
          select: 'name code products',
          populate: [
            {
              path: "products",
              select: "id",
            }
          ],
        }
      ))
    ]);
    let mapRet = new Map();
    mapRet.set('products', new Map());
    mapRet.set('users', new Map());
    mapRet.set('sources', new Map());
    for (let i = 0; i < reqToSearch[0].data.success[0].searches.length; i++) {
      mapRet.get('products').set(reqToSearch[0].data.success[0].searches[i].product.code, reqToSearch[0].data.success[0].searches[i]);
    }
    for (let i = 0; i < reqToSearch[1].data.success.length; i++) {
      mapRet.get('users').set(`${reqToSearch[1].data.success[i].name} ${reqToSearch[1].data.success[i].surname}`, reqToSearch[1].data.success[i]);
    }
    for (let i = 0; i < reqToSearch[2].data.success.sources.length; i++) {
      mapRet.get('sources').set(reqToSearch[2].data.success.sources[i].name, reqToSearch[2].data.success.sources[i]);
    }
    return mapRet;
  }

  private async createMonthFromTable(data) {
    let previousDate = this.getPreviousDate({
      month: data.month,
      year: data.year
    });
    let previousReport = await this.emit_to_server('db.report.count', {
        region: data.regionId,
        month: previousDate.month,
        year: previousDate.year,
      }
    );
    if (!previousReport.data.success) {
      await this.openNewMonthDiscardPrevious({
        data: {
          regionId: data.regionId,
          year: data.year,
          month: data.month
        }
      });
      return false;
    }
    await this.openNewMonth({data:{regionId: data.regionId}});
    return true;
  }

  private async sourceCreateFromTable(newSearch, newSources, regionId) {
    //todo: fazer o tratamento de erros.
    let sourcesMap = new Map();
    let addressMap = new Map();
    addressMap.set('stateInitial', new Set());
    addressMap.set('cityName', new Set());
    addressMap.set('neighborhoodName', new Set());
    for (let i = 1; i < newSources.length; i++) {
      if (sourcesMap.has(newSources[i].A)) {
        let name = newSources[i].A;
        console.log('quem repete');
      }
      addressMap.get('stateInitial').add(newSources[i].H);
      addressMap.get('cityName').add(newSources[i].G);
      addressMap.get('neighborhoodName').add(newSources[i].F);
      sourcesMap.set(newSources[i].A, {
        name: newSources[i].A,
        code: newSources[i].B,
        researchers: new Set(),
        address: {
          state: newSources[i].H,
          city: newSources[i].G,
          neighborhood: newSources[i].F,
          street: newSources[i].D,
          postalCode: newSources[i].C,
          number: newSources[i].E,
        }
      });
    }
    let addressFromBD = await this.getAddressMap(addressMap);
    let keys = this.getTableKeys(newSearch[0]);
    for (let i = 1; i < newSearch.length; i++) {
      if (!sourcesMap.has(newSearch[i][keys.get('source')])) {
        console.log('not found', newSearch[i][keys.get('source')]);
      }
      let source = sourcesMap.get(newSearch[i][keys.get('source')]);
      source.researchers.add(newSearch[i][keys.get('research')]);
    }
    let researches = await this.readAllResearchers();
    if (!researches.success) return console.error('não conseguiu ler os pesquisadores');
    let researchesMap = new Map();
    for (let i = 0; i < researches.data.length; i++) {
      researchesMap.set(`${researches.data[i].name} ${researches.data[i].surname}`, researches.data[i]);
    }
    let sourcesToSave = [];
    for (let source of sourcesMap.values()) {
      let researcherArray = [];
      for (let researcher of source.researchers.values()) {
        if (!researchesMap.has(researcher)) {
          let quem = researcher;
          console.error('não deu match');
        }
        researcherArray.push(researchesMap.get(researcher).id);
      }
      source.researchers = researcherArray;
      source.address.state = addressFromBD.get('stateInitial').get(source.address.state).id;
      source.address.city = addressFromBD.get('cityName').get(source.address.city).id;
      source.address.neighborhood = addressFromBD.get('neighborhoodName').get(source.address.neighborhood).id;
      sourcesToSave.push(source);
    }
    let savedSources = await this.emit_to_server('db.source.create', sourcesToSave);
    let savedSourcesId = [];
    for (let i = 0; i < savedSources.data.success.length; i++) {
      savedSourcesId.push(savedSources.data.success[i].id);
    }
    let region = await this.emit_to_server('db.region.update', new UpdateObject(
      regionId,
      {
        $push: {
          sources: {
            $each: savedSourcesId,
          }
        }
      }
    ));
    return savedSources;
  }

  private async getAddressMap(addressMap) {
    let rets = await Promise.all([
      this.getStates(addressMap.get('stateInitial')),
      this.getCities(addressMap.get('cityName')),
      this.getNeighborhood(addressMap.get('neighborhoodName')),
    ]);
    let ret = new Map();
    ret.set('stateInitial', rets[0]);
    ret.set('cityName', rets[1]);
    ret.set('neighborhoodName', rets[2]);
    return ret;
  }

  private async getStates(setState) {
    let statesPromises = [];
    for (let state of setState.values()) statesPromises.push(this.getStateIdByInitial(state));
    let promiseRet = await Promise.all(statesPromises);
    let ret = new Map();
    for (let success of promiseRet) {
      for (let state of success.data) ret.set(state.initial, state);
    }
    return ret;
  }

  private async getCities(setCity) {
    let cityPromises = [];
    for (let city of setCity) cityPromises.push(this.getCityIdByName(city));
    let promiseRet = await Promise.all(cityPromises);
    let ret = new Map();
    for (let success of promiseRet) {
      for (let city of success.data) ret.set(city.name, city);
    }
    return ret;
  }

  private async getNeighborhood(setNeighborhood) {
    let neighborhoodPromises = [];
    for (let neighborhood of setNeighborhood) neighborhoodPromises.push(this.getNeighborhoodIdByName(neighborhood));
    let promiseRet = await Promise.all(neighborhoodPromises);
    let ret = new Map();
    for (let success of promiseRet) {
      for (let neighborhood of success.data) ret.set(neighborhood.name, neighborhood);
    }
    return ret;
  }

  private async researcherCreateFromTable(newResearches) {
    let data = [];
    for (let i = 1; i < newResearches.length; i++) {
      data.push({
        name: newResearches[i].A,
        surname: newResearches[i].B,
        email: newResearches[i].C,
        password: newResearches[i].D,
        phoneNumber: newResearches[i].E,
      })
    }
    return await this.researcherCreate({data: data});
  }

  private async verifyRegionHasBasket(regionId: string) {
    let ret = await this.emit_to_server('db.productbasket.read', new QueryObject(
      {
        region: regionId,
      },
      'id'
    ));
    return !!ret.data.success.length;
  }

  private async isAdmin(_id){
      const ret = await this.emit_to_server('db.user.read', new QueryObject(
        {
          _id
        },
        'type'
      ));
      return ret;
  }

}

export default new AdminHandler();