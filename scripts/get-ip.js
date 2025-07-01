const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        console.log('🌐 Tu IP local es:', interface.address);
        console.log('📝 Actualiza LOCAL_IP en config/apiConfig.js con esta IP');
        console.log('📱 Usa esta IP para conectar dispositivos físicos al backend');
        return interface.address;
      }
    }
  }
  
  console.log('❌ No se pudo encontrar una IP válida');
  console.log('💡 Verifica tu conexión de red');
  return null;
}

console.log('=== CONFIGURACIÓN DE IP PARA DISPOSITIVOS FÍSICOS ===');
getLocalIP();
console.log('============================================='); 