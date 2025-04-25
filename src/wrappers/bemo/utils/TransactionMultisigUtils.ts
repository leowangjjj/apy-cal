import {Address, beginCell, Cell, toNano} from "@ton/core";


export const TransactionMultisigOpcodes = {
    deposit: 0x7d9d71fe,
    returnTon: 0x243d1d70
}

export function getSendTonFromFinancialPayload(
    validatorAddress: string,
    validatorRewardPercent: number,
    maxNominatorsCount: number,
    minValidatorStake: number,
    minNominatorStake: number,
    amountInTon: number,
    walletId?: number
): Cell {
    if (validatorRewardPercent > 100 && validatorRewardPercent < 0) {
        throw new Error("invalid percentage")
    }
    return beginCell()
        .storeUint(TransactionMultisigOpcodes.deposit, 32)
        .storeAddress(Address.parse(validatorAddress))
        .storeUint(validatorRewardPercent * 100, 16)
        .storeUint(maxNominatorsCount, 16)
        .storeCoins(toNano(minValidatorStake))
        .storeCoins(toNano(minNominatorStake))
        .storeUint(walletId ?? 0, 32)
        .storeCoins(toNano(amountInTon))
        .endCell()
}

export function getReturnTonPayload(destinationAddress: string): Cell {
    return beginCell()
        .storeUint(TransactionMultisigOpcodes.returnTon, 32)
        .storeAddress(Address.parse(destinationAddress))
        .endCell()
}
