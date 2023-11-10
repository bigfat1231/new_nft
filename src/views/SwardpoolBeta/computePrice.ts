import NP from 'number-precision'

export const calculateOutA = (inputB: number, balanceA: number, balanceB: number, price = 0) => {
  const o_a = NP.times(NP.round(NP.times(inputB, NP.divide(balanceA, balanceB)), price))
  return NP.times(o_a, 1 - 0.01)
}

export const calculateOutB = (inputA: number, balanceA: number, balanceB: number, price = 0) => {
  const o_b = NP.round(NP.times(inputA, NP.divide(balanceB, balanceA)), price)
  return NP.times(o_b, 1 - 0.01)
}