/**
 * Converts Indian Rupee amounts to formal Words representation
 * e.g. 365565 -> "Rupees Three Lakh Sixty-Five Thousand Five Hundred Sixty-Five Only"
 */
export function numberToWordsINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rupees Zero Only';

  const num = Math.floor(Math.abs(amount));
  if (num === 0) return 'Rupees Zero Only';

  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

  function convertGroup(n) {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + 'Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + a[n % 10];
    } else if (n > 0) {
      str += a[n];
    }
    return str;
  }

  let words = '';
  const crore = Math.floor(num / 10000000);
  let rem = num % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  const hundreds = rem;

  if (crore > 0) words += convertGroup(crore) + 'Crore ';
  if (lakh > 0) words += convertGroup(lakh) + 'Lakh ';
  if (thousand > 0) words += convertGroup(thousand) + 'Thousand ';
  if (hundreds > 0) words += convertGroup(hundreds);

  return 'Rupees ' + words.trim() + ' Only';
}
