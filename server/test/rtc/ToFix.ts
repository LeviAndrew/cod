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
  let region = null;

  it("CONNECT", (done) => {
    cliente = io(socketUrl);
    cliente.on("connect", (data) => {
      done();
    });
    cliente.connect();
  });

  describe('LOGIN', () => {

    it("Admin Login", (done) => {
      let retorno = (msg)=>{
        expect(msg.datas.success).to.be.true;
        expect(msg.datas.data).to.be.instanceOf(Object);
        expect(msg.datas.data).to.have.all.keys("email", "id", "name", "phoneNumber", "surname", "type");
        usuario = msg.datas.data;
        cliente.removeListener("retorno", retorno);
        done();
      };
      cliente.on("retorno", retorno);
      let user = {
        email: "admin@admin.com",
        password: "4dm1ncv3",
      };
      cliente.emit("logar", {datas: user});
    });

  });

  describe('Abrir tabela de critica', ()=>{

    it('ler Regioes', (done)=>{
      let retorno = function (msg) {
        region = msg.datas.data[0];
        done();
      };
      cliente.on("retorno", retorno);
      cliente.emit("read_all_regions", {datas: null});
    });

    it('ler pesquisas', (done)=>{
      let retorno = (msg) => {
        done();
      };
      cliente.on("retorno", retorno);
      let data = {
        month: 10,
        regionId: region.id,
        year: 2018
      };
      cliente.emit("read_all_searches_to_review", {datas: data});
    });

  });

  describe('Critica filtro', ()=>{

    // it(){}

  });

});