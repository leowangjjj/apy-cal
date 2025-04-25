import { BigNumber } from 'bignumber.js';

export interface StandardizedData {
    governanceFee: string | number;
    interestRate: string | number;
    currentRound: {
        borrowed: number;
        expected: number;
    };
    previousRound: {
        borrowed: number;
        expected: number;
    };
}

export interface PoolConfig {
    // 資料適配的映射配置
    governanceFeeField?: string;
    interestRateField?: string;
    currentRoundBorrowedField?: string;
    currentRoundExpectedField?: string;
    previousRoundBorrowedField?: string;
    previousRoundExpectedField?: string;
    // 轉換函數
    governanceFeeTransform?: (value: any) => any;
    interestRateTransform?: (value: any) => any;
    currentRoundBorrowedTransform?: (value: any) => any;
    currentRoundExpectedTransform?: (value: any) => any;
    previousRoundBorrowedTransform?: (value: any) => any;
    previousRoundExpectedTransform?: (value: any) => any;
}

/**
 * 將任意結構的資料轉換成標準格式
 * @param data 原始資料
 * @param config 配置選項
 * @returns 標準化後的資料
 */
export function adaptData(data: any, config: PoolConfig = {}): StandardizedData {
    const defaultValue = (value: any, defaultVal: any = 0) => {
        return value !== undefined && value !== null ? value : defaultVal;
    };

    // 透過配置提取資料或使用預設路徑
    const getValue = (obj: any, path: string | undefined, defaultPath: string, transform?: (v: any) => any) => {
        const actualPath = path || defaultPath;
        const parts = actualPath.split('.');
        let current = obj;

        for (const part of parts) {
            if (current === undefined || current === null) return defaultValue(null);
            current = current[part];
        }

        return transform ? transform(current) : defaultValue(current);
    };

    // 建立標準化資料結構
    return {
        governanceFee: getValue(
            data,
            config.governanceFeeField,
            'governanceFee',
            config.governanceFeeTransform
        ),
        interestRate: getValue(
            data,
            config.interestRateField,
            'interestRate',
            config.interestRateTransform
        ),
        currentRound: {
            borrowed: getValue(
                data,
                config.currentRoundBorrowedField,
                'currentRound.borrowed',
                config.currentRoundBorrowedTransform
            ) as number,
            expected: getValue(
                data,
                config.currentRoundExpectedField,
                'currentRound.expected',
                config.currentRoundExpectedTransform
            ) as number
        },
        previousRound: {
            borrowed: getValue(
                data,
                config.previousRoundBorrowedField,
                'previousRound.borrowed',
                config.previousRoundBorrowedTransform
            ) as number,
            expected: getValue(
                data,
                config.previousRoundExpectedField,
                'previousRound.expected',
                config.previousRoundExpectedTransform
            ) as number
        }
    };
}

/**
 * 計算單輪收益率
 */
export function calculateROI(data: StandardizedData): BigNumber | string {
    try {
        const totalExpected = BigNumber(data?.currentRound?.expected || 0).plus(data?.previousRound?.expected || 0);
        const totalBorrowed = BigNumber(data?.currentRound?.borrowed || 0).plus(data?.previousRound?.borrowed || 0);

        // 避免除以零的錯誤
        if (totalBorrowed.isZero()) {
            return '-';
        }

        const totalProfit = totalExpected.minus(totalBorrowed);
        const govFeeFactor = BigNumber(1).minus(BigNumber(data?.governanceFee || 0).div(16777216));

        const roi = totalProfit.times(govFeeFactor).div(totalBorrowed);

        // 檢查計算結果是否有效
        if (roi.isNaN() || !roi.isFinite()) {
            return '-';
        }

        return roi;
    } catch (error) {
        console.error('ROI calculation error:', error);
        return '-';
    }
}

/**
 * 計算年化收益率
 */
export function calculateAPY(data: StandardizedData, rounds: number = 240): string {
    try {
        const roi = calculateROI(data);

        // 如果ROI不是有效數值，返回'-'
        if (roi === '-' || !roi) {
            return '-';
        }

        // APY = (1 + ROI)^rounds - 1
        const result = BigNumber(1).plus(roi).pow(BigNumber(rounds)).minus(1).times(100);

        // 檢查結果是否有效
        if (result.isNaN() || !result.isFinite()) {
            return '-';
        }

        return result.toFixed(5);
    } catch (error) {
        console.error('APY calculation error:', error);
        return '-';
    }
}

/**
 * 格式化TON數值
 */
export function formatTON(value: any): string {
    if (!value) return '-';
    return BigNumber(value).div(1e9).toFixed(5);
}

/**
 * 創建一個特定數據源的適配器工廠
 */
export function createAdapter(config: PoolConfig) {
    return (data: any) => adaptData(data, config);
}

// 預設適配器配置範例
export const adapterConfigs = {
    // KTON適配器配置
    kton: {},

    // 例子: Hipo適配器配置
    hipo: {
        governanceFeeField: 'governanceFee',
        previousRoundBorrowedField: 'lastStaked',
        previousRoundExpectedField: 'lastRecovered',
        currentRoundBorrowedField: 'currentRound.borrowed',
        currentRoundExpectedField: 'currentRound.expected',
        interestRateField: 'interestRate'
    },

    // 自定義適配器配置的例子
    custom: {
        governanceFeeField: 'fees.governance',
        interestRateField: 'rates.interest',
        currentRoundBorrowedField: 'rounds.current.staked',
        currentRoundExpectedField: 'rounds.current.recovered',
        previousRoundBorrowedField: 'rounds.previous.staked',
        previousRoundExpectedField: 'rounds.previous.recovered',
        // 自定義轉換函數例子
        governanceFeeTransform: (value: any) => value ? value / 100 : 0
    }
}; 