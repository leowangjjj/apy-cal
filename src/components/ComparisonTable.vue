<script setup lang="ts">
import { BigNumber } from 'bignumber.js';
import { computed } from 'vue';

defineProps<{
  services: Array<{
    id: string;
    name: string;
    data: any;
  }>;
}>()

// Helper function to format TON values
const formatTON = (value: any) => {
  if (!value) return '-';
  return BigNumber(value).div(1e9).toFixed(5);
}

// Helper function to calculate ROI
const calculateROI = (data: any) => {
  // if (!data?.currentRound?.expected || !data?.currentRound?.borrowed ||
  //   !data?.previousRound?.expected || !data?.previousRound?.borrowed) {
  //   return '-';
  // }

  // const totalExpected = BigNumber(data?.currentRound?.expected || 0).plus(data?.previousRound?.expected || 0);
  // const totalBorrowed = BigNumber(data?.currentRound?.borrowed || 0).plus(data?.previousRound?.borrowed || 0);
  // const totalProfit = totalExpected.minus(totalBorrowed);
  // const govFeeFactor = BigNumber(1).minus(BigNumber(data?.governanceFee || 0).div(16777216));
  // console.log('totalBorrowed:', totalBorrowed.toString())
  // console.log('totalProfit:', totalProfit.toString())
  // console.log('govFeeFactor:', govFeeFactor.toString())
  // return totalBorrowed.plus(totalProfit.times(govFeeFactor)).div(totalBorrowed)

  const AtotalExpected = BigNumber(data?.currentRound?.expected || 0)
  const AtotalBorrowed = BigNumber(data?.currentRound?.borrowed || 0)
  const AtotalProfit = AtotalExpected.minus(AtotalBorrowed);
  const BtotalExpected = BigNumber(data?.previousRound?.expected || 0)
  const BtotalBorrowed = BigNumber(data?.previousRound?.borrowed || 0)
  const BtotalProfit = BtotalExpected.minus(BtotalBorrowed);
  const govFeeFactor = BigNumber(1).minus(BigNumber(data?.governanceFee || 0).div(16777216));
  console.log(govFeeFactor.toString(), BigNumber(data?.governanceFee || 0).div(16777216).toString())
  return AtotalBorrowed.plus(BtotalBorrowed).plus(AtotalProfit.plus(BtotalProfit).times(govFeeFactor)).div(AtotalBorrowed.plus(BtotalBorrowed))

}

// Helper function to calculate APY
const calculateAPY = (data: any) => {
  const rounds = 481 / 2
  const roi = calculateROI(data);
  if (roi === '-') return '-';

  // APY = (ROI)^(rounds per year) - 1
  // 分解 240.6 為整數部分和小數部分
  const integerPart = Math.floor(rounds); // 240
  const decimalPart = rounds - integerPart; // 0.6

  try {
    // 計算 roi^240
    let result = roi.pow(integerPart);

    // 計算 roi^0.6，使用數學公式: x^y = e^(y * ln(x))
    // 轉換為: roi^0.6 = Math.exp(0.6 * Math.log(roi))
    // 我們需要轉為普通 JavaScript 數字進行計算
    const roiNum = parseFloat(roi.toString());
    if (roiNum <= 0) {
      return '-'; // 處理負數或零的情況
    }

    const decimalPower = Math.exp(decimalPart * Math.log(roiNum));

    // 最終結果 = roi^240 * roi^0.6
    result = result.times(decimalPower);

    // 計算 APY = (結果 - 1) * 100
    return result.minus(1).times(100).toFixed(8)
  } catch (error) {
    console.error('APY calculation error:', error);
    return '-';
  }
}
</script>

<template>
  <div class="comparison-container">
    <h2>APY 比較</h2>

    <div class="comparison-table-wrapper">
      <table class="comparison-table">
        <thead>
          <tr>
            <th class="metric-name">指標</th>
            <th v-for="service in services" :key="service.id">{{ service.name }}</th>
          </tr>
        </thead>
        <tbody>
          <!-- Governance Fee -->
          <tr>
            <td class="metric-name">手續費</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data.governanceFee || '-' }}
            </td>
          </tr>

          <!-- Interest Rate -->
          <tr>
            <td class="metric-name">利率</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data.interestRate || '-' }}
            </td>
          </tr>

          <!-- Previous Round Borrowed -->
          <tr>
            <td class="metric-name">前一輪借出(TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data?.previousRound?.borrowed ? formatTON(service.data.previousRound.borrowed) : '-' }}
            </td>
          </tr>

          <!-- Previous Round Expected -->
          <tr>
            <td class="metric-name">前一輪返還(TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data?.previousRound?.expected ? formatTON(service.data.previousRound.expected) : '-' }}
            </td>
          </tr>
          <tr>
            <td class="metric-name">前一輪利息(TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data?.previousRound?.expected && service.data?.previousRound?.borrowed ?
                formatTON(BigNumber(service.data.previousRound.expected).minus(service.data.previousRound.borrowed)) : '-'
              }}
            </td>
          </tr>
          <!-- Current Round Borrowed -->
          <tr>
            <td class="metric-name">本輪借出(TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data?.currentRound?.borrowed ? formatTON(service.data.currentRound.borrowed) : '-' }}
            </td>
          </tr>

          <!-- Current Round Expected -->
          <tr>
            <td class="metric-name">本輪返還(TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data?.currentRound?.expected ? formatTON(service.data.currentRound.expected) : '-' }}
            </td>
          </tr>
          <tr>
            <td class="metric-name">本輪利息(TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data?.currentRound?.expected && service.data?.currentRound?.borrowed ?
                formatTON(BigNumber(service.data.currentRound.expected).minus(service.data.currentRound.borrowed)) : '-'
              }}
            </td>
          </tr>
          <tr>
            <td class="metric-name">單輪收益率</td>
            <td v-for="service in services" :key="service.id">
              {{ calculateROI(service.data) }}
            </td>
          </tr>
          <tr>
            <td class="metric-name">年化收益率 (%)</td>
            <td v-for="service in services" :key="service.id" class="apy-cell">
              {{ calculateAPY(service.data) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.comparison-container {
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  color: #0062cc;
  margin-bottom: 1rem;
  font-weight: 500;
  text-align: center;
}

.comparison-table-wrapper {
  overflow-x: auto;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.comparison-table th,
.comparison-table td {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid #eaeaea;
  color: #333;
}

.comparison-table th {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #333;
}

.comparison-table tbody tr:hover {
  background-color: #f9fafc;
}

.metric-name {
  text-align: left;
  font-weight: 500;
  color: #666;
}

.apy-cell {
  font-weight: 700;
  color: #0062cc;
}

@media (max-width: 768px) {
  .comparison-container {
    padding: 1rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 0.5rem;
  }
}
</style>