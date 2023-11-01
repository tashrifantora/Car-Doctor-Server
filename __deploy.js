/* 
===//===//===//===//===//===//
    Server Site Deploy
===//===//===//===//===//===//

**1. Varcel Cnfig
==> {
    "version": 2,
    "builds": [
        {
            "src": "./index.js",
            "use": "@vercel/node"
        }
    ],
    "routes": [
        {
            "src": "/(.*)",
            "dest": "/",
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
        }
    ]
}

**2. if you use cookies in cors site:  then use firebase URL
**3. Set enviroment variable


*/