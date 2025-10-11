# Shared Workspaces & Collaboration

## Casos de Uso

### 1. **Multi-Cashflow por Usuario**
Un usuario puede tener varios cashflows independientes:
- **Personal** (uso privado)
- **Empresa A** (negocio 1)
- **Empresa B** (negocio 2)
- **Familia** (gastos del hogar)

### 2. **Cashflows Compartidos**
Varios usuarios trabajan en el mismo cashflow:
- **Equipo financiero** (3 contadores + 1 CFO)
- **Pareja** (ambos gestionan finanzas del hogar)
- **Socios** (múltiples propietarios de empresa)

### 3. **Roles y Permisos**
Control granular sobre quién puede hacer qué:
- **Owner** (propietario, control total)
- **Admin** (puede editar y compartir)
- **Editor** (puede editar datos)
- **Viewer** (solo lectura)

---

## Arquitectura Propuesta

### Modelo de Datos

#### 1. Workspaces (Nuevo)
```javascript
// models/Workspace.js
const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // Ej: "Finanzas Personales", "Empresa ABC S.L."
  },

  description: String,

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
    // Usuario que creó el workspace
  },

  type: {
    type: String,
    enum: ['personal', 'business', 'family', 'team'],
    default: 'personal'
  },

  icon: String,
  color: String,

  settings: {
    defaultCurrency: { type: String, default: 'EUR' },
    timezone: { type: String, default: 'Europe/Madrid' },
    fiscalYearStart: { type: Number, default: 1 }, // 1 = enero
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

#### 2. WorkspaceMembers (Nuevo)
```javascript
// models/WorkspaceMember.js
const workspaceMemberSchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  role: {
    type: String,
    enum: ['owner', 'admin', 'editor', 'viewer'],
    default: 'viewer'
  },

  permissions: {
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canInvite: { type: Boolean, default: false },
    canExport: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: true }
  },

  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  invitedAt: { type: Date, default: Date.now },
  acceptedAt: Date,

  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  }
});

// Índice compuesto para búsquedas rápidas
workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });
```

#### 3. Cashflow (Modificado)
```javascript
// models/Cashflow.js - ANTES
const cashflowSchema = new mongoose.Schema({
  userId: ObjectId,  // ← Solo un usuario
  year: Number,
  months: [...]
});

// models/Cashflow.js - DESPUÉS
const cashflowSchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
    // ← Ahora pertenece a un workspace, no a un usuario
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Usuario que creó ESTE cashflow (año específico)
    // Pero acceso controlado por WorkspaceMembers
  },

  year: Number,
  months: [...],

  // Metadata de colaboración
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedAt: Date,

  version: { type: Number, default: 1 } // Para control de versiones
});

cashflowSchema.index({ workspaceId: 1, year: 1 }, { unique: true });
```

#### 4. Categories & Transactions (Modificado)
```javascript
// Igual que Cashflow, se asocian a workspace
const categorySchema = new mongoose.Schema({
  workspaceId: ObjectId, // ← Workspace en lugar de userId
  name: String,
  type: String,
  color: String
});

const transactionSchema = new mongoose.Schema({
  workspaceId: ObjectId, // ← Workspace
  createdBy: ObjectId,   // Usuario que la creó
  amount: Number,
  date: Date,
  category: ObjectId
});
```

---

## API Endpoints

### Workspaces

```javascript
// POST /api/workspaces
// Crear nuevo workspace
router.post('/workspaces', authMiddleware, async (req, res) => {
  const { name, description, type, icon, color } = req.body;

  const workspace = await Workspace.create({
    name,
    description,
    type,
    icon,
    color,
    ownerId: req.userId
  });

  // Auto-añadir al creador como owner
  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId: req.userId,
    role: 'owner',
    status: 'active',
    permissions: {
      canEdit: true,
      canDelete: true,
      canInvite: true,
      canExport: true,
      canViewReports: true
    }
  });

  res.json(workspace);
});

// GET /api/workspaces
// Listar workspaces del usuario autenticado
router.get('/workspaces', authMiddleware, async (req, res) => {
  const memberships = await WorkspaceMember.find({
    userId: req.userId,
    status: 'active'
  }).populate('workspaceId');

  const workspaces = memberships.map(m => ({
    ...m.workspaceId.toObject(),
    myRole: m.role,
    myPermissions: m.permissions
  }));

  res.json(workspaces);
});

// GET /api/workspaces/:workspaceId
// Detalle de workspace (solo si eres miembro)
router.get('/workspaces/:workspaceId', authMiddleware, checkWorkspaceAccess, async (req, res) => {
  const workspace = await Workspace.findById(req.params.workspaceId);
  const members = await WorkspaceMember.find({
    workspaceId: workspace._id,
    status: 'active'
  }).populate('userId', 'name email');

  res.json({
    workspace,
    members,
    myRole: req.workspaceMember.role,
    myPermissions: req.workspaceMember.permissions
  });
});

// PUT /api/workspaces/:workspaceId
// Actualizar workspace (solo owner/admin)
router.put('/workspaces/:workspaceId', authMiddleware, checkWorkspaceRole(['owner', 'admin']), async (req, res) => {
  const workspace = await Workspace.findByIdAndUpdate(
    req.params.workspaceId,
    { ...req.body, updatedAt: Date.now() },
    { new: true }
  );
  res.json(workspace);
});

// DELETE /api/workspaces/:workspaceId
// Eliminar workspace (solo owner)
router.delete('/workspaces/:workspaceId', authMiddleware, checkWorkspaceRole(['owner']), async (req, res) => {
  // Eliminar workspace y TODOS los datos asociados
  await Workspace.findByIdAndDelete(req.params.workspaceId);
  await WorkspaceMember.deleteMany({ workspaceId: req.params.workspaceId });
  await Cashflow.deleteMany({ workspaceId: req.params.workspaceId });
  await Category.deleteMany({ workspaceId: req.params.workspaceId });
  await Transaction.deleteMany({ workspaceId: req.params.workspaceId });

  res.json({ message: 'Workspace eliminado' });
});
```

### Invitaciones

```javascript
// POST /api/workspaces/:workspaceId/invite
// Invitar usuario a workspace
router.post('/workspaces/:workspaceId/invite', authMiddleware, checkWorkspacePermission('canInvite'), async (req, res) => {
  const { email, role = 'viewer' } = req.body;

  // Buscar usuario por email
  const invitedUser = await User.findOne({ email });

  if (!invitedUser) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Verificar que no sea miembro ya
  const existing = await WorkspaceMember.findOne({
    workspaceId: req.params.workspaceId,
    userId: invitedUser._id
  });

  if (existing) {
    return res.status(400).json({ message: 'Usuario ya es miembro' });
  }

  // Definir permisos según rol
  let permissions = {};
  switch(role) {
    case 'owner':
    case 'admin':
      permissions = {
        canEdit: true,
        canDelete: true,
        canInvite: true,
        canExport: true,
        canViewReports: true
      };
      break;
    case 'editor':
      permissions = {
        canEdit: true,
        canDelete: false,
        canInvite: false,
        canExport: true,
        canViewReports: true
      };
      break;
    case 'viewer':
      permissions = {
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canExport: true,
        canViewReports: true
      };
      break;
  }

  // Crear invitación
  const member = await WorkspaceMember.create({
    workspaceId: req.params.workspaceId,
    userId: invitedUser._id,
    role,
    permissions,
    invitedBy: req.userId,
    status: 'pending'
  });

  // TODO: Enviar email de invitación

  res.json(member);
});

// POST /api/workspaces/:workspaceId/accept
// Aceptar invitación a workspace
router.post('/workspaces/:workspaceId/accept', authMiddleware, async (req, res) => {
  const member = await WorkspaceMember.findOneAndUpdate(
    {
      workspaceId: req.params.workspaceId,
      userId: req.userId,
      status: 'pending'
    },
    {
      status: 'active',
      acceptedAt: Date.now()
    },
    { new: true }
  );

  if (!member) {
    return res.status(404).json({ message: 'Invitación no encontrada' });
  }

  res.json(member);
});

// DELETE /api/workspaces/:workspaceId/members/:userId
// Remover miembro (owner/admin) o abandonar workspace (cualquiera)
router.delete('/workspaces/:workspaceId/members/:userId', authMiddleware, async (req, res) => {
  const isSelf = req.userId.toString() === req.params.userId;

  if (!isSelf) {
    // Verificar que tenga permiso para remover otros
    const requester = await WorkspaceMember.findOne({
      workspaceId: req.params.workspaceId,
      userId: req.userId
    });

    if (!['owner', 'admin'].includes(requester.role)) {
      return res.status(403).json({ message: 'No autorizado' });
    }
  }

  await WorkspaceMember.findOneAndDelete({
    workspaceId: req.params.workspaceId,
    userId: req.params.userId
  });

  res.json({ message: 'Miembro removido' });
});

// PUT /api/workspaces/:workspaceId/members/:userId/role
// Cambiar rol de miembro (solo owner)
router.put('/workspaces/:workspaceId/members/:userId/role', authMiddleware, checkWorkspaceRole(['owner']), async (req, res) => {
  const { role } = req.body;

  const member = await WorkspaceMember.findOneAndUpdate(
    {
      workspaceId: req.params.workspaceId,
      userId: req.params.userId
    },
    { role },
    { new: true }
  );

  res.json(member);
});
```

### Cashflow (Modificado)

```javascript
// GET /api/workspaces/:workspaceId/cashflow?year=2025
// Obtener cashflow de un workspace
router.get('/workspaces/:workspaceId/cashflow', authMiddleware, checkWorkspaceAccess, async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;

  const cashflow = await Cashflow.findOne({
    workspaceId: req.params.workspaceId,
    year: parseInt(year)
  });

  res.json(cashflow || {});
});

// POST /api/workspaces/:workspaceId/cashflow
// Guardar cashflow (requiere canEdit)
router.post('/workspaces/:workspaceId/cashflow', authMiddleware, checkWorkspacePermission('canEdit'), async (req, res) => {
  const { year, months } = req.body;

  const cashflow = await Cashflow.findOneAndUpdate(
    {
      workspaceId: req.params.workspaceId,
      year
    },
    {
      months,
      lastModifiedBy: req.userId,
      lastModifiedAt: Date.now(),
      $inc: { version: 1 }
    },
    { upsert: true, new: true }
  );

  res.json(cashflow);
});
```

---

## Middleware de Permisos

```javascript
// middleware/workspaceMiddleware.js

// Verificar que el usuario tenga acceso al workspace
exports.checkWorkspaceAccess = async (req, res, next) => {
  try {
    const member = await WorkspaceMember.findOne({
      workspaceId: req.params.workspaceId,
      userId: req.userId,
      status: 'active'
    });

    if (!member) {
      return res.status(403).json({ message: 'No tienes acceso a este workspace' });
    }

    req.workspaceMember = member;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verificando acceso' });
  }
};

// Verificar que el usuario tenga un rol específico
exports.checkWorkspaceRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const member = await WorkspaceMember.findOne({
        workspaceId: req.params.workspaceId,
        userId: req.userId,
        status: 'active'
      });

      if (!member || !allowedRoles.includes(member.role)) {
        return res.status(403).json({ message: 'No tienes permisos suficientes' });
      }

      req.workspaceMember = member;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error verificando rol' });
    }
  };
};

// Verificar permiso específico
exports.checkWorkspacePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const member = await WorkspaceMember.findOne({
        workspaceId: req.params.workspaceId,
        userId: req.userId,
        status: 'active'
      });

      if (!member || !member.permissions[permission]) {
        return res.status(403).json({ message: `No tienes permiso: ${permission}` });
      }

      req.workspaceMember = member;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error verificando permiso' });
    }
  };
};
```

---

## Frontend: Selector de Workspace

```javascript
// components/WorkspaceSelector/WorkspaceSelector.jsx
import React, { useState, useEffect } from 'react';
import { Briefcase, Users, Home, Plus, ChevronDown } from 'lucide-react';

const WorkspaceSelector = ({ onWorkspaceChange }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/workspaces', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setWorkspaces(data);

    // Cargar último workspace usado
    const lastWorkspaceId = localStorage.getItem('last-workspace-id');
    const last = data.find(w => w._id === lastWorkspaceId);
    setCurrentWorkspace(last || data[0]);
  };

  const handleWorkspaceChange = (workspace) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('last-workspace-id', workspace._id);
    setShowDropdown(false);
    onWorkspaceChange(workspace);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'business': return <Briefcase size={18} />;
      case 'family': return <Home size={18} />;
      case 'team': return <Users size={18} />;
      default: return <Briefcase size={18} />;
    }
  };

  return (
    <div className="workspace-selector">
      <button
        className="workspace-selector-btn"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="workspace-info">
          {getIcon(currentWorkspace?.type)}
          <span className="workspace-name">{currentWorkspace?.name || 'Seleccionar'}</span>
        </div>
        <ChevronDown size={16} />
      </button>

      {showDropdown && (
        <div className="workspace-dropdown">
          {workspaces.map(workspace => (
            <button
              key={workspace._id}
              className={`workspace-item ${currentWorkspace?._id === workspace._id ? 'active' : ''}`}
              onClick={() => handleWorkspaceChange(workspace)}
            >
              <div className="workspace-item-icon">
                {getIcon(workspace.type)}
              </div>
              <div className="workspace-item-info">
                <span className="workspace-item-name">{workspace.name}</span>
                <span className="workspace-item-role">{workspace.myRole}</span>
              </div>
            </button>
          ))}

          <div className="workspace-dropdown-divider" />

          <button className="workspace-item workspace-create">
            <Plus size={18} />
            <span>Crear Workspace</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelector;
```

---

## Migración de Datos

### Script de Migración

```javascript
// scripts/migrateToWorkspaces.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');
const Cashflow = require('../models/Cashflow');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log('🚀 Iniciando migración a workspaces...');

  // 1. Obtener todos los usuarios
  const users = await User.find({});

  for (const user of users) {
    console.log(`Migrando usuario: ${user.email}`);

    // 2. Crear workspace personal para cada usuario
    const workspace = await Workspace.create({
      name: `${user.name} - Personal`,
      description: 'Workspace personal',
      ownerId: user._id,
      type: 'personal',
      settings: {
        defaultCurrency: 'EUR',
        timezone: 'Europe/Madrid'
      }
    });

    // 3. Añadir usuario como owner del workspace
    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: user._id,
      role: 'owner',
      status: 'active',
      permissions: {
        canEdit: true,
        canDelete: true,
        canInvite: true,
        canExport: true,
        canViewReports: true
      }
    });

    // 4. Migrar cashflows de userId a workspaceId
    await Cashflow.updateMany(
      { userId: user._id },
      {
        $set: { workspaceId: workspace._id },
        $unset: { userId: "" } // Opcional: remover userId
      }
    );

    // 5. Migrar categories, transactions, etc.
    await Category.updateMany(
      { userId: user._id },
      { $set: { workspaceId: workspace._id } }
    );

    await Transaction.updateMany(
      { userId: user._id },
      { $set: { workspaceId: workspace._id } }
    );

    console.log(`✅ Usuario migrado: ${user.email}`);
  }

  console.log('🎉 Migración completada');
  process.exit(0);
}

migrate().catch(console.error);
```

**Ejecutar:**
```bash
cd backend
node scripts/migrateToWorkspaces.js
```

---

## Ejemplos de Uso

### Caso 1: Usuario con múltiples empresas

```javascript
// Usuario crea 3 workspaces
POST /api/workspaces
{
  "name": "Finanzas Personales",
  "type": "personal"
}

POST /api/workspaces
{
  "name": "Restaurante Los Sabores S.L.",
  "type": "business"
}

POST /api/workspaces
{
  "name": "Consultoría Tech Solutions",
  "type": "business"
}

// Navegar entre ellos con WorkspaceSelector
GET /api/workspaces
[
  { _id: "ws1", name: "Finanzas Personales", myRole: "owner" },
  { _id: "ws2", name: "Restaurante Los Sabores S.L.", myRole: "owner" },
  { _id: "ws3", name: "Consultoría Tech Solutions", myRole: "owner" }
]
```

### Caso 2: Equipo colaborando

```javascript
// Propietario invita a contadores
POST /api/workspaces/ws2/invite
{
  "email": "contador1@example.com",
  "role": "editor"
}

POST /api/workspaces/ws2/invite
{
  "email": "contador2@example.com",
  "role": "editor"
}

POST /api/workspaces/ws2/invite
{
  "email": "cfo@example.com",
  "role": "admin"
}

// Los invitados aceptan
POST /api/workspaces/ws2/accept

// Ahora todos ven el mismo workspace
GET /api/workspaces/ws2/cashflow?year=2025
// Todos los miembros ven los mismos datos
```

### Caso 3: Cambiar permisos

```javascript
// Owner cambia rol de contador a admin
PUT /api/workspaces/ws2/members/userId123/role
{
  "role": "admin"
}

// Owner remueve miembro
DELETE /api/workspaces/ws2/members/userId456
```

---

## Resumen

✅ **Multi-Workspace**: Usuario puede tener N workspaces
✅ **Colaboración**: Workspace puede tener N miembros
✅ **Roles**: owner/admin/editor/viewer
✅ **Permisos**: Control granular por acción
✅ **Migración**: Script para convertir usuarios a workspaces
✅ **Frontend**: WorkspaceSelector para cambiar entre workspaces

🚀 **Implementación**:
1. Crear modelos Workspace y WorkspaceMember
2. Modificar Cashflow para usar workspaceId
3. Crear endpoints de workspaces y membresías
4. Añadir middleware de permisos
5. Migrar datos existentes
6. Crear WorkspaceSelector en frontend

🎯 **Resultado**: Sistema colaborativo completo donde usuarios pueden:
- Tener múltiples cashflows separados
- Compartir cashflows con otros usuarios
- Controlar quién puede ver/editar
- Trabajar en equipo en tiempo real
