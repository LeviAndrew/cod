import {TestManager} from '../TestManager';
import * as fs from 'fs';
import * as path from 'path';

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
  let productsId = [];

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
          let doc = fs.readFileSync(path.resolve('test/docsTest/Cesta.xlsx'));
          let data = {
            "regionId": regions[0].id,
            "document": doc.toString('base64'),
          };
          cliente.emit('import_basket', {datas: data});
        });

      });

    });

    describe('IPORTAÇÃO', () => {

      describe('Relatório base', () => {

        it('Download', (done) => {
          chai.request(socketUrl)
            .get('/api/open/defaultReviewXLS')
            .end(async (error, response) => {
              done();
            });
        })

      });

      describe('Importa critica', () => {

        it('Ok 1', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.true;
            expect(msg.datas.data).to.be.true;
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let doc = fs.readFileSync(path.resolve('test/docsTest/Critica.xlsx'));
          let data = {
            year: 2018,
            month: 3,
            regionId: regions[0].id,
            document: doc.toString('base64'),
          };
          cliente.emit('import_review', {datas: data});
        });

        it('Ok 2', (done) => {
          let retorno = (msg) => {
            expect(msg.datas).to.be.instanceOf(Object);
            expect(msg.datas).to.have.all.keys("success", "data");
            expect(msg.datas.success).to.be.true;
            expect(msg.datas.data).to.be.true;
            cliente.removeListener("retorno", retorno);
            done();
          };
          cliente.on('retorno', retorno);
          let doc = fs.readFileSync(path.resolve('test/docsTest/Critica1.xlsx'));
          let data = {
            year: 2018,
            month: 4,
            regionId: regions[0].id,
            document: doc.toString('base64'),
          };
          cliente.emit('import_review', {datas: data});
        });

      });

      describe('BAIXA CRITICA', () => {

        it('Ok', (done) => {
          chai.request(socketUrl)
            .get('/api/open/reviewXLSX')
            .query({
              userId: usuario.id,
              regionId: regions[0].id,
              year: 2018,
              month: 4
            })
            .end(async (error, response) => {
              done();
            });
        });

      });

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