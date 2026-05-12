Qué onda, este es el repo de mi proyecto de DevOps. Es una web app que mezcla **React** con un backend en **Node.js**.

### ¿Qué tiene el proyecto?
* **Frontend:** Una landing page pro hecha con React y Vite.
* **Backend:** Un servidor en Node.js que se encarga de la "magia" (rutas y conexión).
* **Base de Datos:** Uso MongoDB para guardar la info en un esquema.
* **Logs de auditoría:** Cada que pasa algo importante, el server lo anota solito en `/server/logs/app.log`.

---

### 📂 Estructura del Proyecto
* `/src`: Código fuente del Frontend (React).
* `/server`: Servidor de Node.js y controladores.
* `/server/logs`: Carpeta de almacenamiento de logs de auditoría.
* `docker-compose.yml`: Orquestación de servicios (App, DB, Server).
* `deploy.sh`: Script de Bash para despliegue automatizado.
* `backup_s3.sh`: Script para respaldo de datos en la nube.
* `start_app.sh` / `stop_app.sh`: Scripts para control de ciclo de vida de la app.

---

### Despliegue en Amazon EC2 (Docker)

La infraestructura se gestiona mediante contenedores para garantizar que corra igual en cualquier entorno.

1. **Preparación de la Instancia:**
   La instancia fue creada mediante **AWS CloudFormation** (IaC) para garantizar una infraestructura repetible.

2. **Ejecutar Despliegue Automatizado:**
   He desarrollado un script que soluciona problemas de compatibilidad con BuildKit en Amazon Linux 2023:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
    

3. **Acceso:**
La aplicación está disponible en la IP pública de la EC2 a través del puerto configurado:
http://54.226.0.92:5173

### Uso de AWS S3 y Respaldo Automatizado

Para cumplir con la gestión de archivos estáticos y backups (Punto 8 de la rúbrica):

    Integración S3: El script backup_s3.sh comprime los logs de auditoría y los sube al bucket millennium-global-backups-533267405990.

    Seguridad IAM: Se configuró un IAM Role (LabInstanceProfile) vinculado a la EC2 para permitir la subida de archivos a S3 sin exponer credenciales estáticas.


### Automatización con Cron Jobs

El servidor está configurado para ser autónomo y eficiente en el uso de recursos. Se sincronizó la zona horaria a America/Monterrey y se programaron las siguientes tareas en el crontab:
    Tarea	Horario         (Monterrey)	    Comando
    Encendido Automático    4:00 PM (16:00)	start_app.sh
    Apagado Automático	    4:00 AM (04:00)	stop_app.sh
    Backup a S3	           12:00 AM (00:00) backup_s3.sh

    Para verificar 
     ```bash
     crontab -l
    
### Cómo correrlo localmente

    **Backend: Entra a cd server, instala dependencias con npm install y corre con node server.js.**

    **Frontend: En la raíz del proyecto, instala dependencias y ejecuta npm run dev.**


### Puertos utilizados
* Puerto 3000: backend con express
* Puerto 5173: front end con React
* Puerto 27017: Base de Datos MongoDB
* Puerto 22: para acceder a la instancia por medio de ssh
* Puerto 80: Puerto http
