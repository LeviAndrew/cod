import {TestManager} from '../TestManager';
const chai: any = require('chai');
const chaihttp = require('chai-http');


chai.use(chaihttp);

let expect = chai.expect;

let testManager = null;

describe('Teste aplicativo', () => {
  before(function (done) {
    testManager = new TestManager(done);
  });

  it('1. teste exemplo', (done) => {
    chai.request('http://localhost:1337')
      .post('/api/open/teste')
      .send({nome: 'osvaldo'})
      .end(async (err, res) => {

        expect(res.body).to.be.instanceOf(Object);
        expect(res.body).to.have.all.key('last_name');
        expect(res.body.last_name).to.have.string('miguel');

        done();
      });
  });

  it('2. teste exemplo nome errado', (done) => {
    chai.request('http://localhost:1337')
      .post('/api/open/teste')
      .send({nome: 'bernardo'})
      .end(async (err, res) => {

        expect(res.body).to.be.instanceOf(Object);
        expect(res.body).to.have.all.key('last_name');
        expect(res.body.last_name).to.have.string('estranho');

        done();
      });
  });

});