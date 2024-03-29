import {TestManager} from '../TestManager';

const chai = require("chai");
const chaihttp = require("chai-http");
chai.use(chaihttp);
let expect = chai.expect;
let io = require("socket.io-client");
let socketUrl = "http://localhost:8081";
let testManager = null;

describe("Teste AdminRTC", () => {
  before(function (done) {
    testManager = new TestManager(done);
  });

  let cliente = null;
  let usuario = null;
  let regions = null;
  let address = null;
  let sources = null;
  let pesquisadores = null;
  let addressToEdit = null;
  let productsId = [];
  let searches = null;
  let productbaskets = null;

  it("CONNECT", (done) => {
    cliente = io(socketUrl);
    cliente.on("connect", (data) => {
      done();
    });
    cliente.connect();
  });

  describe('LOGIN', () => {

    it('Email errado', (done) => {
      let retorno = (msg) => {
        expect(msg.datas.success).to.be.false;
        expect(msg.datas.data).to.be.instanceOf(Object);
        expect(msg.datas.data).to.have.all.keys('buttons', 'description', 'title', 'type');
        cliente.removeListener('retorno', retorno);
        done();
      };
      cliente.on('retorno', retorno);
      let user = {
        email: 'admin@administrativo',
        password: 'admin'
      };
      cliente.emit('logar', {datas: user});
    });

    it('Senha errada', (done) => {
      let retorno = (msg) => {
        expect(msg.datas.success).to.be.false;
        expect(msg.datas.data).to.be.instanceOf(Object);
        expect(msg.datas.data).to.have.all.keys('buttons', 'description', 'title', 'type');
        cliente.removeListener('retorno', retorno);
        done();
      };
      cliente.on('retorno', retorno);
      let user = {
        email: 'admin@admin',
        password: 'administrativo'
      };
      cliente.emit('logar', {datas: user});
    });

    it("Admin Login", (done) => {
      let retorno = function (msg) {
        expect(msg.datas.success).to.be.true;
        expect(msg.datas.data).to.be.instanceOf(Object);
        expect(msg.datas.data).to.have.all.keys("email", "id", "name", "phoneNumber", "surname", "type");
        usuario = msg.datas.data;
        cliente.removeListener("retorno", retorno);
        done();
      };
      cliente.on("retorno", retorno);
      let user = {
        email: "admin@admin",
        password: "admin",
      };
      cliente.emit("logar", {datas: user});
    });

  });

  describe('ENDERECO', () => {

    it('buscar endereço pelo CEP', (done) => {
      let retorno = (msg) => {
        expect(msg.datas).to.be.instanceOf(Object);
        expect(msg.datas).to.have.all.keys("success", "data");
        expect(msg.datas.success).to.be.true;
        expect(msg.datas.data).to.be.instanceOf(Object);
        expect(msg.datas.data).to.have.all.keys("cep", "logradouro", "complemento", "bairro", "localidade", "uf", "unidade", "ibge", "gia");
        address = msg.datas.data;
        cliente.removeListener("retorno", retorno);
        done();
      };
      cliente.on('retorno', retorno);
      let data = {
        zipCode: "88080350",
      };
      cliente.emit('address_by_zipCode', {datas: data});
    });

    it('buscar endereço pelo CEP', (done) => {
      let retorno = (msg) => {
        expect(msg.datas).to.be.instanceOf(Object);
        expect(msg.datas).to.have.all.keys("success", "data");
        expect(msg.datas.success).to.be.true;
        expect(msg.datas.data).to.be.instanceOf(Object);
        expect(msg.datas.data).to.have.all.keys("cep", "logradouro", "complemento", "bairro", "localidade", "uf", "unidade", "ibge", "gia");
        addressToEdit = msg.datas.data;
        cliente.removeListener("retorno", retorno);
        done();
      };
      cliente.on('retorno', retorno);
      let data = {
        zipCode: "88130300",
      };
      cliente.emit('address_by_zipCode', {datas: data});
    });

  });

  describe('REGIAO', () => {

    describe('criar', () => {

      it('Sem nome', (done) => {
        let retorno = (msg) => {
          expect(msg.datas).to.be.instanceOf(Object);
          expect(msg.datas).to.have.all.keys("success", "data");
          expect(msg.datas.success).to.be.false;
          expect(msg.datas.data).to.be.instanceOf(Array);
          msg.datas.data.forEach(error => {
            expect(error).to.be.instanceOf(Object);
            expect(error).to.have.all.keys("title", "description", "buttons", "type");
            expect(error.buttons).to.be.instanceOf(Array);
            error.buttons.forEach(button => {
              expect(button).to.be.instanceOf(Object);
              expect(button).to.have.all.keys("label", "method");
            });
          });
          cliente.removeListener("retorno", retorno);
          done();
        };
        cliente.on('retorno', retorno);
        let data = {};
        cliente.emit('region_create', {datas: data});
      });

      it('ok', (done) => {
        let retorno = (msg) => {
          expect(msg.datas).to.be.instanceOf(Object);
          expect(msg.datas).to.have.all.keys("success", "data");
          expect(msg.datas.success).to.be.true;
          expect(msg.datas.data).to.be.instanceOf(Array);
          msg.datas.data.forEach(region => {
            expect(region).to.be.instanceOf(Object);
            expect(region).to.have.all.keys("updatedAt", "createdAt", "name", "id", "removed", "canUsePublicSearches", "publicSearches", "sources");
          });
          regions = msg.datas.data;
          cliente.removeListener("retorno", retorno);
          done();
        };
        cliente.on('retorno', retorno);
        let data = {
          name: 'Grande Florianópolis',
          publicSearches: true,
          canUsePublicSearches: true,
        };
        cliente.emit('region_create', {datas: data});
      });

    });

    describe('editar', () => {

      it('ok', (done) => {
        let retorno = (msg) => {
          expect(msg.datas).to.be.instanceOf(Object);
          expect(msg.datas).to.have.all.keys("success", "data");
          expect(msg.datas.success).to.be.true;
          expect(msg.datas.data).to.be.instanceOf(Array);
          msg.datas.data.forEach(region => {
            expect(region).to.be.instanceOf(Object);
            expect(region).to.have.all.keys("name", "id");
          });
          regions[0] = msg.datas.data[0];
          cliente.removeListener("retorno", retorno);
          done();
        };
        cliente.on('retorno', retorno);
        let data = {
          id: regions[0].id,
          update: {
            name: 'Floripa leste',
          }
        };
        cliente.emit('region_update', {datas: data});
      });

    });

    describe('CESTA DE PRODUTO', () => {

      describe('create', () => {

        it('importa XLSX', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.true;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(data => {
              expect(data).to.be.instanceof(Object);
              expect(data).to.have.all.keys("region", "id", "basket");
              expect(data.basket).to.be.instanceof(Array);
              data.basket.forEach(basketProduct => {
                expect(basketProduct).to.be.instanceof(Object);
                expect(basketProduct).to.have.all.keys("product", "baseWeight");
                expect(basketProduct.product).to.be.instanceof(Object);
                expect(basketProduct.product).to.have.all.keys("_id", "name", "code", "id");
                productsId.push(basketProduct.product.id);
              });
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            "regionId": regions[0].id,
            "document": "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"
            ,
          };
          cliente.emit('import_basket', {datas: data});
        });

      });

    });

    describe('FONTE', () => {

      describe('criar', () => {

        it('sem nome', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.false;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(fonteError => {
              expect(fonteError).to.be.instanceOf(Object);
              expect(fonteError).to.have.all.keys("title", "description", "buttons", "type");
              expect(fonteError.buttons).to.be.instanceOf(Array);
              fonteError.buttons.forEach(button => {
                expect(button).to.be.instanceOf(Object);
                expect(button).to.have.all.keys("label", "method");
              });
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            regionId: regions[0].id,
            source: {
              name: "",
              products: [],
              code: "123dz",
              researchers: [usuario.id],
              address: {
                state: address.uf,
                city: address.localidade,
                neighborhood: address.bairro,
                street: address.logradouro,
                postalCode: address.cep,
                number: 179,
              }
            }
          };
          cliente.emit('source_create', {datas: data});
        });

        it('sem codigo', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.false;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(fonteError => {
              expect(fonteError).to.be.instanceOf(Object);
              expect(fonteError).to.have.all.keys("title", "description", "buttons", "type");
              expect(fonteError.buttons).to.be.instanceOf(Array);
              fonteError.buttons.forEach(button => {
                expect(button).to.be.instanceOf(Object);
                expect(button).to.have.all.keys("label", "method");
              });
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            regionId: regions[0].id,
            source: {
              name: "Hippo",
              products: [],
              researchers: [usuario.id],
              address: {
                state: address.uf,
                city: address.localidade,
                neighborhood: address.bairro,
                street: address.logradouro,
                postalCode: address.cep,
                number: 179,
              }
            }
          };
          cliente.emit('source_create', {datas: data});
        });

        it('sem pesquisador', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.false;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(fonteError => {
              expect(fonteError).to.be.instanceOf(Object);
              expect(fonteError).to.have.all.keys("title", "description", "buttons", "type");
              expect(fonteError.buttons).to.be.instanceOf(Array);
              fonteError.buttons.forEach(button => {
                expect(button).to.be.instanceOf(Object);
                expect(button).to.have.all.keys("label", "method");
              });
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            regionId: regions[0].id,
            source: {
              name: "Hippo",
              products: [],
              code: "123dz",
              researchers: [],
              address: {
                state: address.uf,
                city: address.localidade,
                neighborhood: address.bairro,
                street: address.logradouro,
                postalCode: address.cep,
                number: 179,
              }
            }
          };
          cliente.emit('source_create', {datas: data});
        });

        it('sem estado', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.false;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(fonteError => {
              expect(fonteError).to.be.instanceOf(Object);
              expect(fonteError).to.have.all.keys("title", "description", "buttons", "type");
              expect(fonteError.buttons).to.be.instanceOf(Array);
              fonteError.buttons.forEach(button => {
                expect(button).to.be.instanceOf(Object);
                expect(button).to.have.all.keys("label", "method");
              });
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            regionId: regions[0].id,
            source: {
              name: "Hippo",
              products: [],
              code: "123dz",
              researchers: [usuario.id],
              address: {
                city: address.localidade,
                neighborhood: address.bairro,
                street: address.logradouro,
                postalCode: address.cep,
                number: 179,
              }
            }
          };
          cliente.emit('source_create', {datas: data});
        });

        it('sem cidade', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.false;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(fonteError => {
              expect(fonteError).to.be.instanceOf(Object);
              expect(fonteError).to.have.all.keys("title", "description", "buttons", "type");
              expect(fonteError.buttons).to.be.instanceOf(Array);
              fonteError.buttons.forEach(button => {
                expect(button).to.be.instanceOf(Object);
                expect(button).to.have.all.keys("label", "method");
              });
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            regionId: regions[0].id,
            source: {
              name: "Hippo",
              products: [],
              code: "123dz",
              researchers: [usuario.id],
              address: {
                state: address.uf,
                city: '',
                neighborhood: address.bairro,
                street: address.logradouro,
                postalCode: address.cep,
                number: 179,
              }
            }
          };
          cliente.emit('source_create', {datas: data});
        });

        it('sem bairro', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.false;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(fonteError => {
              expect(fonteError).to.be.instanceOf(Object);
              expect(fonteError).to.have.all.keys("title", "description", "buttons", "type");
              expect(fonteError.buttons).to.be.instanceOf(Array);
              fonteError.buttons.forEach(button => {
                expect(button).to.be.instanceOf(Object);
                expect(button).to.have.all.keys("label", "method");
              });
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            regionId: regions[0].id,
            source: {
              name: "Hippo",
              products: [],
              code: "123dz",
              researchers: [usuario.id],
              address: {
                state: address.uf,
                city: address.localidade,
                neighborhood: null,
                street: address.logradouro,
                postalCode: address.cep,
                number: 179,
              }
            }
          };
          cliente.emit('source_create', {datas: data});
        });

        it('sem rua', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.false;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(fonteError => {
              expect(fonteError).to.be.instanceOf(Object);
              expect(fonteError).to.have.all.keys("title", "description", "buttons", "type");
              expect(fonteError.buttons).to.be.instanceOf(Array);
              fonteError.buttons.forEach(button => {
                expect(button).to.be.instanceOf(Object);
                expect(button).to.have.all.keys("label", "method");
              });
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            regionId: regions[0].id,
            source: {
              name: "Hippo",
              products: [],
              code: "123dz",
              researchers: [usuario.id],
              address: {
                state: address.uf,
                city: address.localidade,
                neighborhood: address.bairro,
                street: null,
                postalCode: address.cep,
                number: 179,
              }
            }
          };
          cliente.emit('source_create', {datas: data});
        });

        it('sem cep', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.false;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(fonteError => {
              expect(fonteError).to.be.instanceOf(Object);
              expect(fonteError).to.have.all.keys("title", "description", "buttons", "type");
              expect(fonteError.buttons).to.be.instanceOf(Array);
              fonteError.buttons.forEach(button => {
                expect(button).to.be.instanceOf(Object);
                expect(button).to.have.all.keys("label", "method");
              });
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            regionId: regions[0].id,
            source: {
              name: "Hippo",
              products: [],
              code: "123dz",
              researchers: [usuario.id],
              address: {
                state: address.uf,
                city: address.localidade,
                neighborhood: address.bairro,
                street: address.logradouro,
                number: 179,
              }
            }
          };
          cliente.emit('source_create', {datas: data});
        });

        it('sem nome e sem code', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.false;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(fonteError => {
              expect(fonteError).to.be.instanceOf(Object);
              expect(fonteError).to.have.all.keys("title", "description", "buttons", "type");
              expect(fonteError.buttons).to.be.instanceOf(Array);
              fonteError.buttons.forEach(button => {
                expect(button).to.be.instanceOf(Object);
                expect(button).to.have.all.keys("label", "method");
              });
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            regionId: regions[0].id,
            source: {
              products: [],
              code: "",
              researchers: [usuario.id],
              address: {
                state: address.uf,
                city: address.localidade,
                neighborhood: address.bairro,
                street: address.logradouro,
                postalCode: address.cep,
                number: 179,
              }
            }
          };
          cliente.emit('source_create', {datas: data});
        });

        it('sem code e sem rua', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.false;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(fonteError => {
              expect(fonteError).to.be.instanceOf(Object);
              expect(fonteError).to.have.all.keys("title", "description", "buttons", "type");
              expect(fonteError.buttons).to.be.instanceOf(Array);
              fonteError.buttons.forEach(button => {
                expect(button).to.be.instanceOf(Object);
                expect(button).to.have.all.keys("label", "method");
              });
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            regionId: regions[0].id,
            source: {
              name: "Hippo",
              products: [],
              researchers: [usuario.id],
              address: {
                state: address.uf,
                city: address.localidade,
                neighborhood: address.bairro,
                street: null,
                postalCode: address.cep,
                number: 179,
              }
            }
          };
          cliente.emit('source_create', {datas: data});
        });

        it('ok', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.true;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(font => {
              expect(font).to.be.instanceOf(Object);
              expect(font).to.have.all.keys("updatedAt", "createdAt", "name", "code", "address", "id", "removed", "researchers", "products");
              expect(font.address).to.be.instanceOf(Object);
              expect(font.address).to.have.all.keys("state", "city", "neighborhood", "street", "postalCode", "number", "id");
              expect(font.products).to.be.instanceOf(Array);
              expect(font.researchers).to.be.instanceOf(Array);
            });
            sources = msg.datas.data;
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            regionId: regions[0].id,
            source: {
              name: "Hippo",
              products: [],
              code: "123dz",
              researchers: [usuario.id],
              address: {
                state: address.uf,
                city: address.localidade,
                neighborhood: address.bairro,
                street: address.logradouro,
                postalCode: address.cep,
                number: 179,
              }
            }
          };
          cliente.emit('source_create', {datas: data});
        });

      });

      describe('editar', () => {

        it('ok', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.true;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(font => {
              expect(font).to.be.instanceOf(Object);
              expect(font).to.have.all.keys("name", "code", "address", "id", "researchers", "products");
              expect(font.address).to.be.instanceof(Object);
              expect(font.address).to.have.all.keys("state", "city", "neighborhood", "street", "postalCode", "number");
              expect(font.address.city).to.be.instanceof(Object);
              expect(font.address.city).to.have.all.keys("_id", "name", "id");
              expect(font.address.neighborhood).to.be.instanceof(Object);
              expect(font.address.neighborhood).to.have.all.keys("_id", "name", "id");
              expect(font.address.state).to.be.instanceof(Object);
              expect(font.address.state).to.have.all.keys("_id", "initial", "id", "name");
              expect(font.products).to.be.instanceof(Array);
              expect(font.researchers).to.be.instanceof(Array);
              font.researchers.forEach(researcher => {
                expect(researcher).to.be.instanceof(Object);
                expect(researcher).to.have.all.keys("_id", "name", "surname", "email", "id", "type");
              });
            });
            sources[0] = msg.datas.data[0];
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            id: sources[0].id,
            update: {
              name: "Rosa",
              products: [],
              code: "123dz",
              researchers: [usuario.id],
              address: {
                neighborhood: addressToEdit.bairro,
                street: addressToEdit.logradouro,
                postalCode: addressToEdit.cep,
                number: 199,
              }
            }
          };
          cliente.emit('source_update', {datas: data});
        });

      });

      describe('ASSOCIAR PRODUTOS A FONTE', () => {

        it('ler product basket', (done) => {
          let retorno = (msg) => {
            expect(msg.datas.success).to.be.true;
            expect(msg.datas.data).to.be.instanceOf(Array);
            expect(msg.datas.data[0]).to.be.instanceOf(Object);
            expect(msg.datas.data[0].basket).to.be.instanceOf(Array);
            expect(msg.datas.data[0].basket.length).to.be.greaterThan(0);
            expect(msg.datas.data[0]).to.include.all.keys('basket', 'id', 'region');
            expect(msg.datas.data[0].basket[0]).to.include.all.keys('baseWeight', 'product');
            productbaskets = msg.datas.data[0];

            cliente.removeListener('retorno', retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            regionId: regions[0].id
          };
          cliente.emit('read_product_basket', {datas: data});
        });

        it('sem id da fonte', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.false;
            expect(msg.datas.data).to.be.instanceOf(Object);
            expect(msg.datas.data).to.have.all.keys("title", "description", "buttons", "type");
            expect(msg.datas.data.buttons).to.be.instanceOf(Array);
            msg.datas.data.buttons.forEach(button => {
              expect(button).to.be.instanceOf(Object);
              expect(button).to.have.all.keys("label", "method");
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            sourceId: '',
            productsId: [],
          };
          for (let i = 0; i < 90; i++) {
            data.productsId.push(productsId[i]);
          }
          cliente.emit('connect_products_source', {datas: data});
        });

        it('sem produto', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.false;
            expect(msg.datas.data).to.be.instanceOf(Object);
            expect(msg.datas.data).to.have.all.keys("title", "description", "buttons", "type");
            expect(msg.datas.data.buttons).to.be.instanceOf(Array);
            msg.datas.data.buttons.forEach(button => {
              expect(button).to.be.instanceOf(Object);
              expect(button).to.have.all.keys("label", "method");
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            sourceId: sources[0].id,
            productsId: null,
          };
          cliente.emit('connect_products_source', {datas: data});
        });

        it('ok', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.true;
            expect(msg.datas.data).to.be.instanceOf(Object);
            expect(msg.datas.data).to.have.all.keys("_id", "name", "id", "products");
            expect(msg.datas.data.products).to.be.instanceof(Array);
            msg.datas.data.products.forEach(product => {
              expect(product).to.be.instanceof(Object);
              expect(product).to.have.all.keys("_id", "name", "code", "id");
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            sourceId: sources[0].id,
            productsId: [],
          };
          for (let i = 0; i < 90; i++) {
            data.productsId.push(productsId[i]);
          }
          cliente.emit('connect_products_source', {datas: data});
        });

        it('ok, mas repete produtos', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.true;
            expect(msg.datas.data).to.be.instanceOf(Object);
            expect(msg.datas.data).to.have.all.keys("_id", "name", "id", "products");
            expect(msg.datas.data.products).to.be.instanceof(Array);
            msg.datas.data.products.forEach(product => {
              expect(product).to.be.instanceof(Object);
              expect(product).to.have.all.keys("_id", "name", "code", "id");
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            sourceId: sources[0].id,
            productsId: [],
          };
          for (let i = 80; i < 110; i++) {
            data.productsId.push(productsId[i]);
          }
          cliente.emit('connect_products_source', {datas: data});
        });

      });

      describe('LER PRODUTOS DA FONTE', ()=>{

        it('ok', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.true;
            expect(msg.datas.data).to.be.instanceOf(Object);
            expect(msg.datas.data).to.have.all.keys("_id","id","products");
            expect(msg.datas.data.products).to.be.instanceof(Array);
            msg.datas.data.products.forEach(product=>{
              expect(product).to.be.instanceof(Object);
              expect(product).to.have.all.keys("_id","name","code","id");
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            sourceId: sources[0].id,
          };
          cliente.emit('source_read_products', {datas: data});
        });

        it('sem passar id da fonte', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.false;
            expect(msg.datas.data).to.be.instanceOf(Object);
            expect(msg.datas.data).to.have.all.keys("title","description","buttons","type");
            expect(msg.datas.data.buttons).to.be.instanceof(Array);
            msg.datas.data.buttons.forEach(button=>{
              expect(button).to.be.instanceof(Object);
              expect(button).to.have.all.keys("label","method");
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            sourceId: null,
          };
          cliente.emit('source_read_products', {datas: data});
        });

      });

      describe('PESQUISADOR', () => {

        describe('criar', () => {

          it('sem nome', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.false;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(researcherError => {
                expect(researcherError).to.be.instanceOf(Object);
                expect(researcherError).to.have.all.keys("title", "description", "buttons", "type");
                expect(researcherError.buttons).to.be.instanceOf(Array);
                researcherError.buttons.forEach(button => {
                  expect(button).to.be.instanceOf(Object);
                  expect(button).to.have.all.keys("label", "method");
                });
              });
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              name: '',
              surname: 'Miguel Junior',
              email: 'juniorsin2012@gmail.com',
              password: '123',
              phoneNumber: '48999476823',
            };
            cliente.emit('researcher_create', {datas: data});
          });

          it('sem sobrenome', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.false;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(researcherError => {
                expect(researcherError).to.be.instanceOf(Object);
                expect(researcherError).to.have.all.keys("title", "description", "buttons", "type");
                expect(researcherError.buttons).to.be.instanceOf(Array);
                researcherError.buttons.forEach(button => {
                  expect(button).to.be.instanceOf(Object);
                  expect(button).to.have.all.keys("label", "method");
                });
              });
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              name: 'Osvaldo',
              email: 'juniorsin2012@gmail.com',
              password: '123',
              phoneNumber: '48999476823',
            };
            cliente.emit('researcher_create', {datas: data});
          });

          it('sem email', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.false;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(researcherError => {
                expect(researcherError).to.be.instanceOf(Object);
                expect(researcherError).to.have.all.keys("title", "description", "buttons", "type");
                expect(researcherError.buttons).to.be.instanceOf(Array);
                researcherError.buttons.forEach(button => {
                  expect(button).to.be.instanceOf(Object);
                  expect(button).to.have.all.keys("label", "method");
                });
              });
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              name: 'Osvaldo',
              surname: 'Miguel Junior',
              email: null,
              password: '123',
              phoneNumber: '48999476823',
            };
            cliente.emit('researcher_create', {datas: data});
          });

          it('sem senha', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.false;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(researcherError => {
                expect(researcherError).to.be.instanceOf(Object);
                expect(researcherError).to.have.all.keys("title", "description", "buttons", "type");
                expect(researcherError.buttons).to.be.instanceOf(Array);
                researcherError.buttons.forEach(button => {
                  expect(button).to.be.instanceOf(Object);
                  expect(button).to.have.all.keys("label", "method");
                });
              });
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              name: 'Osvaldo',
              surname: 'Miguel Junior',
              email: 'juniorsin2012@gmail.com',
              phoneNumber: '48999476823',
            };
            cliente.emit('researcher_create', {datas: data});
          });

          it('sem numero de celular', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.false;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(researcherError => {
                expect(researcherError).to.be.instanceOf(Object);
                expect(researcherError).to.have.all.keys("title", "description", "buttons", "type");
                expect(researcherError.buttons).to.be.instanceOf(Array);
                researcherError.buttons.forEach(button => {
                  expect(button).to.be.instanceOf(Object);
                  expect(button).to.have.all.keys("label", "method");
                });
              });
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              name: 'Osvaldo',
              surname: 'Miguel Junior',
              email: 'juniorsin2012@gmail.com',
              password: '123',
              phoneNumber: '',
            };
            cliente.emit('researcher_create', {datas: data});
          });

          it('ok', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.true;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(researcher => {
                expect(researcher).to.be.instanceOf(Object);
                expect(researcher).to.have.all.keys("name", "surname", "email", "phoneNumber", "id", "type", "logged");
              });
              pesquisadores = msg.datas.data;
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              name: 'Osvaldo',
              surname: 'Miguel Junior',
              email: 'juniorsin2012@gmail.com',
              password: '123',
              phoneNumber: '48999476823',
            };
            cliente.emit('researcher_create', {datas: data});
          });

          it('email em uso', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.false;
              expect(msg.datas.data).to.be.instanceOf(Object);
              expect(msg.datas.data).to.be.instanceOf(Object);
              expect(msg.datas.data).to.have.all.keys("title", "description", "buttons", "type");
              expect(msg.datas.data.buttons).to.be.instanceOf(Array);
              msg.datas.data.buttons.forEach(button => {
                expect(button).to.be.instanceOf(Object);
                expect(button).to.have.all.keys("label", "method");
              });
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              name: 'Osvaldo',
              surname: 'Miguel Junior',
              email: 'juniorsin2012@gmail.com',
              password: '123',
              phoneNumber: '48999476823',
            };
            cliente.emit('researcher_create', {datas: data});
          });

          it('email em uso e sem nome', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.false;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(researcherError => {
                expect(researcherError).to.be.instanceOf(Object);
                expect(researcherError).to.have.all.keys("title", "description", "buttons", "type");
                expect(researcherError.buttons).to.be.instanceOf(Array);
                researcherError.buttons.forEach(button => {
                  expect(button).to.be.instanceOf(Object);
                  expect(button).to.have.all.keys("label", "method");
                });
              });
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              surname: 'Miguel Junior',
              email: 'juniorsin2012@gmail.com',
              password: '123',
              phoneNumber: '48999476823',
            };
            cliente.emit('researcher_create', {datas: data});
          });

        });

        describe('buscar', () => {

          it('ok', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.true;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(researcher => {
                expect(researcher).to.be.instanceOf(Object);
                expect(researcher).to.have.all.keys("name", "surname", "email", "phoneNumber", "id", "logged");
              });
              pesquisadores = [msg.datas.data[1]];
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {};
            cliente.emit('read_all_researchers', {datas: data});
          });

        });

        describe('editar', () => {

          it('ok', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.true;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(researcher => {
                expect(researcher).to.be.instanceOf(Object);
                expect(researcher).to.have.all.keys("name", "surname", "email", "phoneNumber", "id", "type", "logged");
              });
              pesquisadores[0] = msg.datas.data[0];
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              id: pesquisadores[0].id,
              update: {
                name: 'Osvaldo',
                surname: 'Miguel',
                email: 'juniorpalmas@hotmail.com',
                password: '123',
                phoneNumber: '48999476823',
              }
            };
            cliente.emit('researcher_update', {datas: data});
          });

        });

        describe('ASSOCIAR PESQUISADOR A FONTE', () => {

          it('sem id da fonte', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.false;
              expect(msg.datas.data).to.be.instanceOf(Object);
              expect(msg.datas.data).to.have.all.keys("title", "description", "buttons", "type");
              expect(msg.datas.data.buttons).to.be.instanceof(Array);
              msg.datas.data.buttons.forEach(button => {
                expect(button).to.be.instanceof(Object);
                expect(button).to.have.all.keys("label", "method");
              });
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              researcherId: pesquisadores[0].id,
              fontId: '',
            };
            cliente.emit('connect_researcher_source', {datas: data});
          });

          it('sem id do pesquisador', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.false;
              expect(msg.datas.data).to.be.instanceOf(Object);
              expect(msg.datas.data).to.have.all.keys("title", "description", "buttons", "type");
              expect(msg.datas.data.buttons).to.be.instanceof(Array);
              msg.datas.data.buttons.forEach(button => {
                expect(button).to.be.instanceof(Object);
                expect(button).to.have.all.keys("label", "method");
              });
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              fontId: sources[0].id
            };
            cliente.emit('connect_researcher_source', {datas: data});
          });

          it('ok', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.true;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(font => {
                expect(font).to.be.instanceOf(Object);
                expect(font).to.have.all.keys("name", "code", "id");
              });
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              researcherId: pesquisadores[0].id,
              fontId: sources[0].id
            };
            cliente.emit('connect_researcher_source', {datas: data});
          });

          it('com pesquisador já na fonte', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.false;
              expect(msg.datas.data).to.be.instanceOf(Object);
              expect(msg.datas.data).to.have.all.keys("title", "description", "buttons", "type");
              expect(msg.datas.data.buttons).to.be.instanceof(Array);
              msg.datas.data.buttons.forEach(button => {
                expect(button).to.be.instanceof(Object);
                expect(button).to.have.all.keys("label", "method");
              });
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              researcherId: pesquisadores[0].id,
              fontId: sources[0].id
            };
            cliente.emit('connect_researcher_source', {datas: data});
          });

        });

        describe('remover', () => {

          it('ok', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.true;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(researcher => {
                expect(researcher).to.be.instanceOf(Object);
                expect(researcher).to.have.all.keys("name", "surname", "email", "phoneNumber", "id", "type", "logged");
              });
              pesquisadores[0] = null;
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              id: pesquisadores[0].id,
            };
            cliente.emit('researcher_remove', {datas: data});
          });

        });

      });

      describe('buscar', () => {

        it('por pesquisador', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.true;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(source=>{
              expect(source).to.be.instanceof(Object);
              expect(source).to.have.all.keys("name","code","id");
            });
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {};
          cliente.emit('source_read_of_researcher', {datas: data});
        });

        it('por region', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.true;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(source => {
              expect(source).to.be.instanceof(Object);
              expect(source).to.have.all.keys("_id", "name", "id");
            });
            sources = msg.datas.data;
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            regionId: regions[0].id,
          };
          cliente.emit('source_read_region', {datas: data});
        });

        it('por id', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.true;
            expect(msg.datas.data).to.be.instanceOf(Array);
            msg.datas.data.forEach(fonte => {
              expect(fonte).to.have.all.keys("name", "code", "address", "id");
              expect(fonte.address).to.be.instanceof(Object);
              expect(fonte.address).to.have.all.keys("state", "city", "neighborhood", "street", "postalCode", "number");
              expect(fonte.address.city).to.be.instanceof(Object);
              expect(fonte.address.city).to.have.all.keys("_id", "name", "id");
              expect(fonte.address.neighborhood).to.be.instanceof(Object);
              expect(fonte.address.neighborhood).to.have.all.keys("_id", "name", "id");
              expect(fonte.address.state).to.be.instanceof(Object);
              expect(fonte.address.state).to.have.all.keys("_id", "initial", "id", "name");
            });
            sources[0] = msg.datas.data;
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            sourceId: sources[0].id,
          };
          cliente.emit('source_read_id', {datas: data});
        });

      });

      describe('PESQUISA', () => {

        describe('ABRIR NOVO MES DESCARTANDO ANTERIOR', () => {

          it('ok', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.true;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(report => {
                expect(report).to.be.instanceof(Object);
                expect(report).to.have.all.keys("updatedAt", "createdAt", "year", "month", "id", "removed", "calculatedProducts", "groups", "region");
                expect(report.calculatedProducts).to.be.instanceOf(Array);
                expect(report.groups).to.be.instanceof(Array);
              });
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              year: 2018,
              month: 4,
              regionId: regions[0].id,
            };
            cliente.emit('open_new_month_discard_previous', {datas: data});
          });

        });

        describe('BUSCAR PESQUISA', () => {

          it('ok', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.true;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(sourceSearch => {
                expect(sourceSearch).to.be.instanceof(Object);
                expect(sourceSearch).to.have.all.keys("_id", "search");
                expect(sourceSearch.search).to.be.instanceof(Array);
                sourceSearch.search.forEach(sear => {
                  expect(sear).to.be.instanceof(Object);
                  expect(sear).to.have.all.keys("_id", "code","source", "especOne", "especTwo", "price", "id", "previousSearch", "status", "name");
                  expect(sear.source).to.be.instanceof(Object);
                  expect(sear.source).to.have.all.keys("name", "code", "id");
                });
                expect(sourceSearch._id).to.be.instanceof(Object);
                expect(sourceSearch._id).to.have.all.keys("name", "code", "id");
              });
              searches = msg.datas.data;
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {};
            cliente.emit('get_searches', {datas: data});
          });

        });

        describe('EXCEL', ()=>{

          describe('Baixar', ()=>{

            it('Sem dados', (done)=>{
              chai.request(socketUrl)
                .get('/api/open/searchXLS')
                .query({userId: 'qualquerId', sourceId: 'qualquerId'})
                .end(async (error, response)=>{
                  done();
                });
            });

            it('Dados Errados', (done)=>{
              chai.request(socketUrl)
                .get('/api/open/searchXLS')
                .query({userId: "5b5105b15859e90714c41a5d", sourceId: "5b5105b15859e90714c41a5d"})
                .end(async (error, response)=>{
                  done();
                });
            });

            it('Ok', (done)=>{
              chai.request(socketUrl)
                .get('/api/open/searchXLS')
                .query({userId: usuario.id, sourceId: sources[0][0].id})
                .end(async (error, response)=>{
                  done();
                });
            });

          });

        });

        describe('BUSCAR PESQUISA POR FONTE', () => {

          it('ok', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.true;
              expect(msg.datas.data).to.be.instanceOf(Array);
              msg.datas.data.forEach(sourceSearch => {
                expect(sourceSearch).to.be.instanceof(Object);
                expect(sourceSearch).to.have.all.keys("_id", "search");
                expect(sourceSearch.search).to.be.instanceof(Array);
                sourceSearch.search.forEach(sear => {
                  expect(sear).to.be.instanceof(Object);
                  expect(sear).to.have.all.keys("_id", "code","source", "especOne", "especTwo", "price", "id", "previousSearch", "status", "name");
                  expect(sear.source).to.be.instanceof(Object);
                  expect(sear.source).to.have.all.keys("name", "code", "id");
                });
                expect(sourceSearch._id).to.be.instanceof(Object);
                expect(sourceSearch._id).to.have.all.keys("name", "code", "id");
              });
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {
              sourceId: searches[0]._id.id,
            };
            cliente.emit('get_searches_by_source', {datas: data});
          });

        });

        describe('PREENCHER PESQUISA E SALVAR', () => {

          let createEspc = () => {
            const consonants = 'bcdfghjk lmnp qrst vwxyz';
            const vowels = 'aeiou';
            const length = Math.floor((Math.random() * 20) + 3);
            let nameToReturn = '';
            for (let i = 0; i < length; i++) {
              if (i % 2) {
                nameToReturn = nameToReturn + vowels.substr(Math.floor((Math.random() * vowels.length)), 1);
              } else {
                nameToReturn = nameToReturn + consonants.substr(Math.floor((Math.random() * consonants.length)), 1);
              }
            }
            return nameToReturn.toUpperCase();
          };

          let preenchePesquisa = () => {
            for (let i = 0; i < searches[0].search.length; i++) {
              searches[0].search[i].especOne = createEspc();
              searches[0].search[i].especTwo = createEspc();
              searches[0].search[i].price = 12.75;
            }
          };

          it('ok', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.true;
              expect(msg.datas.data).to.be.instanceOf(Object);
              expect(msg.datas.data).to.have.all.keys("searches");
              expect(msg.datas.data.searches).to.be.instanceof(Array);
              msg.datas.data.searches.forEach(search => {
                expect(search).to.be.instanceof(Object);
                expect(search).to.have.all.keys("_id", "code", "source", "especOne", "especTwo", "price", "id", "previousSearch", "status", "name");
                expect(search.status).to.equal("Init");
                expect(search.source).to.be.instanceof(Object);
                expect(search.source).to.have.all.keys("name", "code", "id");
              });
              searches[0].search = msg.datas.data.searches;
              cliente.removeListener("retorno", retorno);
              done();
            };
            preenchePesquisa();
            cliente.on('retorno', retorno);
            let data = {
              searches: searches[0].search,
            };
            cliente.emit('user_searches_save', {datas: data});
          });

        });

        describe('ENVIAR PESQUISA/FECHAR PESQUISA ATUAL', () => {

          it('ok', (done) => {
            let retorno = (msg) => {
              expect(msg.datas).to.be.instanceOf(Object);
              expect(msg.datas).to.have.all.keys("success", "data");
              expect(msg.datas.success).to.be.true;
              expect(msg.datas.data).to.be.true;
              cliente.removeListener("retorno", retorno);
              done();
            };
            cliente.on('retorno', retorno);
            let data = {};
            cliente.emit('user_searches_send', {datas: data});
          });

        });

        describe('ABRIR NOVA PESQUISA NO MES', () => {

          describe('retorna pesquisadores com pesquisa em aberto', () => {

            it('ok', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach((group) => {
                  expect(group).to.be.instanceof(Object);
                  expect(group).to.have.all.keys("source", "user");
                  expect(group.source).to.be.instanceof(Object);
                  expect(group.source).to.have.all.keys("name", "code", "id");
                  expect(group.user).to.be.instanceof(Object);
                  expect(group.user).to.have.all.keys("name", "surname", "id");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
              };
              cliente.emit('verify_opened_searches_user', {datas: data});
            });

          });

          describe('abrir pesquisa', () => {

            it('ok 1', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.true;
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
              };
              cliente.emit('open_new_month_searches', {datas: data});
            });

            it('fecha pesquisa 1', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.true;
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {};
              cliente.emit('user_searches_send', {datas: data});
            });

            it('ok 2', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.true;
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
              };
              cliente.emit('open_new_month_searches', {datas: data});
            });

            it('fecha pesquisa 2', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.true;
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {};
              cliente.emit('user_searches_send', {datas: data});
            });

            it('ok 3', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.true;
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
              };
              cliente.emit('open_new_month_searches', {datas: data});
            });

            it('busca pesquisa', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach(sourceSearch => {
                  expect(sourceSearch).to.be.instanceof(Object);
                  expect(sourceSearch).to.have.all.keys("_id", "search");
                  expect(sourceSearch.search).to.be.instanceof(Array);
                  sourceSearch.search.forEach(sear => {
                    expect(sear).to.be.instanceof(Object);
                    expect(sear).to.have.all.keys("_id", "code","source", "especOne", "especTwo", "price", "id", "previousSearch", "status", "name");
                    expect(sear.source).to.be.instanceof(Object);
                    expect(sear.source).to.have.all.keys("name", "code", "id");
                  });
                  expect(sourceSearch._id).to.be.instanceof(Object);
                  expect(sourceSearch._id).to.have.all.keys("name", "code", "id");
                });
                searches = msg.datas.data;
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {};
              cliente.emit('get_searches', {datas: data});
            });

            it('ok', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Object);
                expect(msg.datas.data).to.have.all.keys("searches");
                expect(msg.datas.data.searches).to.be.instanceof(Array);
                msg.datas.data.searches.forEach(search => {
                  expect(search).to.be.instanceof(Object);
                  expect(search).to.have.all.keys("_id", "code", "source", "especOne", "especTwo", "price", "id", "previousSearch", "status", "name");
                  expect(search.status).to.equal("Init");
                  expect(search.source).to.be.instanceof(Object);
                  expect(search.source).to.have.all.keys("name", "code", "id");
                });
                searches[0].search = msg.datas.data.searches;
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                searches: searches[0].search,
              };
              cliente.emit('user_searches_save', {datas: data});
            });

          });

        });

        describe('NOVO MES', () => {

          describe('VERIFICAR PESQUISAS ABERTAS', () => {

            it('verificar se existe pesquisa em aberto', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
              };
              cliente.emit('verify_opened_searches_user', {datas: data});
            });

            it('fecha pesquisa 3', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.true;
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {};
              cliente.emit('user_searches_send', {datas: data});
            });

            it('verificar se existe pesquisa em aberto', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
              };
              cliente.emit('verify_opened_searches_user', {datas: data});
            });

          });

          describe('CRITICA', () => {

            let allSearch = null;
            let searchByProduct = null;
            let searchByFont = null;

            it('le datas da pra critica', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach(date=>{
                  expect(date).to.be.instanceof(Object);
                  expect(date).to.have.all.keys("year","month","id");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
              };
              cliente.emit('read_review_date', {datas: data});
            });

            it('le pesquisas para critica com filtro por fonte', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Object);
                expect(msg.datas.data).to.have.all.keys("searches","columnsAmount");
                expect(msg.datas.data.searches).to.be.instanceof(Array);
                msg.datas.data.searches.forEach(productSearch => {
                  expect(productSearch).to.be.instanceof(Object);
                  expect(productSearch.product).to.be.instanceof(Object);
                  expect(productSearch.product).to.have.all.keys("_id", "name", "code", "id");
                  if (productSearch.searches) {
                    expect(productSearch).to.have.all.keys("product","source","searches");
                    expect(productSearch.searches).to.be.instanceof(Array);
                    productSearch.searches.forEach(search=>{
                      expect(search).to.be.instanceof(Object);
                      expect(search).to.have.all.keys("_id","code","especOne","especTwo","price","id","changed");
                    });
                    expect(productSearch.source).to.be.instanceof(Object);
                    expect(productSearch.source).to.have.all.keys("_id","name","code","id");
                  }
                });
                searchByFont = msg.datas.data.searches;
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                year: 2018,
                month: 4,
                filter: {
                  products: [],
                  sources: [sources[0][0].id],
                },
              };
              cliente.emit('read_all_searches_to_review_filter', {datas: data});
            });

            it('le pesquisas para critica', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Object);
                expect(msg.datas.data).to.have.all.keys("searches","columnsAmount","researchers","sources","products");
                expect(msg.datas.data.researchers).to.be.instanceof(Array);
                msg.datas.data.researchers.forEach(research=>{
                  expect(research).to.be.instanceof(Object);
                  expect(research).to.have.all.keys("text","value");
                });
                expect(msg.datas.data.sources).to.be.instanceof(Array);
                msg.datas.data.sources.forEach(source=>{
                  expect(source).to.be.instanceof(Object);
                  expect(source).to.have.all.keys("text","value");
                });
                expect(msg.datas.data.products).to.be.instanceof(Array);
                msg.datas.data.products.forEach(product=>{
                  expect(product).to.be.instanceof(Object);
                  expect(product).to.have.all.keys("text","value");
                });
                expect(msg.datas.data.searches).to.be.instanceof(Array);
                msg.datas.data.searches.forEach(productSearch => {
                  expect(productSearch).to.be.instanceof(Object);
                  expect(productSearch.product).to.be.instanceof(Object);
                  expect(productSearch.product).to.have.all.keys("_id", "name", "code", "id");
                  if (productSearch.searches) {
                    expect(productSearch).to.have.all.keys("product","source","searches");
                    expect(productSearch.searches).to.be.instanceof(Array);
                    productSearch.searches.forEach(search=>{
                      expect(search).to.be.instanceof(Object);
                      expect(search).to.have.all.keys("_id","code","especOne","especTwo","price","id","changed");
                    });
                    expect(productSearch.source).to.be.instanceof(Object);
                    expect(productSearch.source).to.have.all.keys("_id","name","code","id");
                  }
                });
                allSearch = msg.datas.data.searches;
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                year: 2018,
                month: 4,
              };
              cliente.emit('read_all_searches_to_review', {datas: data});
            });

            it('le pesquisas para critica com filtro por produto', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Object);
                expect(msg.datas.data).to.have.all.keys("searches","columnsAmount");
                expect(msg.datas.data.searches).to.be.instanceof(Array);
                msg.datas.data.searches.forEach(productSearch => {
                  expect(productSearch).to.be.instanceof(Object);
                  expect(productSearch.product).to.be.instanceof(Object);
                  expect(productSearch.product).to.have.all.keys("_id", "name", "code", "id");
                  if (productSearch.searches) {
                    expect(productSearch).to.have.all.keys("product","source","searches");
                    expect(productSearch.searches).to.be.instanceof(Array);
                    productSearch.searches.forEach(search=>{
                      expect(search).to.be.instanceof(Object);
                      expect(search).to.have.all.keys("_id","code","especOne","especTwo","price","id","changed");
                    });
                    expect(productSearch.source).to.be.instanceof(Object);
                    expect(productSearch.source).to.have.all.keys("_id","name","code","id");
                  }
                });
                searchByProduct = msg.datas.data.searches;
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                year: 2018,
                month: 4,
                filter: {
                  products: [productsId[1]],
                  researchers: [],
                  fonts: [],
                },
              };
              cliente.emit('read_all_searches_to_review_filter', {datas: data});
            });

            it('le pesquisas para critica com filtro por fonte e produto', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Object);
                expect(msg.datas.data).to.have.all.keys("searches","columnsAmount");
                expect(msg.datas.data.searches).to.be.instanceof(Array);
                msg.datas.data.searches.forEach(productSearch => {
                  expect(productSearch).to.be.instanceof(Object);
                  expect(productSearch.product).to.be.instanceof(Object);
                  expect(productSearch.product).to.have.all.keys("_id", "name", "code", "id");
                  if (productSearch.searches) {
                    expect(productSearch).to.have.all.keys("product","source","searches");
                    expect(productSearch.searches).to.be.instanceof(Array);
                    productSearch.searches.forEach(search=>{
                      expect(search).to.be.instanceof(Object);
                      expect(search).to.have.all.keys("_id","code","especOne","especTwo","price","id","changed");
                    });
                    expect(productSearch.source).to.be.instanceof(Object);
                    expect(productSearch.source).to.have.all.keys("_id","name","code","id");
                  }
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                year: 2018,
                month: 4,
                filter: {
                  products: [productsId[1]],
                  sources: [sources[0][0].id],
                },
              };
              cliente.emit('read_all_searches_to_review_filter', {datas: data});
            });

            it('le pesquisas para critica sem filtro', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Object);
                expect(msg.datas.data).to.have.all.keys("searches","columnsAmount","researchers","sources","products");
                expect(msg.datas.data.researchers).to.be.instanceof(Array);
                msg.datas.data.researchers.forEach(research=>{
                  expect(research).to.be.instanceof(Object);
                  expect(research).to.have.all.keys("text","value");
                });
                expect(msg.datas.data.sources).to.be.instanceof(Array);
                msg.datas.data.sources.forEach(source=>{
                  expect(source).to.be.instanceof(Object);
                  expect(source).to.have.all.keys("text","value");
                });
                expect(msg.datas.data.products).to.be.instanceof(Array);
                msg.datas.data.products.forEach(product=>{
                  expect(product).to.be.instanceof(Object);
                  expect(product).to.have.all.keys("text","value");
                });
                expect(msg.datas.data.searches).to.be.instanceof(Array);
                msg.datas.data.searches.forEach(productSearch => {
                  expect(productSearch).to.be.instanceof(Object);
                  expect(productSearch.product).to.be.instanceof(Object);
                  expect(productSearch.product).to.have.all.keys("_id", "name", "code", "id");
                  if (productSearch.searches) {
                    expect(productSearch).to.have.all.keys("product","source","searches");
                    expect(productSearch.searches).to.be.instanceof(Array);
                    productSearch.searches.forEach(search=>{
                      expect(search).to.be.instanceof(Object);
                      expect(search).to.have.all.keys("_id","code","especOne","especTwo","price","id","changed");
                    });
                    expect(productSearch.source).to.be.instanceof(Object);
                    expect(productSearch.source).to.have.all.keys("_id","name","code","id");
                  }
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                year: 2018,
                month: 4,
              };
              cliente.emit('read_all_searches_to_review_filter', {datas: data});
            });

            it('le pesquisas para critica com filtros vazios', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Object);
                expect(msg.datas.data).to.have.all.keys("searches","columnsAmount","researchers","sources","products");
                expect(msg.datas.data.researchers).to.be.instanceof(Array);
                msg.datas.data.researchers.forEach(research=>{
                  expect(research).to.be.instanceof(Object);
                  expect(research).to.have.all.keys("text","value");
                });
                expect(msg.datas.data.sources).to.be.instanceof(Array);
                msg.datas.data.sources.forEach(source=>{
                  expect(source).to.be.instanceof(Object);
                  expect(source).to.have.all.keys("text","value");
                });
                expect(msg.datas.data.products).to.be.instanceof(Array);
                msg.datas.data.products.forEach(product=>{
                  expect(product).to.be.instanceof(Object);
                  expect(product).to.have.all.keys("text","value");
                });
                expect(msg.datas.data.searches).to.be.instanceof(Array);
                msg.datas.data.searches.forEach(productSearch => {
                  expect(productSearch).to.be.instanceof(Object);
                  expect(productSearch.product).to.be.instanceof(Object);
                  expect(productSearch.product).to.have.all.keys("_id", "name", "code", "id");
                  if (productSearch.searches) {
                    expect(productSearch).to.have.all.keys("product","source","searches");
                    expect(productSearch.searches).to.be.instanceof(Array);
                    productSearch.searches.forEach(search=>{
                      expect(search).to.be.instanceof(Object);
                      expect(search).to.have.all.keys("_id","code","especOne","especTwo","price","id","changed");
                    });
                    expect(productSearch.source).to.be.instanceof(Object);
                    expect(productSearch.source).to.have.all.keys("_id","name","code","id");
                  }
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                year: 2018,
                month: 4,
                filter: {
                  products: [],
                  sources: [],
                },
              };
              cliente.emit('read_all_searches_to_review_filter', {datas: data});
            });

            it('le pesquisas para critica com filtro sem atributo', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Object);
                expect(msg.datas.data).to.have.all.keys("searches","columnsAmount","researchers","sources","products");
                expect(msg.datas.data.researchers).to.be.instanceof(Array);
                msg.datas.data.researchers.forEach(research=>{
                  expect(research).to.be.instanceof(Object);
                  expect(research).to.have.all.keys("text","value");
                });
                expect(msg.datas.data.sources).to.be.instanceof(Array);
                msg.datas.data.sources.forEach(source=>{
                  expect(source).to.be.instanceof(Object);
                  expect(source).to.have.all.keys("text","value");
                });
                expect(msg.datas.data.products).to.be.instanceof(Array);
                msg.datas.data.products.forEach(product=>{
                  expect(product).to.be.instanceof(Object);
                  expect(product).to.have.all.keys("text","value");
                });
                expect(msg.datas.data.searches).to.be.instanceof(Array);
                msg.datas.data.searches.forEach(productSearch => {
                  expect(productSearch).to.be.instanceof(Object);
                  expect(productSearch.product).to.be.instanceof(Object);
                  expect(productSearch.product).to.have.all.keys("_id", "name", "code", "id");
                  if (productSearch.searches) {
                    expect(productSearch).to.have.all.keys("product","source","searches");
                    expect(productSearch.searches).to.be.instanceof(Array);
                    productSearch.searches.forEach(search=>{
                      expect(search).to.be.instanceof(Object);
                      expect(search).to.have.all.keys("_id","code","especOne","especTwo","price","id","changed");
                    });
                    expect(productSearch.source).to.be.instanceof(Object);
                    expect(productSearch.source).to.have.all.keys("_id","name","code","id");
                  }
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                year: 2018,
                month: 4,
                filter: {},
              };
              cliente.emit('read_all_searches_to_review_filter', {datas: data});
            });

            it('altera valor de pesquisa e salva', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach(search => {
                  expect(search).to.be.instanceof(Object);
                  expect(search).to.have.all.keys("price", "id", "changed");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                searches: [
                  {
                  id: searchByProduct[0].searches[0].id,
                  price: 5.55
                }
                ],
              };
              cliente.emit('change_research_by_review', {datas: data});
            });

            it('altera changed de pesquisa e salva', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach(search => {
                  expect(search).to.be.instanceof(Object);
                  expect(search).to.have.all.keys("price", "id", "changed");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                searches: [],
              };
              let changed = {
                id: searchByProduct[0].searches[0].id,
                changed: true
              };
              data.searches.push(changed);
              cliente.emit('change_research_by_review', {datas: data});
            });

            it('altera changed e valor de pesquisa e salva', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach(search => {
                  expect(search).to.be.instanceof(Object);
                  expect(search).to.have.all.keys("price", "id", "changed");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                searches: [],
              };
              let changed = {
                id: searchByProduct[0].searches[0].id,
                changed: false,
                price: 15.9
              };
              data.searches.push(changed);
              cliente.emit('change_research_by_review', {datas: data});
            });

            it('altera changed com valor errado de pesquisa e salva', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach(search => {
                  expect(search).to.be.instanceof(Object);
                  expect(search).to.have.all.keys("price", "id", "changed");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                searches: [],
              };
              let changed = {
                id: searchByProduct[0].searches[0].id,
                changed: null,
              };
              data.searches.push(changed);
              cliente.emit('change_research_by_review', {datas: data});
            });

            it('altera valor errado de pesquisa e salva', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach(search => {
                  expect(search).to.be.instanceof(Object);
                  expect(search).to.have.all.keys("price", "id", "changed");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                searches: [],
              };
              let changed = {
                id: searchByProduct[0].searches[0].id,
                price: null,
              };
              data.searches.push(changed);
              cliente.emit('change_research_by_review', {datas: data});
            });

            it('altera valor errado e changed certo de pesquisa e salva', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach(search => {
                  expect(search).to.be.instanceof(Object);
                  expect(search).to.have.all.keys("price", "id", "changed");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                searches: [],
              };
              let changed = {
                id: searchByProduct[0].searches[0].id,
                price: null,
                changed: true,
              };
              data.searches.push(changed);
              cliente.emit('change_research_by_review', {datas: data});
            });

            it('altera valor zero e changed certo de pesquisa e salva', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach(search => {
                  expect(search).to.be.instanceof(Object);
                  expect(search).to.have.all.keys("price", "id", "changed");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                searches: [],
              };
              let changed = {
                id: searchByProduct[0].searches[0].id,
                price: 0,
                changed: true,
              };
              data.searches.push(changed);
              cliente.emit('change_research_by_review', {datas: data});
            });

            let changeAnySearches = () => {
              let init = Math.floor(Math.random() * 100);
              let ret = [];
              for (let i = init; i < searchByFont.length; i++) {
                for (let j = 0; j < searchByFont[i].searches.length; j++) {
                  let obj: any = {
                    id: searchByFont[i].searches[j].id,
                    price: (Math.random() * 1000).toFixed(2),
                  };
                  if(obj.price > 500) obj["changed"] = true;
                  ret.push(obj);
                }
              }
              return ret;
            };

            it('altera varias pesquisas', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach(search => {
                  expect(search).to.be.instanceof(Object);
                  expect(search).to.have.all.keys("price", "id", "changed");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                searches: changeAnySearches(),
              };
              cliente.emit('change_research_by_review', {datas: data});
            });

          });

          describe('ABRIR/FECHAR MES', () => {

            it('Ler datas de relatorio', (done)=>{
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceof(Array);
                msg.datas.data.forEach(date=>{
                  expect(date).to.be.instanceof(Object);
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
              };
              cliente.emit('read_report_dates', {datas: data});
            });

            it('Ler relatorio', (done)=>{
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceof(Array);
                msg.datas.data.forEach(item=>{
                  expect(item).to.be.instanceof(Object);
                  expect(item).to.have.all.keys("code","productName","previousWeight","weight","ipc","group4","group3","group2","group1");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
              };
              cliente.emit('read_report', {datas: data});
            });

            it('calcular relatorio', (done)=>{
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.true;
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
                year: 2018,
                month: 4,
              };
              cliente.emit('calculate_report', {datas: data});
            });

            it('Abrir novo mes', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach(review => {
                  expect(review).to.be.instanceof(Object);
                  expect(review).to.have.all.keys("updatedAt", "createdAt", "year", "month", "region", "id", "removed", "searches");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
              };
              cliente.emit('open_new_month', {datas: data});
            });

            it('Abrir novo mes', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach(review => {
                  expect(review).to.be.instanceof(Object);
                  expect(review).to.have.all.keys("updatedAt", "createdAt", "year", "month", "region", "id", "removed", "searches");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
              };
              cliente.emit('open_new_month', {datas: data});
            });

            it('Abrir novo mes', (done) => {
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceOf(Array);
                msg.datas.data.forEach(review => {
                  expect(review).to.be.instanceof(Object);
                  expect(review).to.have.all.keys("updatedAt", "createdAt", "year", "month", "region", "id", "removed", "searches");
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
              };
              cliente.emit('open_new_month', {datas: data});
            });

            it('Ler datas de relatorio', (done)=>{
              let retorno = (msg) => {
                expect(msg.datas).to.be.instanceOf(Object);
                expect(msg.datas).to.have.all.keys("success", "data");
                expect(msg.datas.success).to.be.true;
                expect(msg.datas.data).to.be.instanceof(Array);
                msg.datas.data.forEach(date=>{
                  expect(date).to.be.instanceof(Object);
                });
                cliente.removeListener("retorno", retorno);
                done();
              };
              cliente.on('retorno', retorno);
              let data = {
                regionId: regions[0].id,
              };
              cliente.emit('read_report_dates', {datas: data});
            });

          });

        });

      });

      describe('remover', () => {

        it('ok', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.true;
            expect(msg.datas.data).to.be.instanceOf(Array);
            expect(msg.datas.data).to.be.empty;
            sources[0] = null;
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let data = {
            id: sources[0][0].id,
          };
          cliente.emit('source_remove', {datas: data});
        });

      });

    });

    describe('buscar', () => {

      it('ok', (done) => {
        let retorno = (msg) => {
          expect(msg.datas).to.be.instanceOf(Object);
          expect(msg.datas).to.have.all.keys("success", "data");
          expect(msg.datas.success).to.be.true;
          expect(msg.datas.data).to.be.instanceOf(Array);
          msg.datas.data.forEach(region => {
            expect(region).to.be.instanceOf(Object);
            expect(region).to.have.all.keys("name", "id", "sources");
          });
          regions = msg.datas.data;
          cliente.removeListener("retorno", retorno);
          done();
        };
        cliente.on('retorno', retorno);
        let data = {};
        cliente.emit('read_all_regions', {datas: data});
      });

    });

    describe('remover', () => {

      it('ok', (done) => {
        let retorno = (msg) => {
          expect(msg.datas).to.be.instanceOf(Object);
          expect(msg.datas).to.have.all.keys("success", "data");
          expect(msg.datas.success).to.be.true;
          expect(msg.datas.data).to.be.instanceOf(Array);
          msg.datas.data.forEach(region => {
            expect(region).to.be.instanceOf(Object);
            expect(region).to.have.all.keys("name", "id");
          });
          regions[0] = null;
          cliente.removeListener("retorno", retorno);
          done();
        };
        cliente.on('retorno', retorno);
        let data = {
          id: regions[0].id,
        };
        cliente.emit('region_remove', {datas: data});
      });

    });

  });

  describe("DADOS USUARIO", ()=>{

    it("Editar minhas informações", (done) => {
      let retorno = function (msg) {
        expect(msg.datas).to.be.instanceOf(Object);
        expect(msg.datas).to.have.all.keys("success", "data");
        expect(msg.datas.success).to.be.true;
        expect(msg.datas.data).to.be.instanceOf(Array);
        msg.datas.data.forEach(user=>{
          expect(user).to.be.instanceof(Object);
          expect(user).to.have.all.keys("name","surname","email","phoneNumber","id");
        });
        cliente.removeListener("retorno", retorno);
        done();
      };
      cliente.on("retorno", retorno);
      let data = {
        name: "Isadora",
        surname: "Pinto",
        email: "isadoraPinto@grande.humm",
        password: "senhoraDoGelo",
        phoneNumber: "149600000",
      };
      cliente.emit("user_change_infos", {datas: data});
    });

  });

  describe('LOGOUT', () => {

    it("Admin Logout", (done) => {
      let retorno = (msg) => {
        expect(msg.datas.success).to.be.true;
        cliente.removeListener("retorno", retorno);
        done();
      };
      cliente.on("retorno", retorno);
      let data = {};
      cliente.emit("logout", {datas: data});
    });

  })

});