const codeStore = new Map();

const CODE_EXPIRE_TIME = 5 * 60 * 1000;

function generateCode(phone) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expireTime = Date.now() + CODE_EXPIRE_TIME;
  codeStore.set(phone, {
    code: code,
    expireTime: expireTime,
    sendTime: Date.now()
  });
  return code;
}

function verifyCode(phone, inputCode) {
  const stored = codeStore.get(phone);
  if (!stored) {
    return {
      success: false,
      message: '验证码不存在，请先获取验证码'
    };
  }

  if (Date.now() > stored.expireTime) {
    codeStore.delete(phone);
    return {
      success: false,
      message: '验证码已过期，请重新获取'
    };
  }

  if (stored.code !== inputCode) {
    return {
      success: false,
      message: '验证码错误，请重新输入'
    };
  }

  codeStore.delete(phone);
  return {
    success: true,
    message: '验证码验证成功'
  };
}

function getStoredCode(phone) {
  const stored = codeStore.get(phone);
  if (!stored || Date.now() > stored.expireTime) {
    return null;
  }
  return stored.code;
}

module.exports = {
  generateCode,
  verifyCode,
  getStoredCode
};