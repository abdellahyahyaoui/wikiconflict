const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const cmsRoutes = require('./routes/cms');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const usersFile = path.join(dataDir, 'users.json');
const isFirstRun = !fs.existsSync(usersFile);
if (isFirstRun) {
  const bcrypt = require('bcryptjs');
  const crypto = require('crypto');
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || crypto.randomBytes(12).toString('base64').slice(0, 16);
  
  const defaultAdmin = {
    users: [
      {
        id: 'admin',
        username: 'admin',
        password: bcrypt.hashSync(initialPassword, 10),
        role: 'admin',
        name: 'Administrador',
        countries: ['all'],
        permissions: {
          canCreate: true,
          canEdit: true,
          canDelete: true,
          requiresApproval: false
        },
        createdAt: new Date().toISOString(),
        mustChangePassword: true
      }
    ]
  };
  fs.writeFileSync(usersFile, JSON.stringify(defaultAdmin, null, 2));
  
  console.log('\n=== PRIMERA EJECUCION ===');
  console.log('Usuario administrador creado:');
  console.log('  Usuario: admin');
  console.log(`  Contraseña: ${initialPassword}`);
  console.log('IMPORTANTE: Cambie esta contraseña inmediatamente desde el panel de admin.');
  console.log('===========================\n');
}

const pendingFile = path.join(dataDir, 'pending-changes.json');
if (!fs.existsSync(pendingFile)) {
  fs.writeFileSync(pendingFile, JSON.stringify({ changes: [] }, null, 2));
}

app.use('/api/auth', authRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../public/imagenes')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CMS Server running on port ${PORT}`);
});
