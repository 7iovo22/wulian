const smsCodes = {};

function generateCode(phone) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  smsCodes[phone] = {
    code: code,
    expireTime: Date.now() + 5 * 60 * 1000
  };
  return code;
}

function verifyCode(phone, code) {
  const record = smsCodes[phone];
  if (!record) {
    return { success: false, message: '验证码不存在，请重新获取' };
  }
  if (Date.now() > record.expireTime) {
    delete smsCodes[phone];
    return { success: false, message: '验证码已过期' };
  }
  if (record.code !== code) {
    return { success: false, message: '验证码错误' };
  }
  delete smsCodes[phone];
  return { success: true, message: '验证成功' };
}

module.exports = {
  generateCode,
  verifyCode,
  smsCodes
};