tests({
  '1. precision 2: 10.235 => 10.24': function () {
    eq(toFixed(10.235, 2), '10.24');
  },
  '2.  precision 2: 0.615 => 0.62': function () {
    eq(toFixed(0.615, 2), '0.62');
  },
  '3.  precision 2: 1.005 => 1.01': function () {
    eq(toFixed(1.005, 2), '1.01');
  },
  '4.  precision 0: 10 => 10': function () {
    eq(toFixed(10, 0), '10');
  },
  '5.  precision 2: 10 => 10.00': function () {
    eq(toFixed(10, 2), '10.00');
  },
  '6.  precision 6: 10.235 => 10.235000': function () {
    eq(toFixed(10.235, 6), '10.235000');
  },
  '7.  precision 2: 10.535 => 11': function () {
    eq(toFixed(10.535, 0), '11');
  },
  '8.  precision 5: 102315.12345 => 102315.12345': function () {
    eq(toFixed(102315.12345, 5), '102315.12345');
  },
  '9.  precision 0: 0.4 => 0': function () {
    eq(toFixed(0.4, 0), '0');
  },
  '10.  precision 0: 0.5 => 1': function () {
    eq(toFixed(0.5, 0), '1');
  },
  '11. precision 2: -10.235 => -10.24': function () {
    eq(toFixed(-10.235, 2), '-10.24');
  },
  '12.  precision 2: -0.615 => -0.62': function () {
    eq(toFixed(-0.615, 2), '-0.62');
  },
  '13.  precision 2: -1.005 => -1.01': function () {
    eq(toFixed(-1.005, 2), '-1.01');
  },
  '14.  precision 0: -10 => -10': function () {
    eq(toFixed(-10, 0), '-10');
  },
  '15.  precision 2: -10 => -10.00': function () {
    eq(toFixed(-10, 2), '-10.00');
  },
  '16.  precision 6: -10.235 => -10.235000': function () {
    eq(toFixed(-10.235, 6), '-10.235000');
  },
  '17.  precision 2: -10.535 => -11': function () {
    eq(toFixed(-10.535, 0), '-11');
  },
  '18.  precision 5: -102315.12345 => -102315.12345': function () {
    eq(toFixed(-102315.12345, 5), '-102315.12345');
  },
  '19.  precision 0: -0.5 => -1': function () {
    eq(toFixed(-0.5, 0), '-1');
  },
  '20.  precision 0: -0.4 => 0': function () {
    eq(toFixed(-0.4, 0), '0');
  },
});
