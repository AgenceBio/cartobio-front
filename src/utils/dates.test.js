import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import { ddmmmmyyyy, dateFormat, monthYearDateFormat, mmyyyy, now, onValidDate } from "./dates.js";

const dateNow = new Date("2021-01-01T09:00:00.000+02:00");

afterAll(() => vi.useRealTimers());
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(dateNow);
});

describe("onValidDate", () => {
  const fn = vi.fn().mockImplementation((d) => d);

  beforeAll(() => fn.mockClear());

  test("applies callback on valid date", () => {
    expect(onValidDate("2023-01-01", fn)).toEqual(new Date("2023-01-01"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("returns an empty string on invalid date", () => {
    expect(onValidDate(undefined, fn)).toEqual("");
    expect(onValidDate("", fn)).toEqual("");
    expect(onValidDate("2023-04-00", fn)).toEqual("");

    expect(fn).not.toHaveBeenCalled();
  });
});

describe("ddmmmmyyyy", () => {
  test("returns a day longmonth year value", () => {
    expect(ddmmmmyyyy()).toEqual("");
    expect(ddmmmmyyyy(dateNow)).toEqual("1 janvier 2021");
  });
});

describe("dateFormat", () => {
  test("returns a day shortmonth year value", () => {
    expect(dateFormat()).toEqual("");
    expect(dateFormat(dateNow)).toEqual("01/01/2021");
  });
});

describe("monthYearDateFormat", () => {
  test("returns a longmonth year value", () => {
    expect(monthYearDateFormat()).toEqual("");
    expect(monthYearDateFormat(dateNow)).toEqual("janvier 2021");
  });
});

describe("mmyyyy", () => {
  test("returns a monthnumber/year value", () => {
    expect(mmyyyy()).toEqual("");
    expect(mmyyyy(dateNow)).toEqual("01/2021");
  });
});

describe("now", () => {
  test("returns an ISO String of the current time", () => {
    expect(now()).toEqual(dateNow.toISOString());
  });
});
