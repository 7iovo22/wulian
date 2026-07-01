let baseLatitude = 30.5728;
let baseLongitude = 104.0668;

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomIntInRange(min, max) {
  return Math.floor(randomInRange(min, max + 1));
}

function formatTime(date) {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function formatDateTime(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function generateNetworkStatus() {
  const signalStrength = randomIntInRange(40, 100);
  const isOnline = Math.random() > 0.05;
  let networkType = '4G';
  if (signalStrength > 80) {
    networkType = '5G';
  } else if (signalStrength < 50) {
    networkType = '3G';
  }

  return {
    signalStrength,
    signalLevel: Math.ceil(signalStrength / 25),
    isOnline,
    networkType,
    updateTime: formatTime(Date.now())
  };
}

function generateSelfCheckList() {
  const sensors = [
    { name: '心率传感器', key: 'heartRate', status: 'normal' },
    { name: '血氧传感器', key: 'bloodOxygen', status: 'normal' },
    { name: '温度传感器', key: 'temperature', status: Math.random() > 0.02 ? 'normal' : 'abnormal' },
    { name: '加速度传感器', key: 'accelerometer', status: 'normal' },
    { name: '陀螺仪', key: 'gyroscope', status: 'normal' },
    { name: 'GPS模块', key: 'gps', status: Math.random() > 0.03 ? 'normal' : 'abnormal' },
    { name: '蓝牙模块', key: 'bluetooth', status: 'normal' },
    { name: '气压传感器', key: 'barometer', status: 'normal' }
  ];

  return sensors.map(sensor => ({
    ...sensor,
    lastCheckTime: formatDateTime(Date.now() - randomIntInRange(60000, 3600000)),
    statusText: sensor.status === 'normal' ? '正常' : '异常'
  }));
}

function generateRiderInfo() {
  return {
    nickname: wx.getStorageSync('userInfo')?.nickname || '骑手小王',
    phone: wx.getStorageSync('userInfo')?.phone || ''
  };
}

function generateTelemetryData() {
  const postureTypes = ['直立', '前倾', '后仰', '左转', '右转'];
  const posture = postureTypes[randomIntInRange(0, postureTypes.length - 1)];
  
  const accX = randomInRange(-2, 2).toFixed(2);
  const accY = randomInRange(-2, 2).toFixed(2);
  const accZ = randomInRange(8, 12).toFixed(2);
  const speed = randomInRange(0, 60).toFixed(1);

  return {
    posture,
    postureAngle: randomIntInRange(-15, 15),
    acceleration: {
      x: accX,
      y: accY,
      z: accZ,
      magnitude: Math.sqrt(Math.pow(parseFloat(accX), 2) + Math.pow(parseFloat(accY), 2) + Math.pow(parseFloat(accZ), 2)).toFixed(2)
    },
    speed,
    speedStatus: parseFloat(speed) > 45 ? '超速' : parseFloat(speed) > 0 ? '行驶中' : '静止'
  };
}

function generateLocationData() {
  baseLatitude += randomInRange(-0.0002, 0.0002);
  baseLongitude += randomInRange(-0.0002, 0.0002);

  return {
    latitude: baseLatitude.toFixed(6),
    longitude: baseLongitude.toFixed(6),
    accuracy: randomInRange(5, 20).toFixed(1),
    altitude: randomInRange(400, 500).toFixed(1),
    speed: randomInRange(0, 60).toFixed(1),
    updateTime: formatTime(Date.now())
  };
}

function generateVitalSigns() {
  const heartRate = randomIntInRange(60, 100);
  const bloodOxygen = randomIntInRange(95, 100);
  const bodyTemp = randomInRange(36.0, 37.2).toFixed(1);

  return {
    heartRate,
    heartRateStatus: heartRate >= 60 && heartRate <= 100 ? 'normal' : 'warning',
    heartRateText: heartRate >= 60 && heartRate <= 100 ? '正常' : '偏高',
    bloodOxygen,
    bloodOxygenStatus: bloodOxygen >= 95 ? 'normal' : 'warning',
    bloodOxygenText: bloodOxygen >= 95 ? '正常' : '偏低',
    bodyTemp,
    bodyTempStatus: parseFloat(bodyTemp) >= 36.0 && parseFloat(bodyTemp) <= 37.2 ? 'normal' : parseFloat(bodyTemp) > 37.2 ? 'warning' : 'danger',
    bodyTempText: parseFloat(bodyTemp) >= 36.0 && parseFloat(bodyTemp) <= 37.2 ? '正常' : parseFloat(bodyTemp) > 37.2 ? '偏高' : '偏低'
  };
}

function generateEnvironmentData() {
  const envTemp = randomInRange(-10, 45).toFixed(1);
  const humidity = randomIntInRange(30, 95);
  
  let rainStatus = '无雨';
  if (humidity > 85) {
    rainStatus = Math.random() > 0.5 ? '小雨' : '可能下雨';
  } else if (humidity > 75) {
    rainStatus = '湿度较高';
  }

  let temperatureStatus = '正常';
  const tempValue = parseFloat(envTemp);
  if (tempValue > 35) {
    temperatureStatus = '高温预警';
  } else if (tempValue > 30) {
    temperatureStatus = '偏热';
  } else if (tempValue < 5) {
    temperatureStatus = '寒冷';
  } else if (tempValue < 15) {
    temperatureStatus = '偏冷';
  }

  return {
    temperature: envTemp,
    humidity,
    rainStatus,
    temperatureStatus,
    pressure: randomInRange(990, 1030).toFixed(0),
    updateTime: formatTime(Date.now())
  };
}

function generateHelmetStatus() {
  const isWorn = Math.random() > 0.15;
  const batteryLevel = randomIntInRange(10, 100);
  return {
    isWorn,
    statusText: isWorn ? '已佩戴' : '未佩戴',
    wearTime: isWorn ? formatDateTime(Date.now() - randomIntInRange(300000, 7200000)) : '--',
    batteryLevel,
    batteryStatus: batteryLevel > 50 ? '充足' : batteryLevel > 20 ? '一般' : '低电量'
  };
}

function generateAllData() {
  return {
    networkStatus: generateNetworkStatus(),
    selfCheckList: generateSelfCheckList(),
    riderInfo: generateRiderInfo(),
    telemetryData: generateTelemetryData(),
    locationData: generateLocationData(),
    vitalSigns: generateVitalSigns(),
    environmentData: generateEnvironmentData(),
    helmetStatus: generateHelmetStatus()
  };
}

module.exports = {
  generateNetworkStatus,
  generateSelfCheckList,
  generateRiderInfo,
  generateTelemetryData,
  generateLocationData,
  generateVitalSigns,
  generateEnvironmentData,
  generateHelmetStatus,
  generateAllData
};