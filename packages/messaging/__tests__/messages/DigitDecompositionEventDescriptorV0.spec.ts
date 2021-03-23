import { expect } from 'chai';
import { DigitDecompositionEventDescriptorV0 } from '../../lib/messages/EventDescriptor';

describe('DigitDecompositionEventDescriptorV0', () => {
  describe('serialize', () => {
    it('serializes', () => {
      const instance = new DigitDecompositionEventDescriptorV0();

      instance.length = BigInt(16);
      instance.base = BigInt(2);
      instance.isSigned = false;
      instance.unit = 'btc/usd';
      instance.precision = 0;
      instance.nbDigits = 17;

      expect(instance.serialize().toString("hex")).to.equal(
        'fdd80a' + // type
        '10' + // length
        '02' + // base
        '00' + // isSigned
        '07' + // unit_Len
        '6274632f757364' + // btc/usd (unit)
        '00000000' + // precision
        '0011' // nb_digits
      ); // prettier-ignore
    });
  });

  describe('deserialize', () => {
    it('deserializes', () => {
      const buf = Buffer.from(
        'fdd80a' + // type
        '10' + // length
        '02' + // base
        '00' + // isSigned
        '07' + // unit_Len
        '6274632f757364' + // btc/usd (unit)
        '00000000' + // precision
        '0011' // nb_digits
        , "hex"
      ); // prettier-ignore

      const instance = DigitDecompositionEventDescriptorV0.deserialize(buf);

      expect(Number(instance.length)).to.equal(16);
      expect(Number(instance.base)).to.equal(2);
      expect(instance.isSigned).to.equal(false);
      expect(instance.unit).to.equal('btc/usd');
      expect(instance.precision).to.equal(0);
      expect(instance.nbDigits).to.equal(17);
    });
  });
});
