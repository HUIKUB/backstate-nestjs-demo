# HUIKUB-nginx

เอกสารสำหรับ Deployment และการตั้งค่า Service `huikub-nginx`  
รองรับการใช้งานใน Kubernetes Cluster (เช่น kind, GKE, EKS)

---

## 🔰 Overview
- ระบบนี้ใช้ Nginx เป็น reverse proxy สำหรับ backend service
- Build ผ่าน Docker image แล้ว deploy ด้วย `kubectl apply -f nginx.yaml`
- ใช้ร่วมกับ Backstage เพื่อดูสถานะของ Pod และ Metrics ได้

---

## 📚 Table of Contents
1. [Setup Environment](setup.md)
2. [Deployment Guide](deployment.md)
3. [Configuration](configuration.md)
4. [Troubleshooting](troubleshooting.md)
