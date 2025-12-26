/**
 * QQ音乐请求签名
 */
const crypto = require('crypto');

const PART_1_INDEXES = [21, 4, 9, 26, 16, 20, 27, 30];
const PART_2_INDEXES = [18, 11, 3, 2, 1, 7, 6, 25];
const SCRAMBLE_VALUES = [21, 4, 9, 26, 16, 20, 27, 30, 18, 11, 3, 2, 1, 7, 6, 25, 13, 22, 19, 14];

/**
 * 生成签名
 * @param {Object} data - 请求数据
 * @returns {string} 签名字符串
 */
function sign(data) {
  const str = JSON.stringify(data);
  const hash = crypto.createHash('sha1').update(str).digest('hex').toUpperCase();

  let part1 = '';
  for (const i of PART_1_INDEXES) {
    if (i < hash.length) {
      part1 += hash[i];
    }
  }

  let part2 = '';
  for (const i of PART_2_INDEXES) {
    if (i < hash.length) {
      part2 += hash[i];
    }
  }

  const part3Buffer = Buffer.alloc(20);
  for (let i = 0; i < SCRAMBLE_VALUES.length && i * 2 + 1 < hash.length; i++) {
    const hexValue = parseInt(hash.substring(i * 2, i * 2 + 2), 16);
    part3Buffer[i] = SCRAMBLE_VALUES[i] ^ hexValue;
  }
  const b64Part = part3Buffer.toString('base64').replace(/[\/\\+=]/g, '');

  return `zzc${part1}${b64Part}${part2}`.toLowerCase();
}

module.exports = { sign };
