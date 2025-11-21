// Request and response logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Fields to mask in logs (sensitive data)
  const sensitiveFields = ['password', 'token', 'authorization', 'auth'];
  
  // Helper function to mask sensitive data
  const maskSensitiveData = (obj, depth = 0) => {
    if (depth > 5) return '[Max Depth Reached]'; // Prevent infinite recursion
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => maskSensitiveData(item, depth + 1));
    }
    
    const masked = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        masked[key] = '***REDACTED***';
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = maskSensitiveData(value, depth + 1);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  };
  
  // Log incoming request
  const requestLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    query: req.query,
    params: req.params,
    headers: maskSensitiveData({
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'content-length': req.headers['content-length'],
      'accept': req.headers['accept']
    }),
    body: req.body && Object.keys(req.body).length > 0 
      ? maskSensitiveData(req.body) 
      : undefined,
    ip: req.ip || req.connection.remoteAddress,
  };
  
  console.log('\n' + '='.repeat(80));
  console.log('📥 INCOMING REQUEST');
  console.log('='.repeat(80));
  console.log(JSON.stringify(requestLog, null, 2));
  
  // Store original json method
  const originalJson = res.json;
  const originalSend = res.send;
  
  // Override res.json to capture response
  res.json = function(body) {
    const duration = Date.now() - startTime;
    
    const responseLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      body: maskSensitiveData(body),
    };
    
    console.log('\n' + '='.repeat(80));
    console.log('📤 OUTGOING RESPONSE');
    console.log('='.repeat(80));
    console.log(JSON.stringify(responseLog, null, 2));
    console.log('='.repeat(80) + '\n');
    
    // Call original json method
    return originalJson.call(this, body);
  };
  
  // Override res.send to capture response (for non-JSON responses)
  res.send = function(body) {
    const duration = Date.now() - startTime;
    
    let parsedBody = body;
    try {
      if (typeof body === 'string') {
        parsedBody = JSON.parse(body);
      }
    } catch (e) {
      // Not JSON, keep as string but truncate if too long
      parsedBody = typeof body === 'string' && body.length > 200 
        ? body.substring(0, 200) + '...' 
        : body;
    }
    
    const responseLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      body: maskSensitiveData(parsedBody),
    };
    
    console.log('\n' + '='.repeat(80));
    console.log('📤 OUTGOING RESPONSE');
    console.log('='.repeat(80));
    console.log(JSON.stringify(responseLog, null, 2));
    console.log('='.repeat(80) + '\n');
    
    // Call original send method
    return originalSend.call(this, body);
  };
  
  next();
};

module.exports = requestLogger;

