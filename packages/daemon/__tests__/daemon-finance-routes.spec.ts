import chai from 'chai';
import chaiHttp from 'chai-http';
import Server from '../lib/server';
import { ConsoleTransport, Logger } from '@node-lightning/logger';
import { Application } from 'express';
import express from 'express';
import * as util from './daemon';
import { Endpoint } from '../lib/routes';
import {
  ContractInfoV0,
  DlcOfferV0,
  FundingInputV0,
  OrderOfferV0,
} from '@node-dlc/messaging';
import { confToLogLevel } from '../lib/utils/config';
import HttpException from '../lib/routes/handler/HttpException';
import request from 'superagent';
import { createWallet } from './wallet';

chai.use(chaiHttp);
chai.should();
const expect = chai.expect;

describe('Finance Routes', () => {
  const argv = util.getArgv('finance');
  let server: Server;
  const logger = new Logger('DLCd');
  if (util.enableLogger) {
    logger.transports.push(new ConsoleTransport(console));
    logger.level = confToLogLevel(argv.loglevel);
  }
  const app: Application = express();
  const apiFinancePrefix = 'api/finance';

  const fundingPubKey = Buffer.from(
    '0327efea09ff4dfb13230e887cbab8821d5cc249c7ff28668c6633ff9f4b4c08e3',
    'hex',
  );

  const payoutSPK = Buffer.from(
    '00142bbdec425007dc360523b0294d2c64d2213af498',
    'hex',
  );

  const changeSPK = Buffer.from(
    '0014afa16f949f3055f38bd3a73312bed00b61558884',
    'hex',
  );

  const contractInfo = ContractInfoV0.deserialize(
    Buffer.from(
      'fdd82e' + // contract_info_v0
        'fd0332' + // length
        '00000000000f06a5' + // total_collateral
        'fda720' + // contract_descriptor_v1
        '45' + // length
        '0012' + // num_digits
        'fda726' + // payout_function
        '35' + // length
        '0001' + // num_pieces
        '00' + // endpoint_0
        'fe000f06a5' + // endpoint_payout_0
        '0000' + // extra_precision
        'fda72c' + // hyperbola_payout_curve_piece
        '1f' + // length
        '01' + // use_positive_piece
        '01' + // translate_outcome_sign
        '00' + // translate_outcome
        '0000' + // translate_outcome_extra_precision
        '00' + // translate_payout_sign
        'fd3b9b' + // translate_payout
        '0000' + // translate_payout_extra_precision
        '01' + // a_sign
        '01' + // a
        '0000' + // a_extra_precision
        '01' + // b_sign
        '00' + // b
        '0000' + // b_extra_precision
        '01' + // c_sign
        '00' + // c
        '0000' + // c_extra_precision
        '01' + // d_sign
        'feee6b2800' + // d
        '0000' + // d_extra_precision
        'fe0003ffff' + // endpoint
        '00' + // endpoint_payout
        '0000' + // extra_precision
        'fda724' + // rounding_interval
        '06' + // length
        '0001' + // num_rounding_intervals
        '00' + // begin_interval
        'fd01f4' + // rounding_mod
        'fda712' + // oracle_info
        'fd02db' + // length
        'fdd824' + // oracle_announcement_v0
        'fd02d5' + // length
        '9a121c157514df82ea0c57d0d82c78105f6272fc4ebd26d0c8f2903f406759e38e77578edee940590b11b875bacdac30ce1f4b913089a7e4e95884edf6f3eb19' + // announcement_sig
        '5d1bcfab252c6dd9edd7aea4c5eeeef138f7ff7346061ea40143a9f5ae80baa9' + // oracle_pubkey
        'fdd822' + // oracle_event
        'fd026f0012' +
        'd39fca86c2492977c0a2909583b2c154bb121834658d75502d41a0e3b719fb0c' + // oracle_nonce_1
        'd80ea2438d18d049be2d3aa4f1a3096628614d7bdda32757fd9a206c8e8c25c5' + // oracle_nonce_2
        '14b68799e03bb713d542f6c35ffaa0917fe18646969c77d56f4d8aa0f0fb30b2' + // oracle_nonce_3
        '6d746cb0713e27a56f8aa56dc828120b523fee21b2f0bc9d3a4a6d9855c251fd' + // oracle_nonce_4
        '6405bb7f6c1dfee97d24cfd7ad533c06162a22f4fc9fdd0e5c02e94201c239bb' + // oracle_nonce_5
        '13753ab5c56881f55367321ebd44e302241b42c99aa67dffb2d229178701d71a' + // oracle_nonce_6
        '756244c433d15f9b20d33628540da5c07face604980e5f709aa0bbfdb157b7a8' + // oracle_nonce_7
        'abc8d946f9e5d67c1e91bf22d77f5c097e6b3a51a420a8d882a3cad98cb4f84a' + // oracle_nonce_8
        'ce075a8acee1ef4f229e1b2b403ffb9f43a825ca8410b7d803b91ae54959ecd6' + // oracle_nonce_9
        '30e824310749ed1ee54e0e40e0af49d9a11bfbdbf36146234063c00520ed4416' + // oracle_nonce_10
        'a2dafe74f9c0542b2d58c58fa75e9bb5a95c291d934f4dd513c405e9ddc58543' + // oracle_nonce_11
        'ab4a586bf0b9abf7a12aa272ff29429df38164e3e5d418b913c818c1858a3a8b' + // oracle_nonce_12
        '19355a1ceaee7318a245bab2b09d94bf39f7b600665c3b8b8a655cf54f85c1b3' + // oracle_nonce_13
        '8ed41798968a0da05884d9f0e201b3e3be3a3740cf31439fd325248eed65fa93' + // oracle_nonce_14
        '44390f5748bbbbbcab4b2f200b9fdd860a1fc813431e0aff174476f4d4d254c6' + // oracle_nonce_15
        'ecbb4f8f31ba16858a95a4d138e206c8d96126a69b2b7ebb6b2ec9c3a37a9a12' + // oracle_nonce_16
        '8162aed19361e41b0fe4ff1504df2a0bd150d7c96860d08990f12eb65bf5e5da' + // oracle_nonce_17
        'b79e0fe16db4e7a26d9817d7e50a2c37a8c44a330de349d2ce9e33b802aa0f97' + // oracle_nonce_18
        '605d2400' + // event_maturity_epoch
        'fdd80a' + // event_descriptor
        '11' + // length
        '0002' + // base
        '00074254432d55534400000000001213446572696269742d4254432d32364d41523231',
      'hex',
    ),
  );
  const offerCollateralSatoshis = 967482;
  const feeRatePerVb = 30;
  const cetLocktime = 1616723990;
  const refundLocktime = 1616723990;

  const dlcOffer = new DlcOfferV0();
  dlcOffer.contractFlags = Buffer.from('00', 'hex');
  dlcOffer.chainHash = util.chainHash;
  dlcOffer.contractInfo = contractInfo;
  dlcOffer.fundingPubKey = fundingPubKey;
  dlcOffer.payoutSPK = payoutSPK;
  dlcOffer.payoutSerialId = BigInt(11555292);
  dlcOffer.offerCollateralSatoshis = BigInt(offerCollateralSatoshis);
  dlcOffer.fundingInputs = [
    FundingInputV0.deserialize(
      Buffer.from(
        'fda714' +
          '3f' + // length
          '000000000000fa51' + // input_serial_id
          '0029' + // prevtx_len
          '02000000000100c2eb0b00000000160014369d63a82ed846f4d47ad55045e594ab95539d6000000000' + // prevtx
          '00000000' + // prevtx_vout
          'ffffffff' + // sequence
          '006b' + // max_witness_len
          '0000', // redeemscript_len
        'hex',
      ),
    ),
  ];
  dlcOffer.changeSPK = changeSPK;
  dlcOffer.changeSerialId = BigInt(2008045);
  dlcOffer.fundOutputSerialId = BigInt(5411962);
  dlcOffer.feeRatePerVb = BigInt(feeRatePerVb);
  dlcOffer.cetLocktime = cetLocktime;
  dlcOffer.refundLocktime = refundLocktime;

  const orderOffer = new OrderOfferV0();
  orderOffer.chainHash = util.chainHash;
  orderOffer.contractInfo = contractInfo;
  orderOffer.offerCollateralSatoshis = BigInt(offerCollateralSatoshis);
  orderOffer.feeRatePerVb = BigInt(feeRatePerVb);
  orderOffer.cetLocktime = cetLocktime;
  orderOffer.refundLocktime = refundLocktime;

  const contractSize = 1000000;
  const strikePrice = 4000;
  const expiry = 1616716800;
  const premium = 17259;

  before(async () => {
    util.rmdir(argv.datadir);
    server = new Server(app, argv, logger);
    server.start();
    createWallet(server);
  });

  after(async () => {
    util.rmdir(argv.datadir);
    server.stop();
  });

  describe(`POST ${apiFinancePrefix}/${Endpoint.OptionContractInfo}/decode`, () => {
    it('should return option info', (done) => {
      chai
        .request(server.app)
        .post(`/${apiFinancePrefix}/${Endpoint.OptionContractInfo}/decode`)
        .auth('admin', util.apikey)
        .send({
          contractinfo: contractInfo.serialize().toString('hex'),
        })
        .end((err: HttpException, res: request.Response) => {
          expect(err).to.be.null;
          res.should.have.status(200);
          expect(res.body.contractsize).to.equal(contractSize);
          expect(res.body.strikeprice).to.equal(strikePrice);
          expect(res.body.expiry).to.equal(expiry);
          done();
        });
    });
  });

  describe(`POST ${apiFinancePrefix}/${Endpoint.OptionOffer}/decode`, () => {
    it('should return option info using dlcoffer', (done) => {
      chai
        .request(server.app)
        .post(`/${apiFinancePrefix}/${Endpoint.OptionOffer}/decode`)
        .auth('admin', util.apikey)
        .send({
          dlcoffer: dlcOffer.serialize().toString('hex'),
        })
        .end((err: HttpException, res: request.Response) => {
          expect(err).to.be.null;
          res.should.have.status(200);
          expect(res.body.contractsize).to.equal(contractSize);
          expect(res.body.strikeprice).to.equal(strikePrice);
          expect(res.body.premium).to.equal(premium);
          expect(res.body.expiry).to.equal(expiry);
          done();
        });
    });

    it('should return option info using orderoffer', (done) => {
      chai
        .request(server.app)
        .post(`/${apiFinancePrefix}/${Endpoint.OptionOffer}/decode`)
        .auth('admin', util.apikey)
        .send({
          orderoffer: orderOffer.serialize().toString('hex'),
        })
        .end((err: HttpException, res: request.Response) => {
          expect(err).to.be.null;
          res.should.have.status(200);
          expect(res.body.contractsize).to.equal(contractSize);
          expect(res.body.strikeprice).to.equal(strikePrice);
          expect(res.body.premium).to.equal(premium);
          expect(res.body.expiry).to.equal(expiry);
          done();
        });
    });
  });
});