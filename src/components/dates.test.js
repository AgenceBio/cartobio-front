import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { ddmmmmyyyy, dateFormat, monthYearDateFormat, mmyyyy, now } from "./dates.js"

const dateNow = new Date('2021-01-01T09:00:00')

afterAll(() => vi.useRealTimers())
beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(dateNow)
})

describe('ddmmmmyyyy', () => {
  test('returns a day longmonth year value', () => {
    expect(ddmmmmyyyy()).toEqual('')
    expect(ddmmmmyyyy(dateNow)).toEqual('1 janvier 2021')
  })
})

describe('dateFormat', () => {
  test('returns a day shortmonth year value', () => {
    expect(dateFormat()).toEqual('')
    expect(dateFormat(dateNow)).toEqual('1 janv. 2021')
  })
})

describe('monthYearDateFormat', () => {
  test('returns a longmonth year value', () => {
    expect(monthYearDateFormat()).toEqual('')
    expect(monthYearDateFormat(dateNow)).toEqual('janvier 2021')
  })
})

describe('mmyyyy', () => {
  test('returns a monthnumber/year value', () => {
    expect(mmyyyy()).toEqual('')
    expect(mmyyyy(dateNow)).toEqual('01/2021')
  })
})

describe('now', () => {
  test('returns an ISO String of the current time', () => {
    expect(now()).toEqual(dateNow.toISOString())
  })
})
