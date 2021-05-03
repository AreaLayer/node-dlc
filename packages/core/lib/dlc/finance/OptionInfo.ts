import {
  ContractInfo,
  ContractInfoV0,
  ContractDescriptorV1,
  PayoutFunctionV0,
  MessageType,
  HyperbolaPayoutCurvePiece,
} from '@node-dlc/messaging';

export type OptionInfo = {
  contractSize: bigint;
  strikePrice: bigint;
  expiry: Date;
};

export function getOptionInfo(_contractInfo: ContractInfo): OptionInfo {
  if (_contractInfo.type !== MessageType.ContractInfoV0)
    throw Error('Only ContractDescriptorV0 currently supported');

  const contractInfo = _contractInfo as ContractInfoV0;
  if (contractInfo.contractDescriptor.type !== MessageType.ContractDescriptorV1)
    throw Error('Only ContractDescriptorV1 currently supported');

  const oracleInfo = contractInfo.oracleInfo;
  const { eventMaturityEpoch } = oracleInfo.announcement.oracleEvent;

  const contractDescriptor = contractInfo.contractDescriptor as ContractDescriptorV1;
  if (contractDescriptor.payoutFunction.type !== MessageType.PayoutFunctionV0)
    throw Error('Only PayoutFunctionV0 currently supported');

  const payoutFunction = contractDescriptor.payoutFunction as PayoutFunctionV0;
  if (payoutFunction.pieces.length === 0)
    throw Error('PayoutFunction must have at least once PayoutCurvePiece');
  if (payoutFunction.pieces.length > 1)
    throw Error('More than one PayoutCurvePiece not supported');

  const payoutCurvePiece = payoutFunction.pieces[0]
    .payoutCurvePiece as HyperbolaPayoutCurvePiece;
  if (payoutCurvePiece.type !== MessageType.HyperbolaPayoutCurvePiece)
    throw Error('Must be HyperbolaPayoutCurvePiece');
  if (payoutCurvePiece.b !== BigInt(0) || payoutCurvePiece.c !== BigInt(0))
    throw Error('b and c HyperbolaPayoutCurvePiece values must be 0');

  const totalCollateral = contractInfo.totalCollateral;
  const contractSize = totalCollateral + payoutCurvePiece.translatePayout;
  const strikePrice = payoutCurvePiece.d / contractSize;
  const expiry = new Date(eventMaturityEpoch * 1000);

  return { contractSize, strikePrice, expiry };
}
