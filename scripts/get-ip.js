const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const interfaceName in interfaces) {
    const interface = interfaces[interfaceName];
    
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
    }
  }
  
  return null;
}

console.log('=== CONFIGURACIÓN DE IP PARA DISPOSITIVOS FÍSICOS ===');
getLocalIP();
console.log('============================================='); 