# 🔍 CashFlow v4.0 - Sistema de Monitoreo

Sistema automático de monitoreo y auto-recuperación para el servidor en producción.

---

## 📊 Monitoreo Automático Configurado

### ✅ Qué se Monitorea

El sistema verifica cada 5 minutos:
- Docker está corriendo
- Contenedor MongoDB activo
- Contenedor Backend activo
- Contenedor Frontend activo
- Contenedor Nginx activo
- Health check HTTP responde
- MongoDB acepta conexiones

### 🔄 Auto-Recuperación

Si se detecta algún fallo, el sistema automáticamente:
1. Intenta reiniciar los contenedores
2. Espera 10 segundos
3. Verifica si el problema se solucionó
4. Registra el evento en el log

---

## 🛠️ Scripts Instalados

### `~/monitor-cashflow.sh`
Script principal de monitoreo que verifica todos los servicios.

```bash
# Ejecutar manualmente
~/monitor-cashflow.sh

# Ver última ejecución
cat ~/.cashflow-status
```

**Salida:**
- ✓ Verde: Todo funciona correctamente
- ✗ Rojo: Hay problemas detectados

### `~/auto-restart.sh`
Script de auto-recuperación que se ejecuta automáticamente.

```bash
# Ver log de eventos
tail -f ~/cashflow-monitor.log

# Ver últimas 50 líneas
tail -50 ~/cashflow-monitor.log
```

---

## 📅 Cron Jobs Activos

```cron
# Health monitor - cada hora
0 * * * * ~/monitor-cashflow.sh >> ~/cashflow-monitor.log 2>&1

# Auto-restart si unhealthy - cada 5 minutos
*/5 * * * * ~/auto-restart.sh
```

Ver cron jobs:
```bash
crontab -l
```

---

## 🚨 Notificaciones al Login

Cada vez que te conectas al servidor vía SSH, verás automáticamente:

```
=========================================
   CashFlow v4.0 - Estado del Servidor
=========================================
✓ Todos los servicios funcionando correctamente

Directorio: cd ~/cashflow
Comandos: cat ~/cashflow/SERVER-GUIDE.md
=========================================
```

Si hay problemas:
```
=========================================
   CashFlow v4.0 - Estado del Servidor
=========================================
✗ cashflow-backend no está corriendo
✗ Health check falló
✗ Se encontraron 2 problemas
```

---

## 📝 Logs y Diagnóstico

### Ver Log de Monitoreo

```bash
# Log completo
cat ~/cashflow-monitor.log

# Últimas entradas
tail -20 ~/cashflow-monitor.log

# Seguir en tiempo real
tail -f ~/cashflow-monitor.log

# Buscar errores
grep "unhealthy" ~/cashflow-monitor.log
grep "Restart" ~/cashflow-monitor.log
```

### Limpiar Logs Antiguos

```bash
# Rotar log (mantener últimas 100 líneas)
tail -100 ~/cashflow-monitor.log > ~/cashflow-monitor.log.tmp
mv ~/cashflow-monitor.log.tmp ~/cashflow-monitor.log

# O eliminar completamente
rm ~/cashflow-monitor.log
```

---

## 🔧 Comandos de Gestión

### Deshabilitar Monitoreo Temporalmente

```bash
# Comentar cron jobs
crontab -e
# Añadir # al inicio de las líneas
```

### Habilitar de Nuevo

```bash
crontab -e
# Quitar # del inicio de las líneas
```

### Ejecutar Check Manual

```bash
~/monitor-cashflow.sh
```

### Forzar Restart Manual

```bash
~/auto-restart.sh
```

---

## 🎯 Personalización

### Cambiar Frecuencia de Monitoreo

Editar crontab:
```bash
crontab -e
```

Ejemplos de frecuencias:
```cron
*/1 * * * *    # Cada minuto (no recomendado)
*/5 * * * *    # Cada 5 minutos (actual)
*/15 * * * *   # Cada 15 minutos
0 * * * *      # Cada hora
0 */6 * * *    # Cada 6 horas
```

### Añadir Más Checks

Editar `~/monitor-cashflow.sh`:
```bash
nano ~/monitor-cashflow.sh
```

Ejemplos de checks adicionales:
```bash
# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo -e "${RED}✗ Disco casi lleno: ${DISK_USAGE}%${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check memory
FREE_MEM=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
if [ $FREE_MEM -gt 90 ]; then
    echo -e "${RED}✗ Memoria alta: ${FREE_MEM}%${NC}"
    ISSUES=$((ISSUES + 1))
fi
```

---

## 📧 Notificaciones por Email (Opcional)

Para recibir emails cuando hay problemas:

### 1. Instalar mailutils

```bash
sudo apt-get install -y mailutils
```

### 2. Configurar en auto-restart.sh

```bash
nano ~/auto-restart.sh
```

Añadir después del restart:
```bash
if ! ~/monitor-cashflow.sh &> /dev/null; then
    echo "CashFlow v4.0 tiene problemas" | mail -s "ALERTA: CashFlow Down" tu@email.com
fi
```

---

## 🔍 Troubleshooting

### El monitoreo no se ejecuta

```bash
# Verificar que cron está corriendo
sudo systemctl status cron

# Ver logs de cron
sudo tail -f /var/log/syslog | grep CRON

# Verificar permisos
ls -l ~/monitor-cashflow.sh ~/auto-restart.sh
chmod +x ~/monitor-cashflow.sh ~/auto-restart.sh
```

### El script no encuentra los contenedores

```bash
# Verificar que el script usa la ruta correcta
cd ~/cashflow
docker compose -f docker-compose-simple.yml ps
```

### No aparece el monitor al hacer login

```bash
# Verificar .bashrc
tail -20 ~/.bashrc

# Forzar reload
source ~/.bashrc
```

---

## 📊 Métricas y Estadísticas

Ver cuántas veces se ejecutó el monitor:
```bash
grep -c "Todos los servicios" ~/cashflow-monitor.log
```

Ver cuántos restarts automáticos:
```bash
grep -c "attempting restart" ~/cashflow-monitor.log
```

Ver cuándo fue el último problema:
```bash
grep "unhealthy" ~/cashflow-monitor.log | tail -1
```

---

## 🆘 En Caso de Problemas Persistentes

Si el auto-restart no soluciona el problema:

1. **Ver qué está fallando:**
   ```bash
   ~/monitor-cashflow.sh
   ```

2. **Ver logs del servicio:**
   ```bash
   docker compose -f docker-compose-simple.yml logs [servicio]
   ```

3. **Restart manual completo:**
   ```bash
   cd ~/cashflow
   docker compose -f docker-compose-simple.yml down
   docker compose -f docker-compose-simple.yml up -d
   ```

4. **Verificar recursos:**
   ```bash
   df -h        # Disco
   free -h      # Memoria
   docker stats # Uso de contenedores
   ```

---

**Sistema configurado y activo desde:** 2025-10-11
**Frecuencia de checks:** Cada 5 minutos
**Auto-restart:** Habilitado
**Notificación SSH:** Habilitada
