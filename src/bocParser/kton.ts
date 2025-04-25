import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano, TupleBuilder, Dictionary, DictionaryValue, Message, storeMessage, TupleReader } from '@ton/core';

export abstract class PoolState {
    static readonly NORMAL = 0;
    static readonly REPAYMENT_ONLY = 1;
}

type State = typeof PoolState.NORMAL | typeof PoolState.REPAYMENT_ONLY;


type RoundData = {
    borrowers: Cell | null, roundId: number,
    activeBorrowers: bigint, borrowed: bigint,
    expected: bigint, returned: bigint,
    profit: bigint
};
function readRoundData(tup: TupleReader): RoundData {
    if (typeof tup.peek()?.type === 'string') {
        let borrowers = tup.readCellOpt();
        let roundId = tup.readNumber();
        let activeBorrowers = tup.readBigNumber();
        let borrowed = tup.readBigNumber();
        let expected = tup.readBigNumber();
        let returned = tup.readBigNumber();
        let profit = tup.readBigNumber();
        return {
            borrowers,
            roundId,
            activeBorrowers,
            borrowed,
            expected,
            returned,
            profit,
        }
    }

    let borrowers: Cell | null = tup.pop() as any;
    if ((borrowers as any)?.length === 0) borrowers = null;
    let roundId = Number(tup.pop());
    let activeBorrowers = tup.pop() as unknown as bigint;
    let borrowed = tup.pop() as unknown as bigint;
    let expected = tup.pop() as unknown as bigint;
    let returned = tup.pop() as unknown as bigint;
    let profit = tup.pop() as unknown as bigint;
    return {
        borrowers,
        roundId,
        activeBorrowers,
        borrowed,
        expected,
        returned,
        profit,
    }
}

export async function getKTONFullData(provider: ContractProvider) {
    let { stack } = await provider.get('get_pool_full_data', []);
    let new_contract_version = stack.remaining == 34;
    let state = stack.readNumber() as State;
    let halted = stack.readBoolean();
    let totalBalance = stack.readBigNumber();
    let interestRate = stack.readNumber();
    let optimisticDepositWithdrawals = stack.readBoolean();
    let depositsOpen = stack.readBoolean();
    let instantWithdrawalFee = 0;
    if (new_contract_version) {
        instantWithdrawalFee = stack.readNumber();
    }
    let savedValidatorSetHash = stack.readBigNumber();

    let prv = stack.readTuple();
    let previousRound = readRoundData(prv);

    let cur = stack.readTuple();
    let currentRound = readRoundData(cur);

    let minLoan = stack.readBigNumber();
    let maxLoan = stack.readBigNumber();
    let governanceFee = stack.readNumber();

    let accruedGovernanceFee = 0n;
    let disbalanceTolerance = 30;
    let creditStartPriorElectionsEnd = 0;
    if (new_contract_version) {
        accruedGovernanceFee = stack.readBigNumber();
        disbalanceTolerance = stack.readNumber();
        creditStartPriorElectionsEnd = stack.readNumber();
    }

    let poolJettonMinter = stack.readAddress();
    let poolJettonSupply = stack.readBigNumber();

    let depositPayout = stack.readAddressOpt();
    let requestedForDeposit = stack.readBigNumber();

    let withdrawalPayout = stack.readAddressOpt();
    let requestedForWithdrawal = stack.readBigNumber();

    let sudoer = stack.readAddress();
    let sudoerSetAt = stack.readNumber();

    let governor = stack.readAddress();
    let governorUpdateAfter = stack.readNumber();
    let interestManager = stack.readAddress();
    let halter = stack.readAddress();
    let approver = stack.readAddress();

    let controllerCode = stack.readCell();
    let jettonWalletCode = stack.readCell();
    let payoutMinterCode = stack.readCell();

    let projectedTotalBalance = stack.readBigNumber();
    let projectedPoolSupply = stack.readBigNumber();

    return {
        state, halted,
        totalBalance, interestRate,
        optimisticDepositWithdrawals, depositsOpen, instantWithdrawalFee,
        savedValidatorSetHash,

        previousRound, currentRound,

        minLoan, maxLoan,
        governanceFee, accruedGovernanceFee,
        disbalanceTolerance, creditStartPriorElectionsEnd,

        poolJettonMinter, poolJettonSupply, supply: poolJettonSupply,
        depositPayout, requestedForDeposit,
        withdrawalPayout, requestedForWithdrawal,

        sudoer, sudoerSetAt,
        governor, governorUpdateAfter,
        interestManager,
        halter,
        approver,

        controllerCode,
        jettonWalletCode,
        payoutMinterCode,
        projectedTotalBalance,
        projectedPoolSupply,
    };
}